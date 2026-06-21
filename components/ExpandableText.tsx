'use client';

import { useState } from "react";

interface Props {
  text: string;
  lines?: number;
  color?: string;
  moreColor?: string;
  size?: number;
}

/** Clamped text with an inline more/less toggle — used compactly on the
 *  store banner (white) and elsewhere. */
export function ExpandableText({ text, lines = 2, color = '#666', moreColor = '#e8401c', size = 13 }: Props) {
  const [open, setOpen] = useState(false);
  const long = text.length > (lines === 1 ? 52 : 120);
  return (
    <p style={{ color, fontSize: size, lineHeight: 1.45, margin: 0 }}>
      <span style={!open && long ? { display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden' } : undefined}>
        {text}
      </span>
      {long && (
        <button onClick={() => setOpen((o) => !o)}
          style={{ marginLeft: 4, background: 'none', border: 'none', padding: 0, color: moreColor, fontWeight: 700, fontSize: size, cursor: 'pointer' }}>
          {open ? 'less' : 'more'}
        </button>
      )}
    </p>
  );
}
