/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WardrobeItem } from '../types';
import { XIcon, SearchIcon } from './icons';
import ProductImage from './ProductImage';
import { getPlaceholderSrc } from '../lib/utils';
import { useAnalytics } from '../hooks/useAnalytics';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  wardrobe: WardrobeItem[];
  onProductSelect: (item: WardrobeItem) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, wardrobe, onProductSelect }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { logEvent } = useAnalytics();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Auto-focus the input when the modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery(''); // Reset query on open
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) {
      return [];
    }
    const lowerCaseQuery = query.toLowerCase();
    return wardrobe.filter(item =>
      item.name.toLowerCase().includes(lowerCaseQuery) ||
      (item.brand && item.brand.toLowerCase().includes(lowerCaseQuery)) ||
      (item.category && item.category.toLowerCase().includes(lowerCaseQuery)) ||
      (item.product_type && item.product_type.toLowerCase().includes(lowerCaseQuery)) ||
      (item.description && item.description.toLowerCase().includes(lowerCaseQuery))
    );
  }, [query, wardrobe]);
  
  const handleProductClick = (item: WardrobeItem) => {
    logEvent('search', { search_term: query });
    onProductSelect(item);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-brand-bg/95 backdrop-blur-sm z-50 flex flex-col items-center"
          onClick={onClose}
        >
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
              <div className="flex items-center gap-4 py-4 border-b border-brand-border">
                  <SearchIcon className="w-6 h-6 text-brand-subtle flex-shrink-0" />
                  <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search for products, brands, and more..."
                      className="w-full bg-transparent text-xl text-brand-text placeholder-brand-subtle focus:outline-none"
                  />
                  <button onClick={onClose} className="p-2 rounded-full text-brand-subtle hover:bg-brand-border/60 transition-colors" aria-label="Close search">
                      <XIcon className="w-6 h-6" />
                  </button>
              </div>
          </motion.div>
          
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow overflow-y-auto py-6" onClick={(e) => e.stopPropagation()}>
              <AnimatePresence>
                {query.trim() && filteredProducts.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10"
                  >
                    {filteredProducts.map(item => (
                      <div key={item.id} className="group relative">
                          <button onClick={() => handleProductClick(item)} className="w-full text-left">
                              <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-brand-border relative">
                                  <ProductImage
                                      src={item.image_urls[0]}
                                      alt={item.name}
                                      className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                                      placeholderSrc={getPlaceholderSrc(item.image_urls[0])}
                                  />
                              </div>
                              <div className="mt-2 text-left">
                                  <h3 className="text-sm font-semibold text-brand-text truncate" title={item.name}>
                                      {item.name}
                                  </h3>
                                  {item.brand && <p className="text-xs text-brand-subtle">{item.brand}</p>}
                                  {item.price && <p className="text-sm font-semibold text-brand-text mt-1">₹{item.price.toLocaleString('en-IN')}</p>}
                              </div>
                          </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {query.trim() && filteredProducts.length === 0 && (
                <div className="text-center pt-16 animate-fade-in">
                    <h3 className="text-xl font-serif font-semibold text-brand-text">No results found for "{query}"</h3>
                    <p className="mt-2 text-brand-subtle">Try searching for something else.</p>
                </div>
              )}
              
              {!query.trim() && (
                  <div className="text-center pt-16 animate-fade-in">
                      <h3 className="text-xl font-serif font-semibold text-brand-text">Find your next favorite piece</h3>
                      <p className="mt-2 text-brand-subtle">Search for products by name, brand, or category.</p>
                  </div>
              )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;