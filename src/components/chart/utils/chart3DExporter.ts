interface ExportOptions {
  format?: 'png' | 'jpg' | 'webp';
  quality?: number;
  includeBackground?: boolean;
}

export const exportChart3D = async (
  chartContainer: HTMLElement,
  dimensions: { width: number; height: number },
  options: ExportOptions = {}
): Promise<Blob> => {
  const {
    format = 'png',
    quality = 0.95,
    includeBackground = true
  } = options;

  try {
    // Find the canvas element within the 3D chart container
    const canvas = chartContainer.querySelector('canvas');
    if (!canvas) {
      throw new Error('3D chart canvas not found');
    }

    // Get the WebGL context to read pixels
    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
    if (!gl) {
      throw new Error('WebGL context not available');
    }

    // Create a temporary canvas for export
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = dimensions.width;
    exportCanvas.height = dimensions.height;
    const ctx = exportCanvas.getContext('2d')!;

    // Set background if needed
    if (includeBackground) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    }

    // Scale and draw the 3D canvas content
    const scaleX = dimensions.width / canvas.width;
    const scaleY = dimensions.height / canvas.height;
    
    // Preserve aspect ratio
    const scale = Math.min(scaleX, scaleY);
    const scaledWidth = canvas.width * scale;
    const scaledHeight = canvas.height * scale;
    const offsetX = (dimensions.width - scaledWidth) / 2;
    const offsetY = (dimensions.height - scaledHeight) / 2;

    ctx.drawImage(
      canvas,
      offsetX,
      offsetY,
      scaledWidth,
      scaledHeight
    );

    // Convert to blob with specified format and quality
    return new Promise((resolve, reject) => {
      exportCanvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        `image/${format}`,
        quality
      );
    });
  } catch (error) {
    console.error('Error exporting 3D chart:', error);
    throw error;
  }
};

export const captureChart3DFrame = async (
  chartContainer: HTMLElement
): Promise<ImageData> => {
  const canvas = chartContainer.querySelector('canvas');
  if (!canvas) {
    throw new Error('3D chart canvas not found');
  }

  const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
  if (!gl) {
    throw new Error('WebGL context not available');
  }

  // Read pixels from WebGL context
  const pixels = new Uint8Array(canvas.width * canvas.height * 4);
  gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  // Create ImageData object
  const imageData = new ImageData(canvas.width, canvas.height);
  
  // WebGL has flipped Y-axis, so we need to flip the image
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const srcIndex = ((canvas.height - 1 - y) * canvas.width + x) * 4;
      const dstIndex = (y * canvas.width + x) * 4;
      
      imageData.data[dstIndex] = pixels[srcIndex];       // R
      imageData.data[dstIndex + 1] = pixels[srcIndex + 1]; // G
      imageData.data[dstIndex + 2] = pixels[srcIndex + 2]; // B
      imageData.data[dstIndex + 3] = pixels[srcIndex + 3]; // A
    }
  }

  return imageData;
};