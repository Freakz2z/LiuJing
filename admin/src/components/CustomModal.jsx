import { useEffect } from 'react';

const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function CustomModal({
  open,
  onCancel,
  title,
  children,
  footer,
  width,
  top = 0,
  showHeader = true,
}) {
  if (!open) return null;

  return (
    <div className="custom-modal-overlay">
      <div
        className="custom-modal-container"
        style={{ 
          marginTop: top,
        }}
      >
        {/* 头部 */}
        {showHeader && (
          <div className="custom-modal-header">
            <div className="custom-modal-title-wrap">
              {typeof title === 'string' ? (
                <span className="custom-modal-title">{title}</span>
              ) : (
                title
              )}
            </div>
            <button className="custom-modal-close" onClick={onCancel}>
              <IconClose />
            </button>
          </div>
        )}

        {/* 内容区域 */}
        <div className="custom-modal-body" style={!showHeader ? { paddingTop: 16 } : {}}>
          {children}
        </div>

        {/* 底部 */}
        {footer && (
          <div className="custom-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
