'use client';

import { useState } from "react";

/** Two-line clamped text with an inline "more/less" toggle — keeps the
 *  store header compact while still letting people read the full blurb. */
export function ExpandableText({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 120;
  return (
    <p className="text-sm leading-relaxed" style={{ color: '#666' }}>
      <span style={!open && long ? { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } : undefined}>
        {text}
      </span>
      {long && (
        <button
          onClick={() => setOpen((o) => !o)}
          style={{ marginTop: 2, background: 'none', border: 'none', padding: 0, color: '#e8401c', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
        >
          {open ? 'less' : 'more'}
        </button>
      )}
    </p>
  );
}
