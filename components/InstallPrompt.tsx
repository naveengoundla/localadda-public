'use client';

import { useEffect, useState } from 'react';

// Minimal type for the non-standard beforeinstallprompt event (Chromium/Android).
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'la_install_dismissed';
const DISMISS_DAYS = 14; // re-offer after this many days if dismissed

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already installed (launched standalone) → never show.
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Recently dismissed → stay quiet.
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_DAYS * 864e5) return;

    const onPrompt = (e: Event) => {
      e.preventDefault(); // stop Chrome's mini-infobar; we drive it ourselves
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice; // accepted → 'appinstalled' fires; dismissed → keep it simple
    setVisible(false);
    setDeferred(null);
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div role="dialog" aria-label="Install LocalAdda" style={styles.bar}>
      <img src="/icon-192.png" alt="" width={40} height={40} style={styles.icon} />
      <div style={styles.text}>
        <strong style={{ fontSize: 14 }}>Install LocalAdda</strong>
        <span style={{ fontSize: 12, color: '#666' }}>Quick access from your home screen</span>
      </div>
      <button type="button" onClick={install} style={styles.install}>Install</button>
      <button type="button" onClick={dismiss} aria-label="Dismiss" style={styles.close}>✕</button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    position: 'fixed',
    left: 12,
    right: 12,
    bottom: 'max(12px, env(safe-area-inset-bottom))',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    background: '#fff',
    border: '1px solid #eee',
    borderRadius: 14,
    boxShadow: '0 6px 24px rgba(0,0,0,0.14)',
  },
  icon: { borderRadius: 9, flexShrink: 0 },
  text: { display: 'flex', flexDirection: 'column', lineHeight: 1.25, flex: 1, minWidth: 0 },
  install: {
    flexShrink: 0,
    border: 'none',
    background: '#e8401c',
    color: '#fff',
    fontWeight: 700,
    fontSize: 13,
    padding: '9px 18px',
    borderRadius: 99,
    cursor: 'pointer',
  },
  close: {
    flexShrink: 0,
    border: 'none',
    background: 'transparent',
    color: '#999',
    fontSize: 16,
    cursor: 'pointer',
    padding: 4,
  },
};
