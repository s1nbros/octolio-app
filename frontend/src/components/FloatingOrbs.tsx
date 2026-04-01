export function FloatingOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Primary blue-purple orb */}
      <div
        className="absolute animate-orb-1"
        style={{
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, hsl(239, 84%, 67%, 0.12) 0%, transparent 70%)',
          top: '-100px',
          left: '-100px',
          filter: 'blur(40px)',
        }}
      />
      {/* Brand green orb */}
      <div
        className="absolute animate-orb-2"
        style={{
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, hsl(160, 55%, 55%, 0.1) 0%, transparent 70%)',
          bottom: '100px',
          right: '-80px',
          filter: 'blur(50px)',
        }}
      />
      {/* Small accent orb */}
      <div
        className="absolute"
        style={{
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, hsl(280, 70%, 65%, 0.08) 0%, transparent 70%)',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(60px)',
          animation: 'orb-float-2 26s ease-in-out infinite reverse',
        }}
      />
    </div>
  );
}
