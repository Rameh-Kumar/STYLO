/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { OutfitLayer } from '../types';
import { Trash2Icon } from './icons';
import ProductImage from './ProductImage';
import { getPlaceholderSrc } from '../lib/utils';

interface OutfitStackProps {
  outfitHistory: OutfitLayer[];
  onRemoveLastGarment: () => void;
}

const OutfitStack: React.FC<OutfitStackProps> = ({ outfitHistory, onRemoveLastGarment }) => {
  return (
    <div className="flex flex-col">
      <h2 className="text-xl font-serif tracking-wider text-brand-text border-b border-brand-text/30 pb-2 mb-3">Outfit Stack</h2>
      <div className="space-y-2">
        {outfitHistory.map((layer, index) => (
          <div
            key={layer.garment?.id || 'base'}
            className="flex items-center justify-between bg-white/50 p-2 rounded-lg animate-fade-in border border-brand-border"
          >
            <div className="flex items-center overflow-hidden">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 mr-3 text-xs font-bold text-brand-text/70 bg-brand-border rounded-full">
                  {index + 1}
                </span>
                {layer.garment && (
                    <div className="relative flex-shrink-0 w-12 h-12 bg-brand-border rounded-md mr-3 overflow-hidden">
                        <ProductImage 
                            src={layer.garment.image_urls[0]} 
                            alt={layer.garment.name}
                            placeholderSrc={getPlaceholderSrc(layer.garment.image_urls[0])}
                        />
                    </div>
                )}
                <span className="font-semibold text-brand-text truncate" title={layer.garment?.name}>
                  {layer.garment ? layer.garment.name : 'Base Model'}
                </span>
            </div>
            {index > 0 && index === outfitHistory.length - 1 && (
               <button
                onClick={onRemoveLastGarment}
                className="flex-shrink-0 text-brand-subtle hover:text-red-600 transition-colors p-2 rounded-md hover:bg-red-50"
                aria-label={`Remove ${layer.garment?.name}`}
              >
                <Trash2Icon className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
        {outfitHistory.length === 1 && (
            <p className="text-center text-sm text-brand-subtle pt-4">Your stacked items will appear here. Select an item from the wardrobe below.</p>
        )}
      </div>
    </div>
  );
};

export default OutfitStack;