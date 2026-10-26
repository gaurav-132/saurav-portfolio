function setVideoPreviewLoading(video: HTMLVideoElement, loading: boolean) {
  video.closest?.('.project-image')?.classList?.toggle('is-video-loading', loading);
}

export function startVideoPreview(video: HTMLVideoElement | null) {
  if (!video) return;
  setVideoPreviewLoading(video, video.readyState < 3);
  void video.play()
    .then(() => setVideoPreviewLoading(video, false))
    .catch(() => setVideoPreviewLoading(video, false));
}

export function stopVideoPreview(video: HTMLVideoElement | null) {
  if (!video) return;
  setVideoPreviewLoading(video, false);
  video.pause();
  video.currentTime = 0;
}

export function waitForVideoPreview(video: HTMLVideoElement) {
  setVideoPreviewLoading(video, true);
}

export function finishVideoPreview(video: HTMLVideoElement) {
  setVideoPreviewLoading(video, false);
}
