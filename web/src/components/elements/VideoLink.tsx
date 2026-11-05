"use client";

// Video thumbnail that plays in a modal <dialog> (the template's kit/video-dialog.js): YouTube
// as youtube-nocookie.com, Vimeo with dnt=1, autoplay on open, Esc / close / backdrop close it,
// the player is removed on close so the video stops, and focus returns to the link.
import { useRef, useState } from "react";

function embedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be" || host.endsWith("youtube.com")) {
      const id = host === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v") || u.pathname.split("/").pop();
      return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1` : null;
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = u.pathname.match(/(\d+)/)?.[1];
      return id ? `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export default function VideoLink({ url, thumbnail, title }: { url: string; thumbnail: string; title: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const embed = embedUrl(url);

  return (
    <>
      <a
        ref={linkRef}
        href={url}
        className="video-wrap"
        aria-label={`Play video: ${title}`}
        onClick={(e) => {
          if (!embed || e.metaKey || e.ctrlKey || e.shiftKey) return;
          e.preventDefault();
          setSrc(embed);
          dialogRef.current?.showModal();
        }}
      >
        <span className="play-wrap">
          <span className="fa-solid fa-play" aria-hidden="true" />
        </span>
        <img loading="lazy" src={thumbnail} alt="" className="img-fluid rounded" />
      </a>
      <dialog
        ref={dialogRef}
        className="kit-video-dialog"
        aria-label="Video"
        onClose={() => {
          setSrc(null);
          linkRef.current?.focus({ preventScroll: true });
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialogRef.current?.close();
        }}
      >
        <div className="kit-video-dialog__inner">
          <button type="button" className="kit-video-dialog__close" aria-label="Close video" onClick={() => dialogRef.current?.close()}>
            <span aria-hidden="true">&times;</span>
          </button>
          <div className="kit-video-dialog__stage">
            {src && <iframe src={src} title={title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />}
          </div>
        </div>
      </dialog>
    </>
  );
}
