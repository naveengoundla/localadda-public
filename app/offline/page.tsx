'use client';

export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        textAlign: 'center',
        background: '#fff',
        color: '#1a1a2e',
      }}
    >
      <div style={{ fontSize: 48 }}>📡</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>You&apos;re offline</h1>
      <p style={{ color: '#888', fontSize: 14, maxWidth: 320, margin: 0 }}>
        Looks like you&apos;ve lost your connection. Pages you&apos;ve already
        visited still work — reconnect to discover more local stores.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        style={{
          marginTop: 8,
          padding: '10px 22px',
          borderRadius: 99,
          border: 'none',
          background: '#e8401c',
          color: '#fff',
          fontWeight: 700,
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  );
}
