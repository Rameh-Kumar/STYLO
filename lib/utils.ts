/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFriendlyErrorMessage(error: unknown, context: string): string {
    let rawMessage = 'An unknown error occurred.';
    if (error instanceof Error) {
        rawMessage = error.message;
    } else if (typeof error === 'string') {
        rawMessage = error;
    } else if (error) {
        rawMessage = String(error);
    }

    const lowerCaseMessage = rawMessage.toLowerCase();

    // Handle Quota/Rate Limit Errors
    if (lowerCaseMessage.includes('quota') || lowerCaseMessage.includes('rate limit') || lowerCaseMessage.includes('429')) {
        return "We're experiencing high demand right now. Please wait a moment and try again.";
    }

    // Handle Unsupported File Type
    if (lowerCaseMessage.includes("unsupported mime type")) {
        let mimeType = 'this file type';
        // Try to extract the specific MIME type from the message for a more informative error
        const mimeMatch = rawMessage.match(/Unsupported MIME type: ([\w\/.-]+)/);
        if (mimeMatch && mimeMatch[1]) {
            mimeType = `'${mimeMatch[1]}'`;
        }
        return `Sorry, ${mimeType} is not supported. Please upload a standard image format like PNG, JPEG, or WEBP.`;
    }

    // Handle Safety/Blocking Errors
    if (lowerCaseMessage.includes('blocked') || lowerCaseMessage.includes('safety')) {
        return "Your request was blocked for safety reasons. This can happen with certain images or prompts. Please try a different image.";
    }
    
    // Handle specific error when the model returns text instead of an image
    if (lowerCaseMessage.includes('model did not return an image')) {
        return "The AI couldn't create an image for this request. It might be too complex or unusual. Please try a different image or garment.";
    }

    // Generic fallback for other errors
    console.error(`[Unhandled Error] Context: ${context} | Raw Message: ${rawMessage}`);
    return `An unexpected error occurred while trying to ${context.toLowerCase()}. Please try again. If the problem continues, there might be a temporary issue with the service.`;
}

