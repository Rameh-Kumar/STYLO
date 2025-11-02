/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { WardrobeItem } from '../types';
import { ExternalLinkIcon } from './icons';
import ProductImage from './ProductImage';

interface ShopTheLookProps {
    items: (WardrobeItem | null)[];
    onShopClick: (item: WardrobeItem) => void;
}

const ShopTheLook: React.FC<ShopTheLookProps> = ({ items, onShopClick }) => {
    const shoppableItems = items
        .filter((garment): garment is NonNullable<typeof garment> & { product_url: string } => !!(garment && garment.product_url));


    if (shoppableItems.length === 0) {
        return null; // Don't render the component if there's nothing to shop
    }

    return (
        <div className="pt-6 border-t border-brand-text/30">
            <h2 className="text-xl font-serif tracking-wider text-brand-text mb-3">Shop the Look</h2>
            <div className="space-y-3">
                {shoppableItems.map(item => (
                    <div key={item.id} className="bg-white/60 p-3 rounded-lg flex items-center gap-4 border border-brand-border">
                        <div className="relative flex-shrink-0 w-16 h-16 bg-brand-border rounded-md overflow-hidden">
                            <ProductImage src={item.image_urls[0]} alt={item.name} />
                        </div>
                        <div className="flex-grow overflow-hidden">
                            <p className="text-sm font-semibold text-brand-text truncate" title={item.name}>{item.name}</p>
                            <p className="text-xs text-brand-subtle">{item.brand}</p>
                        </div>
                        <button
                            onClick={() => onShopClick(item)}
                            className="flex-shrink-0 flex items-center justify-center text-center bg-brand-teal text-white font-semibold py-2 px-3 rounded-md transition-colors duration-200 ease-in-out hover:bg-teal-700 active:scale-95 text-sm"
                            aria-label={`Shop ${item.name}`}
                        >
                            Shop
                            <ExternalLinkIcon className="w-4 h-4 ml-1.5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShopTheLook;