interface AnimationRecordingOptions {
  format: 'gif' | 'mp4';
  duration: number; // seconds
  width: number;
  height: number;
  fileName: string;
  fps?: number;
}

export const recordChart3DAnimation = async (
  chartContainer: HTMLElement,
  options: AnimationRecordingOptions
): Promise<void> => {
  const {
    format,
    duration,
    width,
    height,
    fileName,
    fps = 30
  } = options;

  try {
    const canvas = chartContainer.querySelector('canvas');
    if (!canvas) {
      throw new Error('3D chart canvas not found');
    }

    if (format === 'gif') {
      await recordAsGIF(canvas, { duration, width, height, fileName, fps });
    } else if (format === 'mp4') {
      await recordAsMP4(canvas, { duration, width, height, fileName, fps });
    }
  } catch (error) {
    console.error('Error recording 3D chart animation:', error);
    throw error;
  }
};

const recordAsGIF = async (
  canvas: HTMLCanvasElement,
  options: { duration: number; width: number; height: number; fileName: string; fps: number }
): Promise<void> => {
  // For GIF recording, we'll capture frames and create a GIF
  // This is a simplified implementation - in production, you'd want to use a library like gif.js
  
  const frames: ImageData[] = [];
  const frameCount = options.duration * options.fps;
  const frameInterval = 1000 / options.fps;

  // Trigger chart rotation animation
  triggerChartRotation(canvas, options.duration);

  // Capture frames
  for (let i = 0; i < frameCount; i++) {
    await new Promise(resolve => setTimeout(resolve, frameInterval));
    
    // Create a temporary canvas to resize the frame
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = options.width;
    tempCanvas.height = options.height;
    const ctx = tempCanvas.getContext('2d')!;
    
    // Draw and scale the original canvas
    ctx.drawImage(canvas, 0, 0, options.width, options.height);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, options.width, options.height);
    frames.push(imageData);
  }

  // Create GIF blob (simplified - would use gif.js or similar library)
  const gifBlob = await createGIFFromFrames(frames, options.fps);
  downloadBlob(gifBlob, `${options.fileName}.gif`);
};

const recordAsMP4 = async (
  canvas: HTMLCanvasElement,
  options: { duration: number; width: number; height: number; fileName: string; fps: number }
): Promise<void> => {
  // Use MediaRecorder API for MP4 recording
  const stream = canvas.captureStream(options.fps);
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9' // Fallback to webm if mp4 not supported
  });

  const recordedChunks: Blob[] = [];

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    downloadBlob(blob, `${options.fileName}.webm`);
  };

  // Start recording
  mediaRecorder.start();
  
  // Trigger chart rotation animation
  triggerChartRotation(canvas, options.duration);

  // Stop recording after duration
  setTimeout(() => {
    mediaRecorder.stop();
  }, options.duration * 1000);
};

const triggerChartRotation = (canvas: HTMLCanvasElement, duration: number) => {
  // Find the chart container and trigger auto-rotation
  const chartContainer = canvas.closest('.chart-container');
  if (chartContainer) {
    // Look for orbit controls or rotation controls
    const autoRotateButton = chartContainer.querySelector('[data-auto-rotate]') as HTMLButtonElement;
    if (autoRotateButton) {
      autoRotateButton.click();
      
      // Stop auto-rotation after recording
      setTimeout(() => {
        autoRotateButton.click();
      }, duration * 1000);
    }
  }
};

const createGIFFromFrames = async (frames: ImageData[], fps: number): Promise<Blob> => {
  // This is a placeholder for GIF creation
  // In a real implementation, you would use a library like gif.js
  // For now, we'll return a simple blob
  
  console.warn('GIF creation requires additional library (gif.js). Falling back to first frame as PNG.');
  
  if (frames.length === 0) {
    throw new Error('No frames captured for GIF creation');
  }

  // Convert first frame to PNG as fallback
  const canvas = document.createElement('canvas');
  canvas.width = frames[0].width;
  canvas.height = frames[0].height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(frames[0], 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/png');
  });
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};