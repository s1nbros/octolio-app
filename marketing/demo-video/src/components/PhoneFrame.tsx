import { theme } from '../theme';

/**
 * Renders a stylized iPhone-style frame containing children.
 * Sized to fill most of the 1080×1920 canvas while leaving room for subtitles.
 */
export const PhoneFrame: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => {
  return (
    <div
      style={{
        width: 720,
        height: 1420,
        borderRadius: 72,
        background: '#000',
        padding: 14,
        boxShadow:
          '0 40px 120px rgba(110,90,230,0.35), 0 0 0 2px rgba(255,255,255,0.06), inset 0 0 0 1px rgba(255,255,255,0.04)',
        position: 'relative',
        ...style,
      }}
    >
      {/* Inner screen */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 58,
          background: theme.bg,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Notch */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 200,
            height: 32,
            borderRadius: 18,
            background: '#000',
            zIndex: 5,
          }}
        />
        {children}
      </div>
    </div>
  );
};
