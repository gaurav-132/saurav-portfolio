export type PlayableMedia =
  | { kind: 'embed'; src: string }
  | { kind: 'video'; src: string }
  | { kind: 'none' };

export function mediaFromUrl(url: string): PlayableMedia {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return { kind: 'none' };

    if (parsed.hostname === 'youtu.be' || parsed.hostname === 'youtube.com' || parsed.hostname.endsWith('.youtube.com')) {
      const id =
        parsed.hostname === 'youtu.be'
          ? parsed.pathname.slice(1)
          : parsed.pathname === '/watch'
            ? parsed.searchParams.get('v')
            : parsed.pathname.split('/').filter(Boolean).at(-1);
      return id && /^[\w-]{6,20}$/.test(id)
        ? { kind: 'embed', src: `https://www.youtube-nocookie.com/embed/${id}` }
        : { kind: 'none' };
    }

    if (parsed.hostname === 'vimeo.com' || parsed.hostname.endsWith('.vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean).at(-1);
      return id && /^\d+$/.test(id)
        ? { kind: 'embed', src: `https://player.vimeo.com/video/${id}` }
        : { kind: 'none' };
    }

    return { kind: 'video', src: parsed.toString() };
  } catch {
    return { kind: 'none' };
  }
}

export function safeBackgroundImage(url: string) {
  return url.replaceAll('"', '%22');
}