export const addWatermark = (imageUrl: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Prepare watermark text
      const padding = img.width * 0.03;
      const fontSize = Math.max(18, Math.round(img.width * 0.05));
      ctx.font = `bold ${fontSize}px "Instrument Serif", serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      
      // Add a subtle shadow for better contrast
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Draw the watermark
      ctx.fillText('STYLON', canvas.width - padding, canvas.height - padding);

      // Convert canvas to a high-quality JPEG blob for smaller file size
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas toBlob failed'));
        }
      }, 'image/jpeg', 0.9);
    };
    img.onerror = () => {
      reject(new Error('Failed to load image for watermarking. It might be a CORS issue if the image is from another domain.'));
    };
    img.src = imageUrl;
  });
};

// Helper to convert image URL to a File object using a canvas to bypass potential CORS issues.
export const urlToFile = (url: string, filename: string): Promise<File> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.setAttribute('crossOrigin', 'anonymous');

        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context.'));
            }
            ctx.drawImage(image, 0, 0);

            canvas.toBlob((blob) => {
                if (!blob) {
                    return reject(new Error('Canvas toBlob failed.'));
                }
                const mimeType = blob.type || 'image/png';
                const file = new File([blob], filename, { type: mimeType });
                resolve(file);
            }, 'image/png');
        };

        image.onerror = (error) => {
            reject(new Error(`Could not load image from URL for canvas conversion. Error: ${error}`));
        };

        image.src = url;
    });
};

const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
): void => {
  const words = text.split(' ');
  let line = '';
  let lineCount = 1;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      if (lineCount === maxLines) {
        let truncatedLine = line.trim();
        while (ctx.measureText(truncatedLine + '...').width > maxWidth) {
          truncatedLine = truncatedLine.slice(0, -1);
        }
        ctx.fillText(truncatedLine + '...', x, y);
        return;
      }
      ctx.fillText(line.trim(), x, y);
      line = words[i] + ' ';
      y += lineHeight;
      lineCount++;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, y);
};

interface CreateProductShareImageOptions {
  productImageUrl: string;
  productName: string;
  productBrand?: string;
  productPrice?: number | null;
}

export const createProductShareImage = ({
  productImageUrl,
  productName,
  productBrand,
  productPrice,
}: CreateProductShareImageOptions): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return reject(new Error('Could not get canvas context'));
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      const canvasWidth = 800;
      const imageHeight = canvasWidth / aspectRatio;
      const padding = 40;
      const footerHeight = 200;
      const canvasHeight = imageHeight + footerHeight;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      ctx.fillStyle = '#FFF8F0';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      ctx.drawImage(img, 0, 0, canvasWidth, imageHeight);
      
      const gradient = ctx.createLinearGradient(0, imageHeight - 100, 0, imageHeight);
      gradient.addColorStop(0, 'rgba(255, 248, 240, 0)');
      gradient.addColorStop(1, '#FFF8F0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, imageHeight - 100, canvasWidth, 100);
      
      const contentStartX = padding;
      const contentStartY = imageHeight + padding;
      const contentMaxWidth = canvasWidth - padding * 2;
      
      ctx.font = 'bold 36px "Instrument Serif", serif';
      ctx.fillStyle = '#2a2a2a';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('STYLON', contentStartX, contentStartY - 10);
      
      if (productPrice) {
        ctx.font = 'bold 32px "Instrument Serif", serif';
        ctx.fillStyle = '#008080';
        ctx.textAlign = 'right';
        ctx.fillText(`₹${productPrice.toLocaleString('en-IN')}`, canvasWidth - padding, contentStartY - 5);
        ctx.textAlign = 'left';
      }
      
      ctx.font = '600 28px "Inter", sans-serif';
      ctx.fillStyle = '#2a2a2a';
      const brandText = productBrand ? `${productBrand} - ` : '';
      const fullTitle = `${brandText}${productName}`;
      wrapText(ctx, fullTitle, contentStartX, contentStartY + 45, contentMaxWidth, 34, 2);
      
      ctx.font = '20px "Inter", sans-serif';
      ctx.fillStyle = '#8a8a8a';
      ctx.fillText('See details & try it on virtually', contentStartX, imageHeight + footerHeight - padding - 5);

      canvas.toBlob((blob) => {
        if (!blob) {
          return reject(new Error('Canvas toBlob failed'));
        }
        const file = new File([blob], `${productName.replace(/\s+/g, '-')}-share.png`, { type: 'image/png' });
        resolve(file);
      }, 'image/png', 0.95);
    };

    img.onerror = () => {
      reject(new Error('Failed to load product image for sharing canvas.'));
    };

    img.src = productImageUrl;
  });
};


export const getRetailerName = (url: string): string => {
    try {
        const hostname = new URL(url).hostname.toLowerCase();
        
        // Mapping of domain keywords to correct retailer names
        const retailerMap: { [key: string]: string } = {
            'ajio': 'Ajio',
            'ajiio': 'Ajio', // Handle typo from database/URL
            'bitli': 'Ajio',
            'amazon': 'Amazon',
            'flipkart': 'Flipkart',
            'fkrt': 'Flipkart', // Handle short URLs like fkrt.it
            'fktr': 'Flipkart', // Handle typo/alternative from screenshot
            'meesho': 'Meesho',
            'nykaafashion': 'Nykaa',
            'myntra': 'Myntra',
            'myntr': 'Myntra',
        };

        // Find the first matching keyword in the hostname
        for (const keyword in retailerMap) {
            if (hostname.includes(keyword)) {
                return retailerMap[keyword];
            }
        }
        
        // Fallback to the original logic for unknown retailers
        const parts = hostname.replace('www.', '').split('.');
        if (parts.length > 0 && parts[0]) {
            const retailer = parts[0];
            return retailer.charAt(0).toUpperCase() + retailer.slice(1);
        }

        return 'the retailer'; // More robust fallback
    } catch (e) {
        console.error("Error parsing URL for retailer name:", e);
        return 'the retailer'; // General fallback
    }
};

// Helper function to create a low-quality placeholder URL for Supabase images
export const getPlaceholderSrc = (url: string): string | undefined => {
    if (!url || !url.includes('supabase.co')) return undefined;
    try {
        const urlObj = new URL(url);
        // Path for Supabase storage transformations is /storage/v1/render/image/public/...
        // The original path is /storage/v1/object/public/...
        if (urlObj.pathname.startsWith('/storage/v1/object/public/')) {
            urlObj.pathname = urlObj.pathname.replace(
                '/storage/v1/object/public/',
                '/storage/v1/render/image/public/'
            );
            urlObj.searchParams.set('width', '50');
            urlObj.searchParams.set('quality', '50');
            urlObj.searchParams.set('resize', 'contain');
            return urlObj.toString();
        }
        return undefined;
    } catch (e) {
        console.error("Failed to create placeholder URL", e);
        return undefined;
    }
};
