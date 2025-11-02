/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WardrobeItem } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, HeartIcon } from './icons';
import ProductGridSkeleton from './ProductGridSkeleton';
import ProductImage from './ProductImage';
import { getPlaceholderSrc } from '../lib/utils';

interface CollectionPageProps {
  category: 'Women' | 'Men';
  wardrobe: WardrobeItem[];
  isWardrobeLoading: boolean;
  onProductSelect: (item: WardrobeItem) => void;
  onToggleWishlist: (itemId: string) => void;
  isInWishlist: (itemId: string) => boolean;
}

const CollectionPage: React.FC<CollectionPageProps> = ({ category, wardrobe, isWardrobeLoading, onProductSelect, onToggleWishlist, isInWishlist }) => {
  const [activeProductType, setActiveProductType] = useState<string>('All');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ canScrollLeft: false, canScrollRight: false });

  // Reset filter when category changes
  useEffect(() => {
    setActiveProductType('All');
  }, [category]);

  const availableProductTypes = useMemo(() => {
    const types = new Set<string>();
    wardrobe
      .filter(item => item.category === category)
      .forEach(item => {
        if (item.product_type) {
          const formattedType = item.product_type.charAt(0).toUpperCase() + item.product_type.slice(1);
          types.add(formattedType);
        }
      });
    const sortedTypes = Array.from(types).sort();
    return ['All', ...sortedTypes];
  }, [wardrobe, category]);


  const filteredWardrobe = useMemo(() => {
    const categoryFiltered = wardrobe.filter(item => item.category === category);

    if (activeProductType === 'All') {
      return categoryFiltered;
    }

    return categoryFiltered.filter(item =>
      item.product_type?.toLowerCase() === activeProductType.toLowerCase()
    );
  }, [wardrobe, category, activeProductType]);

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) {
        const hasOverflow = el.scrollWidth > el.clientWidth;
        setScrollState({
            canScrollLeft: el.scrollLeft > 5,
            canScrollRight: hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 5,
        });
    }
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
        const timer = setTimeout(checkScroll, 100);
        el.addEventListener('scroll', checkScroll);
        const resizeObserver = new ResizeObserver(checkScroll);
        resizeObserver.observe(el);

        return () => {
            clearTimeout(timer);
            el.removeEventListener('scroll', checkScroll);
            resizeObserver.unobserve(el);
        };
    }
  }, [checkScroll, availableProductTypes]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (el) {
        const scrollAmount = el.clientWidth * 0.8;
        el.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    }
  };
  
  return (
    <div className="w-full min-h-screen flex flex-col bg-brand-bg">
      <main className="flex-grow">
        <div className="w-full bg-cover bg-center py-16 sm:py-24 text-center" style={{ backgroundImage: category === 'Women' ? "url('https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" : "url('https://images.pexels.com/photos/842811/pexels-photo-842811.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }}>
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight drop-shadow-lg">{category}'s Collection</h1>
            <p className="mt-2 text-lg text-white/90 drop-shadow-md">Discover curated styles, ready for you.</p>
        </div>

        {availableProductTypes.length > 1 && (
          <div className="sticky top-16 z-30 bg-brand-bg/80 backdrop-blur-md border-b border-brand-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative">
                <div ref={scrollContainerRef} className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
                  {availableProductTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setActiveProductType(type)}
                      className={`px-4 py-1.5 text-sm font-semibold rounded-full flex-shrink-0 transition-colors duration-200 ${
                        activeProductType === type
                          ? 'bg-brand-teal text-white shadow-sm'
                          : 'bg-brand-surface text-brand-text hover:bg-brand-border border border-brand-border'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                
                <AnimatePresence>
                  {scrollState.canScrollLeft && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute left-0 top-0 h-full flex items-center bg-gradient-to-r from-brand-bg from-0% via-brand-bg via-70% to-transparent pr-10">
                      <button onClick={() => handleScroll('left')} className="desktop-scroll-arrows w-8 h-8 rounded-full bg-brand-surface border border-brand-border shadow-md flex items-center justify-center hover:bg-brand-border transition-colors active:scale-95" aria-label="Scroll left">
                        <ChevronLeftIcon className="w-5 h-5 text-brand-text" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <AnimatePresence>
                  {scrollState.canScrollRight && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute right-0 top-0 h-full flex items-center justify-end bg-gradient-to-l from-brand-bg from-0% via-brand-bg via-70% to-transparent pl-10">
                      <button onClick={() => handleScroll('right')} className="desktop-scroll-arrows w-8 h-8 rounded-full bg-brand-surface border border-brand-border shadow-md flex items-center justify-center hover:bg-brand-border transition-colors active:scale-95" aria-label="Scroll right">
                        <ChevronRightIcon className="w-5 h-5 text-brand-text" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        <div id="collection" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {isWardrobeLoading ? (
                <ProductGridSkeleton count={10} />
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
                        {filteredWardrobe.map(item => (
                            <div key={item.id} className="group relative animate-fade-in">
                                <button onClick={() => onProductSelect(item)} className="w-full text-left">
                                    <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-brand-border relative">
                                        <ProductImage
                                            src={item.image_urls[0]}
                                            alt={item.name}
                                            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                                            placeholderSrc={getPlaceholderSrc(item.image_urls[0])}
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="px-6 py-2.5 text-sm font-semibold text-brand-text bg-white/90 rounded-md cursor-pointer backdrop-blur-sm shadow-md">
                                                View Details
                                            </div>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => onToggleWishlist(item.id)}
                                    className="absolute top-2 right-2 z-10 p-2 bg-white/70 rounded-full backdrop-blur-sm transition-all duration-200 hover:bg-white"
                                    aria-label={isInWishlist(item.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                                >
                                    <HeartIcon className={`w-5 h-5 transition-all ${isInWishlist(item.id) ? 'text-red-500 fill-current' : 'text-brand-text'}`} />
                                </button>
                                <div className="mt-2 text-left">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-grow overflow-hidden pr-2">
                                            <h3 className="text-sm font-semibold text-brand-text truncate" title={item.name}>
                                                {item.name}
                                            </h3>
                                            {item.brand && <p className="text-xs text-brand-subtle">{item.brand}</p>}
                                        </div>
                                        {item.price && (
                                            <p className="text-sm font-semibold text-brand-text flex-shrink-0">
                                                ₹{item.price.toLocaleString('en-IN')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {!isWardrobeLoading && filteredWardrobe.length === 0 && (
                        <div className="col-span-full text-center py-16">
                            <p className="text-brand-subtle">No items found in the {category} collection.</p>
                        </div>
                    )}
                </>
            )}
        </div>
      </main>
    </div>
  );
};

export default CollectionPage;