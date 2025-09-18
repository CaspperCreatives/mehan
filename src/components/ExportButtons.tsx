import React, { useState } from 'react';
import { ExportManager, ExportData } from '../utils/exportUtils';
import { useLanguage, getTranslation } from '../utils/translations';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faShare } from '@fortawesome/free-solid-svg-icons';

interface ExportButtonsProps {
  profile: any;
  aiAnalysis: any;
  iconOnly?: boolean;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ profile, aiAnalysis, iconOnly = true }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'image' | 'pdf' | 'shareable' | null>(null);
  const { language: currentLanguage } = useLanguage();

  const handleExport = async (type: 'image' | 'pdf' | 'shareable') => {
    if (!profile || !aiAnalysis) {
      return;
    }

    setIsExporting(true);
    setExportType(type);

    try {
      // Use the correct percentage value from profileScore
      const score = aiAnalysis?.profileScore?.percentage || 0;

      // Resolve profile fields from multiple possible sources
      const aiProfile = aiAnalysis?.profile?.[0] || aiAnalysis?.data?.profile?.[0] || {};
      const firstName = aiProfile?.firstName || profile?.basicInfo?.name?.split(' ')?.[0] || profile?.name?.split(' ')?.[0] || '';
      const lastName = aiProfile?.lastName || (profile?.basicInfo?.name?.split(' ')?.slice(1)?.join(' ') || profile?.name?.split(' ')?.slice(1)?.join(' ') || '');
      const resolvedName = [firstName, lastName].filter(Boolean).join(' ').trim() || profile?.basicInfo?.name || profile?.name || 'Unknown';

      const resolvedHeadline = (
        profile?.basicInfo?.headline ||
        profile?.headline ||
        aiProfile?.headline ||
        aiProfile?.occupation ||
        ''
      );

      const resolvedImage = (
        profile?.basicInfo?.profileImage ||
        profile?.profileImage ||
        aiProfile?.pictureUrl ||
        undefined
      );
      
      const exportData: ExportData = {
        name: resolvedName,
        score: score,
        headline: resolvedHeadline,
        profileImage: resolvedImage,
        analysisDate: new Date().toLocaleDateString()
      };

      let filename = '';
      let dataUrl = '';
      let blob: Blob | null = null;

      switch (type) {
        case 'shareable':
          dataUrl = await ExportManager.generateShareableImage(exportData);
          filename = `linkedin-profile-score-${exportData.name.replace(/\s+/g, '-')}.png`;
          ExportManager.downloadImage(dataUrl, filename);
          break;
        case 'pdf':
          blob = await ExportManager.generatePDF(exportData);
          filename = `linkedin-profile-analysis-${exportData.name.replace(/\s+/g, '-')}.pdf`;
          ExportManager.downloadPDF(blob, filename);
          break;
        case 'image':
          dataUrl = await ExportManager.exportAsImage();
          filename = `linkedin-profile-analysis-${exportData.name.replace(/\s+/g, '-')}.png`;
          ExportManager.downloadImage(dataUrl, filename);
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // Icon buttons with tooltips
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      {/* <button
        title={getTranslation(currentLanguage, 'exportPDF') || 'Export PDF'}
        onClick={() => handleExport('pdf')}
        disabled={isExporting}
        className="refresh-button"
        style={{
          background: 'none',
          border: 'none',
          cursor: isExporting ? 'not-allowed' : 'pointer',
          fontSize: '20px',
          color: '#0B66C2',
          opacity: isExporting && exportType !== 'pdf' ? 0.5 : 1
        }}
      >
       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.4" d="M20.5 10.19H17.61C15.24 10.19 13.31 8.26 13.31 5.89V3C13.31 2.45 12.86 2 12.31 2H8.07C4.99 2 2.5 4 2.5 7.57V16.43C2.5 20 4.99 22 8.07 22H15.93C19.01 22 21.5 20 21.5 16.43V11.19C21.5 10.64 21.05 10.19 20.5 10.19Z" fill="#0B66C2"/>
      <path d="M15.7997 2.20999C15.3897 1.79999 14.6797 2.07999 14.6797 2.64999V6.13999C14.6797 7.59999 15.9197 8.80999 17.4297 8.80999C18.3797 8.81999 19.6997 8.81999 20.8297 8.81999C21.3997 8.81999 21.6997 8.14999 21.2997 7.74999C19.8597 6.29999 17.2797 3.68999 15.7997 2.20999Z" fill="#0B66C2"/>
      <path d="M12.2804 14.72C11.9904 14.43 11.5104 14.43 11.2204 14.72L10.5004 15.44V11.25C10.5004 10.84 10.1604 10.5 9.75043 10.5C9.34043 10.5 9.00043 10.84 9.00043 11.25V15.44L8.28043 14.72C7.99043 14.43 7.51043 14.43 7.22043 14.72C6.93043 15.01 6.93043 15.49 7.22043 15.78L9.22043 17.78C9.23043 17.79 9.24043 17.79 9.24043 17.8C9.30043 17.86 9.38043 17.91 9.46043 17.95C9.56043 17.98 9.65043 18 9.75043 18C9.85043 18 9.94043 17.98 10.0304 17.94C10.1204 17.9 10.2004 17.85 10.2804 17.78L12.2804 15.78C12.5704 15.49 12.5704 15.01 12.2804 14.72Z" fill="#0B66C2"/>
      </svg>

      </button> */}
      {/* <button
        title={getTranslation(currentLanguage, 'exportImage') || 'Export as Image'}
        onClick={() => handleExport('image')}
        disabled={isExporting}
        style={{
          background: 'none',
          border: 'none',
          cursor: isExporting ? 'not-allowed' : 'pointer',
          fontSize: '20px',
          color: '#0B66C2',
          opacity: isExporting && exportType !== 'image' ? 0.5 : 1
        }}
      >🖼️</button> */}
      <button
        title={getTranslation(currentLanguage, 'exportShareable') || 'Export Shareable Image'}
        onClick={() => handleExport('shareable')}
        disabled={isExporting}
        className="refresh-button"
        style={{
          background: 'none',
          border: 'none',
          cursor: isExporting ? 'not-allowed' : 'pointer',
          fontSize: '20px',
          color: '#0B66C2',
          opacity: isExporting && exportType !== 'shareable' ? 0.5 : 1
        }}
          >
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21.9996 13.9001V16.1901C21.9996 19.8301 19.8296 22.0001 16.1896 22.0001H7.80957C5.25957 22.0001 3.41957 20.9301 2.55957 19.0301L2.66957 18.9501L7.58957 15.6501C8.38957 15.1101 9.51957 15.1701 10.2296 15.7901L10.5696 16.0701C11.3496 16.7401 12.6096 16.7401 13.3896 16.0701L17.5496 12.5001C18.3296 11.8301 19.5896 11.8301 20.3696 12.5001L21.9996 13.9001Z" fill="#0B66C2"/>
          <path opacity="0.4" d="M20.97 8H18.03C16.76 8 16 7.24 16 5.97V3.03C16 2.63 16.08 2.29 16.22 2C16.21 2 16.2 2 16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.19C2 17.28 2.19 18.23 2.56 19.03L2.67 18.95L7.59 15.65C8.39 15.11 9.52 15.17 10.23 15.79L10.57 16.07C11.35 16.74 12.61 16.74 13.39 16.07L17.55 12.5C18.33 11.83 19.59 11.83 20.37 12.5L22 13.9V7.81C22 7.8 22 7.79 22 7.78C21.71 7.92 21.37 8 20.97 8Z" fill="#0B66C2"/>
          <path d="M9.00012 10.3801C10.3146 10.3801 11.3801 9.31456 11.3801 8.00012C11.3801 6.68568 10.3146 5.62012 9.00012 5.62012C7.68568 5.62012 6.62012 6.68568 6.62012 8.00012C6.62012 9.31456 7.68568 10.3801 9.00012 10.3801Z" fill="#0B66C2"/>
          <path d="M20.97 1H18.03C16.76 1 16 1.76 16 3.03V5.97C16 7.24 16.76 8 18.03 8H20.97C22.24 8 23 7.24 23 5.97V3.03C23 1.76 22.24 1 20.97 1ZM21.19 4.31C21.07 4.43 20.91 4.49 20.75 4.49C20.59 4.49 20.43 4.43 20.31 4.31L20.13 4.13V6.37C20.13 6.72 19.85 7 19.5 7C19.15 7 18.87 6.72 18.87 6.37V4.13L18.69 4.31C18.45 4.55 18.05 4.55 17.81 4.31C17.57 4.07 17.57 3.67 17.81 3.43L19.06 2.18C19.11 2.13 19.18 2.09 19.25 2.06C19.27 2.05 19.29 2.05 19.31 2.04C19.36 2.02 19.41 2.01 19.47 2.01C19.49 2.01 19.51 2.01 19.53 2.01C19.6 2.01 19.66 2.02 19.73 2.05C19.74 2.05 19.74 2.05 19.75 2.05C19.82 2.08 19.88 2.12 19.93 2.17C19.94 2.18 19.94 2.18 19.95 2.18L21.2 3.43C21.44 3.67 21.44 4.07 21.19 4.31Z" fill="#0B66C2"/>
          </svg>

          </button>
    </div>
  );
}; 