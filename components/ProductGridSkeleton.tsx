/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface ProductGridSkeletonProps {
  count?: number;
}

const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = ({ count = 10 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-[3/4] w-full bg-brand-border rounded-lg"></div>
          <div className="mt-2 space-y-2">
            <div className="h-4 bg-brand-border rounded w-4/5"></div>
            <div className="h-3 bg-brand-border rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGridSkeleton;