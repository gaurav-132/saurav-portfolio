import assert from 'node:assert/strict';
import test from 'node:test';
import { mediaFromUrl, safeBackgroundImage } from '../src/lib/media.ts';
import { startVideoPreview, stopVideoPreview } from '../src/lib/video-preview.ts';

test('Neon media route is playable as a video source', () => {
  assert.deepEqual(mediaFromUrl('/api/media?key=portfolio%2Fexample.mp4'), {
    kind: 'video',
    src: '/api/media?key=portfolio%2Fexample.mp4',
  });
});

test('direct video links remain playable', () => {
  assert.deepEqual(mediaFromUrl('https://cdn.example.com/film.mp4'), {
    kind: 'video',
    src: 'https://cdn.example.com/film.mp4',
  });
});

test('YouTube and Vimeo links are converted to privacy-friendly embeds', () => {
  assert.equal(mediaFromUrl('https://youtu.be/abcDEF12345').src, 'https://www.youtube-nocookie.com/embed/abcDEF12345');
  assert.equal(mediaFromUrl('https://vimeo.com/1234567').src, 'https://player.vimeo.com/video/1234567');
});

test('unsupported and unsafe protocols are rejected', () => {
  assert.deepEqual(mediaFromUrl('javascript:alert(1)'), { kind: 'none' });
  assert.deepEqual(mediaFromUrl('not a URL'), { kind: 'none' });
});

test('background image URLs cannot break out of their quoted CSS value', () => {
  assert.equal(safeBackgroundImage('https://cdn.example.com/a"b.jpg'), 'https://cdn.example.com/a%22b.jpg');
});

test('hover preview starts playback and ignores autoplay rejection', async () => {
  let played = false;
  const video = { play: () => { played = true; return Promise.reject(new Error('autoplay blocked')); } };
  startVideoPreview(video);
  await Promise.resolve();
  assert.equal(played, true);
});

test('leaving a card pauses its video and resets it to the first frame', () => {
  let paused = false;
  const video = { currentTime: 8, pause: () => { paused = true; } };
  stopVideoPreview(video);
  assert.equal(paused, true);
  assert.equal(video.currentTime, 0);
});
