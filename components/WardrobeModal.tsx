/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import type { WardrobeItem } from '../types';
import { UploadCloudIcon, CheckCircleIcon, SearchIcon } from './icons';
import { urlToFile, getPlaceholderSrc } from '../lib/utils';
import ProductImage from './ProductImage';

interface WardrobePanelProps {
  onGarmentSelect: (garmentFile: File, garmentInfo: WardrobeItem) => void;
  activeGarmentIds: string[];
  isLoading: boolean;
  wardrobe: WardrobeItem[];
  isWardrobeLoading: boolean;
}

const WardrobePanel: React.FC<WardrobePanelProps> = ({ onGarmentSelect, activeGarmentIds, isLoading, wardrobe, isWardrobeLoading }) => {
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<'Women' | 'Men'>('Women');

    const filteredWardrobe = useMemo(() => {
        const lowercasedQuery = searchQuery.toLowerCase();

        // First, filter by the search query across all items.
        const searchFiltered = !searchQuery
            ? wardrobe
            : wardrobe.filter(item =>
                item.name.toLowerCase().includes(lowercasedQuery) ||
                (item.brand && item.brand.toLowerCase().includes(lowercasedQuery))
              );
              
        // Then, filter the search results by the active category.
        // Uncategorized items (like custom uploads) appear in both.
        return searchFiltered.filter(item => item.category === activeCategory || !item.category);
    }, [searchQuery, wardrobe, activeCategory]);


    const handleGarmentClick = async (item: WardrobeItem) => {
        if (isLoading || activeGarmentIds.includes(item.id)) return;
        setError(null);
        try {
            // If the item was from an upload, its URL is a blob URL. We need to fetch it to create a file.
            // If it was a default item, it's a regular URL. This handles both.
            const file = await urlToFile(item.image_urls[0], item.name);
            onGarmentSelect(file, item);
        } catch (err) {
            const detailedError = `Failed to load wardrobe item. This is often a CORS issue. Check the developer console for details.`;
            setError(detailedError);
            console.error(`[CORS Check] Failed to load and convert wardrobe item from URL: ${item.image_urls[0]}. The browser's console should have a specific CORS error message if that's the issue.`, err);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file.');
                return;
            }
            const customGarmentInfo: WardrobeItem = {
                id: `custom-${Date.now()}`,
                name: file.name,
                image_urls: [URL.createObjectURL(file)],
            };
            onGarmentSelect(file, customGarmentInfo);
        }
    };

  return (
    <div className="pt-6 border-t border-brand-text/30">
        <h2 className="text-xl font-serif tracking-wider text-brand-text mb-3">Wardrobe</h2>
        
        <div className="relative mb-3">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-subtle pointer-events-none" />
            <input
                type="text"
                placeholder="Search by name or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-brand-border rounded-md bg-brand-bg text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                aria-label="Search wardrobe"
            />
        </div>

        <div className="flex border-b border-brand-border mb-3">
            <button
                onClick={() => setActiveCategory('Women')}
                className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none ${activeCategory === 'Women' ? 'border-b-2 border-brand-teal text-brand-text font-semibold' : 'text-brand-subtle hover:text-brand-text'}`}
                aria-pressed={activeCategory === 'Women'}
            >
                Women
            </button>
            <button
                onClick={() => setActiveCategory('Men')}
                className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none ${activeCategory === 'Men' ? 'border-b-2 border-brand-teal text-brand-text font-semibold' : 'text-brand-subtle hover:text-brand-text'}`}
                aria-pressed={activeCategory === 'Men'}
            >
                Men
            </button>
        </div>

        {isWardrobeLoading ? (
            <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                        <div className="aspect-square w-full bg-brand-border rounded-lg" />
                    </div>
                ))}
            </div>
        ) : (
            <>
                <div className="grid grid-cols-3 gap-3">
                    {filteredWardrobe.map((item) => {
                    const isActive = activeGarmentIds.includes(item.id);
                    return (
                        <button
                        key={item.id}
                        onClick={() => handleGarmentClick(item)}
                        disabled={isLoading || isActive}
                        className="relative aspect-square border border-brand-border rounded-lg overflow-hidden transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal group disabled:opacity-60 disabled:cursor-not-allowed bg-brand-border"
                        aria-label={`Select ${item.name}`}
                        >
                        <ProductImage 
                            src={item.image_urls[0]} 
                            alt={item.name}
                            placeholderSrc={getPlaceholderSrc(item.image_urls[0])}
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white text-xs font-bold text-center p-1">{item.name}</p>
                        </div>
                        {isActive && (
                            <div className="absolute inset-0 bg-brand-teal/80 flex items-center justify-center">
                                <CheckCircleIcon className="w-8 h-8 text-white" />
                            </div>
                        )}
                        </button>
                    );
                    })}
                    <label htmlFor="custom-garment-upload" className={`relative aspect-square border-2 border-dashed border-brand-subtle rounded-lg flex flex-col items-center justify-center text-brand-subtle transition-colors ${isLoading ? 'cursor-not-allowed bg-gray-100' : 'hover:border-brand-teal hover:text-brand-teal cursor-pointer'}`}>
                        <UploadCloudIcon className="w-6 h-6 mb-1"/>
                        <span className="text-xs text-center">Upload</span>
                        <input id="custom-garment-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp, image/avif, image/heic, image/heif" onChange={handleFileChange} disabled={isLoading}/>
                    </label>
                </div>
                {filteredWardrobe.length === 0 && searchQuery && ( <p className="text-center text-sm text-brand-subtle mt-4">No items match your search.</p> )}
                {filteredWardrobe.length === 0 && !searchQuery && wardrobe.length > 0 && ( <p className="text-center text-sm text-brand-subtle mt-4">No items in the "{activeCategory.toLowerCase()}" category.</p> )}
                {wardrobe.length === 0 && !searchQuery && ( <p className="text-center text-sm text-brand-subtle mt-4">Your wardrobe is empty. Upload a garment to get started.</p> )}
            </>
        )}
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
    </div>
  );
};

export default WardrobePanel;