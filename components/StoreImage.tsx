'use client';

import { useState } from "react";
import Image from "next/image";

interface Props {
  src?: string | null;
  alt: string;
  emoji: string;
  gradient: string;
  sizes?: string;
  emojiSize?: number;
}

/** Image with graceful fallback — if src is missing OR fails to load,
 *  shows the category gradient + emoji instead of a broken-image icon. */
export function StoreImage({ src, alt, emoji, gradient, sizes = "108px", emojiSize = 30 }: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div style={{
        position: 'absolute',
        inset: 0,
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: emojiSize,
      }}>
        {emoji}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes={sizes}
      onError={() => setFailed(true)}
    />
  );
}
