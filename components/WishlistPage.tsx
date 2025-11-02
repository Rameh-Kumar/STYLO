/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { WardrobeItem } from '../types';
import ProductGridSkeleton from './ProductGridSkeleton';
import ProductImage from './ProductImage';
import { HeartIcon } from './icons';
import { getPlaceholderSrc } from '../lib/utils';

interface WishlistPageProps {
  wishlist: string[];
  wardrobe: WardrobeItem[];
  isWardrobeLoading: boolean;
  onProductSelect: (item: WardrobeItem) => void;
  onToggleWishlist: (itemId: string) => void;
  isInWishlist: (itemId: string) => boolean;
}

const WishlistPage: React.FC<WishlistPageProps> = ({
  wishlist,
  wardrobe,
  isWardrobeLoading,
  onProductSelect,
  onToggleWishlist,
  isInWishlist
}) => {
  const wishlistedItems = React.useMemo(() => {
    // Maintain the order in which items were added by mapping over the wishlist array
    return wishlist.map(id => wardrobe.find(item => item.id === id)).filter((item): item is WardrobeItem => !!item);
  }, [wishlist, wardrobe]);

  return (
    <div className="w-full min-h-screen flex flex-col bg-brand-bg">
      <main className="flex-grow">
        <div className="w-full bg-brand-surface py-12 text-center border-b border-brand-border">
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-brand-text tracking-tight">My Wishlist</h1>
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {isWardrobeLoading ? (
                <ProductGridSkeleton count={wishlist.length || 4} />
            ) : wishlistedItems.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
                    {wishlistedItems.map(item => (
                        <div key={item.id} className="group relative animate-fade-in">
                            <button onClick={() => onProductSelect(item)} className="w-full text-left">
                                <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-brand-border relative">
                                    <ProductImage
                                        src={item.image_urls[0]}
                                        alt={item.name}
                                        className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                                        placeholderSrc={getPlaceholderSrc(item.image_urls[0])}
                                    />
                                </div>
                            </button>
                            <button
                                onClick={() => onToggleWishlist(item.id)}
                                className="absolute top-2 right-2 z-10 p-2 bg-white/70 rounded-full backdrop-blur-sm transition-colors duration-200 hover:bg-white"
                                aria-label={isInWishlist(item.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                            >
                                <HeartIcon className={`w-5 h-5 transition-all ${isInWishlist(item.id) ? 'text-red-500 fill-current' : 'text-brand-text'}`} />
                            </button>
                            <div className="mt-2 text-left">
                                <div className="flex justify-between items-start">
                                    <div className="flex-grow overflow-hidden pr-2">
                                        <h3 className="text-sm font-semibold text-brand-text truncate" title={item.name}>
                                            <a href="#" onClick={(e) => { e.preventDefault(); onProductSelect(item); }} className="hover:underline">{item.name}</a>
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
            ) : (
                <div className="col-span-full text-center py-16">
                    <div className="mx-auto w-16 h-16 bg-brand-border/80 text-brand-subtle rounded-full flex items-center justify-center mb-4">
                        <HeartIcon className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-serif font-semibold text-brand-text">Your Wishlist is Empty</h2>
                    <p className="mt-2 text-brand-subtle">Looks like you haven't added anything yet. Explore our collections and find something you love!</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default WishlistPage;