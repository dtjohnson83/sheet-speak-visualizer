import { TemporalAnimationState, TemporalAnimationControls } from '@/hooks/useTemporalAnimation';

export interface TemporalRecordingOptions {
  format: 'gif' | 'mp4';
  duration?: number; // seconds - if not provided, records one full animation cycle
  width: number;
  height: number;
  fileName: string;
  fps?: number;
  captureFrameInterval?: number; // ms between frame captures
}

export const recordTemporalAnimation = async (
  chartContainer: HTMLElement,
  animationState: TemporalAnimationState,
  animationControls: TemporalAnimationControls,
  options: TemporalRecordingOptions,
  onProgress?: (progress: number) => void
): Promise<void> => {
  const {
    format,
    duration,
    width,
    height,
    fileName,
    fps = 24,
    captureFrameInterval = 100
  } = options;

  try {
    // Reset animation to start
    animationControls.reset();
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for reset

    const totalFrames = animationState.totalFrames;
    const recordingDuration = duration || (totalFrames * captureFrameInterval / 1000);
    const frames: HTMLCanvasElement[] = [];

    console.log(`Recording temporal animation: ${totalFrames} frames over ${recordingDuration}s`);

    // Capture frames
    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      // Jump to specific frame
      animationControls.jumpToFrame(frameIndex);
      await new Promise(resolve => setTimeout(resolve, 50)); // Wait for frame to render

      // Capture current frame
      const canvas = await captureChartFrame(chartContainer, width, height);
      frames.push(canvas);

      // Report progress
      if (onProgress) {
        onProgress((frameIndex + 1) / totalFrames);
      }
    }

    // Create and download animation
    if (format === 'gif') {
      await createGIFFromCanvases(frames, fileName, fps);
    } else if (format === 'mp4') {
      await createVideoFromCanvases(frames, fileName, fps, recordingDuration);
    }

    console.log(`Temporal animation recorded successfully: ${fileName}.${format}`);
  } catch (error) {
    console.error('Error recording temporal animation:', error);
    throw error;
  }
};

const captureChartFrame = async (
  container: HTMLElement,
  width: number,
  height: number
): Promise<HTMLCanvasElement> => {
  // Use html2canvas to capture the chart
  const html2canvas = (await import('html2canvas')).default;
  
  const canvas = await html2canvas(container, {
    width,
    height,
    scale: 1,
    backgroundColor: null,
    useCORS: true,
    allowTaint: true
  });

  return canvas;
};

const createGIFFromCanvases = async (
  canvases: HTMLCanvasElement[],
  fileName: string,
  fps: number
): Promise<void> => {
  // For now, create a simple animated sequence by downloading frames
  // In production, you'd want to use a library like gif.js
  console.warn('GIF creation requires gif.js library. Downloading first frame as PNG.');
  
  if (canvases.length > 0) {
    const link = document.createElement('a');
    link.href = canvases[0].toDataURL('image/png');
    link.download = `${fileName}-frame-1.png`;
    link.click();
  }
};

const createVideoFromCanvases = async (
  canvases: HTMLCanvasElement[],
  fileName: string,
  fps: number,
  duration: number
): Promise<void> => {
  if (canvases.length === 0) return;

  // Create a video from canvas frames using MediaRecorder
  const firstCanvas = canvases[0];
  const stream = firstCanvas.captureStream(fps);
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9'
  });

  const recordedChunks: Blob[] = [];

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.webm`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Start recording and play through frames
  mediaRecorder.start();

  // Simulate frame playback by updating canvas content
  const frameInterval = 1000 / fps;
  for (let i = 0; i < canvases.length; i++) {
    await new Promise(resolve => setTimeout(resolve, frameInterval));
    const ctx = firstCanvas.getContext('2d')!;
    ctx.clearRect(0, 0, firstCanvas.width, firstCanvas.height);
    ctx.drawImage(canvases[i], 0, 0);
  }

  // Stop recording
  setTimeout(() => {
    mediaRecorder.stop();
  }, duration * 1000);
};

export const isTemporalRecordingSupported = (): boolean => {
  return typeof MediaRecorder !== 'undefined' && 
         typeof HTMLCanvasElement.prototype.captureStream === 'function';
};