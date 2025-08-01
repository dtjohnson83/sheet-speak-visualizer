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
  // Check if this is a 3D chart with WebGL canvas
  const webglCanvas = container.querySelector('canvas');
  
  if (webglCanvas) {
    const gl = webglCanvas.getContext('webgl') || webglCanvas.getContext('webgl2');
    if (gl) {
      // Use WebGL direct pixel reading for 3D charts
      return await captureWebGLFrame(webglCanvas, width, height);
    }
  }
  
  // Fallback to html2canvas for 2D charts
  const chartElement = container.querySelector('.recharts-wrapper') || 
                      container.querySelector('[data-chart]') ||
                      container;
  
  const html2canvas = (await import('html2canvas')).default;
  
  const canvas = await html2canvas(chartElement as HTMLElement, {
    width,
    height,
    scale: 1,
    backgroundColor: null,
    useCORS: true,
    allowTaint: true,
    ignoreElements: (element) => {
      return element.tagName === 'BUTTON' || 
             element.classList.contains('temporal-controls') ||
             element.getAttribute('data-ignore-recording') === 'true';
    }
  });

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (ctx) {
    canvas.setAttribute('willReadFrequently', 'true');
  }

  return canvas;
};

const captureWebGLFrame = async (
  sourceCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number
): Promise<HTMLCanvasElement> => {
  const gl = sourceCanvas.getContext('webgl') || sourceCanvas.getContext('webgl2');
  if (!gl) {
    throw new Error('WebGL context not available');
  }

  // Create output canvas
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = targetWidth;
  outputCanvas.height = targetHeight;
  const ctx = outputCanvas.getContext('2d')!;

  // Set white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // Calculate scaling to maintain aspect ratio
  const scaleX = targetWidth / sourceCanvas.width;
  const scaleY = targetHeight / sourceCanvas.height;
  const scale = Math.min(scaleX, scaleY);
  
  const scaledWidth = sourceCanvas.width * scale;
  const scaledHeight = sourceCanvas.height * scale;
  const offsetX = (targetWidth - scaledWidth) / 2;
  const offsetY = (targetHeight - scaledHeight) / 2;

  // Draw the WebGL canvas content to our output canvas
  ctx.drawImage(
    sourceCanvas,
    offsetX,
    offsetY,
    scaledWidth,
    scaledHeight
  );

  return outputCanvas;
};

const createGIFFromCanvases = async (
  canvases: HTMLCanvasElement[],
  fileName: string,
  fps: number
): Promise<void> => {
  try {
    // Try to use gif.js for proper GIF creation
    const GIF = (await import('gif.js')).default;
    
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: canvases[0].width,
      height: canvases[0].height,
      workerScript: '/node_modules/gif.js/dist/gif.worker.js'
    });

    // Add frames to gif
    const delay = 1000 / fps;
    canvases.forEach(canvas => {
      gif.addFrame(canvas, { delay });
    });

    gif.on('finished', (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.gif`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });

    gif.render();
  } catch (error) {
    console.warn('GIF creation failed, downloading first frame as PNG:', error);
    
    if (canvases.length > 0) {
      const link = document.createElement('a');
      link.href = canvases[0].toDataURL('image/png');
      link.download = `${fileName}-frame-1.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};

const createVideoFromCanvases = async (
  canvases: HTMLCanvasElement[],
  fileName: string,
  fps: number,
  duration: number
): Promise<void> => {
  if (canvases.length === 0) return;

  // Create a video from canvas frames sequentially
  const canvas = document.createElement('canvas');
  canvas.width = canvases[0].width;
  canvas.height = canvases[0].height;
  const ctx = canvas.getContext('2d')!;

  // Try to use modern video formats, fallback to WebM
  const supportedTypes = [
    'video/mp4;codecs=h264',
    'video/mp4',
    'video/webm;codecs=vp9',
    'video/webm'
  ];

  let mimeType = 'video/webm';
  for (const type of supportedTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      mimeType = type;
      break;
    }
  }

  const stream = canvas.captureStream(fps);
  const mediaRecorder = new MediaRecorder(stream, { mimeType });
  const recordedChunks: Blob[] = [];

  return new Promise((resolve, reject) => {
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Use appropriate file extension
      const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
      link.download = `${fileName}.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      resolve();
    };

    mediaRecorder.onerror = (event) => {
      reject(new Error('Recording failed'));
    };

    // Start recording
    mediaRecorder.start();

    // Play through frames sequentially
    const frameInterval = 1000 / fps;
    let currentFrame = 0;

    const drawNextFrame = () => {
      if (currentFrame < canvases.length) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(canvases[currentFrame], 0, 0);
        currentFrame++;
        setTimeout(drawNextFrame, frameInterval);
      } else {
        // Stop recording after all frames are played
        setTimeout(() => mediaRecorder.stop(), 500);
      }
    };

    drawNextFrame();
  });
};

export const isTemporalRecordingSupported = (): boolean => {
  return typeof MediaRecorder !== 'undefined' && 
         typeof HTMLCanvasElement.prototype.captureStream === 'function';
};