import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf/dist/jspdf.umd.min.js';

export interface ExportData {
  name: string;
  score: number;
  headline: string;
  profileImage?: string;
  analysisDate: string;
}

export class ExportManager {
  private static readonly TOOL_NAME = 'LinkedIn Profile Scorer';
  private static readonly TOOL_WEBSITE = 'linkedinprofilescorer.com';

  /**
   * Generate a shareable image for LinkedIn feeds
   */
  static async generateShareableImage(data: ExportData): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    // Set canvas size for optimal LinkedIn sharing
    canvas.width = 1200;
    canvas.height = 630;

    // Create elegant gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#667eea'); // Modern purple-blue
    gradient.addColorStop(0.5, '#764ba2'); // Purple
    gradient.addColorStop(1, '#f093fb'); // Pink
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Branding at the top
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '16px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Calculated by Mehan.com', canvas.width / 2, 40);

    // Date at the top
    ctx.font = '16px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText(data.analysisDate, canvas.width / 2, 70);

    // Add elegant decorative elements
    // Large subtle circles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.arc(canvas.width - 150, 150, 200, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(150, canvas.height - 150, 150, 0, 2 * Math.PI);
    ctx.fill();

    // Small accent circles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.arc(100, 100, 50, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(canvas.width - 100, canvas.height - 100, 60, 0, 2 * Math.PI);
    ctx.fill();

    // Add subtle geometric patterns
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.3);
    ctx.lineTo(canvas.width, canvas.height * 0.3);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.7);
    ctx.lineTo(canvas.width, canvas.height * 0.7);
    ctx.stroke();

    // Large elegant score circle on the left side
    const scoreX = canvas.width * 0.25; // Left side
    const scoreY = canvas.height / 2; // Center vertically
    const radius = 180; // Bigger circle

    // Determine score vibe and colors
    let scoreVibe: 'success' | 'average' | 'bad';
    let progressColor: string;
    let textColor: string;
    
    if (data.score >= 75) {
      scoreVibe = 'success';
      progressColor = '#22c55e'; // Success green
      textColor = '#15803d'; // Darker green for text
    } else if (data.score >= 25) {
      scoreVibe = 'average';
      progressColor = '#eab308'; // Average yellow
      textColor = '#a16207'; // Darker yellow for text
    } else {
      scoreVibe = 'bad';
      progressColor = '#ef4444'; // Bad red
      textColor = '#dc2626'; // Darker red for text
    }

    // Outer glow effect with vibe color
    const glowGradient = ctx.createRadialGradient(scoreX, scoreY, radius, scoreX, scoreY, radius + 20);
    glowGradient.addColorStop(0, `${progressColor}40`); // 25% opacity
    glowGradient.addColorStop(1, `${progressColor}00`); // 0% opacity
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(scoreX, scoreY, radius + 20, 0, 2 * Math.PI);
    ctx.fill();

    // Score circle background with gradient
    const circleGradient = ctx.createRadialGradient(scoreX - 30, scoreY - 30, 0, scoreX, scoreY, radius);
    circleGradient.addColorStop(0, `${progressColor}30`); // 18% opacity
    circleGradient.addColorStop(1, `${progressColor}10`); // 6% opacity
    ctx.fillStyle = circleGradient;
    ctx.beginPath();
    ctx.arc(scoreX, scoreY, radius, 0, 2 * Math.PI);
    ctx.fill();

    // Score circle progress with vibe gradient
    const progressGradient = ctx.createLinearGradient(scoreX - radius, scoreY - radius, scoreX + radius, scoreY + radius);
    progressGradient.addColorStop(0, progressColor);
    progressGradient.addColorStop(1, `${progressColor}dd`); // Slightly transparent
    
    ctx.beginPath();
    ctx.arc(scoreX, scoreY, radius, -Math.PI / 2, (-Math.PI / 2) + (2 * Math.PI * data.score / 100));
    ctx.fillStyle = progressGradient;
    ctx.fill();

    // Inner circle for depth
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(scoreX, scoreY, radius - 15, 0, 2 * Math.PI);
    ctx.fill();

    // Score text with vibe color and shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillStyle = textColor;
    ctx.font = 'bold 100px Arial, sans-serif'; // Bigger font for bigger circle
    ctx.textAlign = 'center';
    ctx.fillText(`${data.score}%`, scoreX, scoreY + 30);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Add localized text inside circle with vibe color
    ctx.fillStyle = `${textColor}cc`; // 80% opacity
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.textAlign = 'center';
    
    // Detect language and add appropriate text
    const isArabic = /[\u0600-\u06FF]/.test(data.name) || /[\u0600-\u06FF]/.test(data.headline);
    const localizedText = isArabic ? 'تقييم حساب اللنكد إن' : 'LinkedIn Profile Score';
    
    // Position text below the score percentage
    ctx.fillText(localizedText, scoreX, scoreY + 80);

    // Right side content (50% width)
    const rightContentX = canvas.width * 0.75; // Right side
    const rightContentStartY = canvas.height * 0.3; // Start from upper part

    // Name with elegant typography on the right
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial, sans-serif'; // Bigger font for prominence
    ctx.textAlign = 'center';
    ctx.fillText(data.name, rightContentX, rightContentStartY);

    // Headline with refined styling on the right
    ctx.font = '300 26px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    const headlineLines = this.wrapText(ctx, data.headline, canvas.width * 0.4, 26); // 40% of canvas width
    headlineLines.forEach((line, index) => {
      const lineY = rightContentStartY + 80 + (index * 40);
      if (lineY < canvas.height - 50) { // Leave 50px margin at bottom
        ctx.fillText(line, rightContentX, lineY);
      }
    });

    return canvas.toDataURL('image/png');
  }

  /**
   * Generate a PDF report
   */
  static async generatePDF(data: ExportData): Promise<Blob> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;

    // Add header
    pdf.setFillColor(11, 102, 194); // LinkedIn blue
    pdf.rect(0, 0, pageWidth, 40, 'F');

    // Tool name in header
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(this.TOOL_NAME, pageWidth / 2, 25, { align: 'center' });

    // Reset text color
    pdf.setTextColor(0, 0, 0);

    // Title
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('LinkedIn Profile Analysis Report', pageWidth / 2, 60, { align: 'center' });

    // Profile information
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Profile Information', margin, 90);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Name: ${data.name}`, margin, 110);
    pdf.text(`Headline: ${data.headline}`, margin, 120);
    pdf.text(`Analysis Date: ${data.analysisDate}`, margin, 130);

    // Score section
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Profile Score', pageWidth / 2, 160, { align: 'center' });

    // Score circle (simplified as text for PDF)
    pdf.setFontSize(48);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(11, 102, 194);
    pdf.text(`${data.score}%`, pageWidth / 2, 190, { align: 'center' });

    // Reset text color
    pdf.setTextColor(0, 0, 0);

    // Score interpretation
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const scoreText = this.getScoreInterpretation(data.score);
    pdf.text(scoreText, pageWidth / 2, 210, { align: 'center' });

    // Footer
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Generated by ${this.TOOL_NAME}`, pageWidth / 2, pageHeight - 30, { align: 'center' });
    pdf.text(this.TOOL_WEBSITE, pageWidth / 2, pageHeight - 20, { align: 'center' });

    return pdf.output('blob');
  }

  /**
   * Export current profile analysis as image
   */
  static async exportAsImage(): Promise<string> {
    const sidebar = document.getElementById('linkedin-profile-scorer-sidebar');
    if (!sidebar) {
      throw new Error('Profile sidebar not found');
    }

    // Temporarily show the sidebar if hidden
    const wasHidden = sidebar.classList.contains('sidebar-hidden');
    if (wasHidden) {
      sidebar.classList.remove('sidebar-hidden');
    }

    try {
      const canvas = await html2canvas(sidebar, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        width: sidebar.scrollWidth,
        height: sidebar.scrollHeight
      });

      return canvas.toDataURL('image/png');
    } finally {
      // Restore original state
      if (wasHidden) {
        sidebar.classList.add('sidebar-hidden');
      }
    }
  }

  /**
   * Download image as file
   */
  static downloadImage(dataUrl: string, filename: string) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Download PDF as file
   */
  static downloadPDF(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Helper function to wrap text
   */
  private static wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  /**
   * Get score interpretation text
   */
  private static getScoreInterpretation(score: number): string {
    if (score >= 90) return 'Excellent profile! You\'re in the top tier of LinkedIn profiles.';
    if (score >= 80) return 'Great profile! You have a strong professional presence.';
    if (score >= 70) return 'Good profile! There\'s room for improvement but you\'re on the right track.';
    if (score >= 60) return 'Fair profile! Consider implementing our recommendations to improve.';
    return 'Your profile needs work. Check our recommendations to enhance your professional presence.';
  }
} 