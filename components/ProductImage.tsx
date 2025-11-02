/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { ImageIcon } from './icons';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string; // This prop is ignored for simplicity and robustness.
  eager?: boolean;
}

const ProductImage: React.FC<ProductImageProps> = ({ src, alt, className, eager = false }) => {
  const [hasError, setHasError] = useState(false);

  // Reset error state if the image source changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-brand-border", className)}>
      {hasError || !src ? (
         <div className="w-full h-full flex items-center justify-center bg-brand-border/80">
            <ImageIcon className="w-8 h-8 text-brand-subtle/50" />
         </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
          className="w-full h-full object-cover object-center"
        />
      )}
    </div>
  );
};

export default ProductImage;