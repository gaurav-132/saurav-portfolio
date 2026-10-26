'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { PlayableMedia } from '@/lib/media';

export default function ProjectPlayer({
  title,
  playable,
  poster,
  fallbackUrl,
}: {
  title: string;
  playable: PlayableMedia;
  poster?: string;
  fallbackUrl?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (playable.kind === 'video') {
    if (failed) {
      return (
        <div className="glass project-media project-playback-fallback" role="status">
          <p>This video could not play in the browser.</p>
          {fallbackUrl && <a className="pill" href={fallbackUrl} target="_blank" rel="noreferrer">Open original video ↗</a>}
        </div>
      );
    }
    return (
      <video
        className="project-media"
        controls
        playsInline
        preload="metadata"
        poster={poster}
        src={playable.src}
        onError={() => setFailed(true)}
      />
    );
  }

  if (playable.kind === 'embed') {
    return (
      <>
        <iframe
          className="project-media embed"
          title={`${title} video`}
          src={playable.src}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        {fallbackUrl && (
          <p className="project-video-fallback">
            <span>If playback is unavailable:</span>
            <a className="pill" href={fallbackUrl} target="_blank" rel="noreferrer">Open original video ↗</a>
          </p>
        )}
      </>
    );
  }

  return (
    <div className="glass project-media project-playback-fallback">
      {poster && <Image className="project-fallback-poster" src={poster} unoptimized width={1920} height={1080} alt={`${title} project cover`} />}
      {fallbackUrl && <p>This video source can’t be embedded here. Open it to watch.</p>}
      {fallbackUrl && <a className="pill" href={fallbackUrl} target="_blank" rel="noreferrer">Open video source ↗</a>}
    </div>
  );
}
