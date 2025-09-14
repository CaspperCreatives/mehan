import React from 'react';

interface ContentLoadingSkeletonProps {
  sectionName: string;
}

export const ContentLoadingSkeleton: React.FC<ContentLoadingSkeletonProps> = ({ sectionName }) => {
  return (
    <div className="content-loading-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-title"></div>
        <div className="skeleton-subtitle"></div>
      </div>
      <div className="skeleton-content">
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line short"></div>
      </div>
      <div className="skeleton-footer">
        <div className="skeleton-button"></div>
      </div>
    </div>
  );
};
