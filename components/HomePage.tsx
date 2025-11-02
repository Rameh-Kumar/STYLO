/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { motion } from 'framer-motion';
import { WardrobeItem } from '../types';
import { ChevronRightIcon, HeartIcon } from './icons';
import ProductGridSkeleton from './ProductGridSkeleton';
import ProductImage from './ProductImage';
import { getPlaceholderSrc } from '../lib/utils';

interface HomePageProps {
    onNavigate: (page: 'women' | 'men' | 'wishlist') => void;
    onProductSelect: (item: WardrobeItem) => void;
    newArrivals: WardrobeItem[];
    isWardrobeLoading: boolean;
    onToggleWishlist: (itemId: string) => void;
    isInWishlist: (itemId: string) => boolean;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, onProductSelect, newArrivals, isWardrobeLoading, onToggleWishlist, isInWishlist }) => {
    
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: 'easeOut' as const }
    };

    return (
        <div className="w-full bg-brand-bg">
            {/* Hero Section */}
            <motion.section 
                className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white bg-brand-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <img 
                    src="https://images.pexels.com/photos/322207/pexels-photo-322207.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                    alt="Stylish person in a fashionable outfit"
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
                <div className="relative z-10 p-4">
                    <motion.h1 
                        className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight"
                        {...fadeIn}
                    >
                        Style, Reimagined
                    </motion.h1>
                    <motion.p 
                        className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-white/90"
                        {...fadeIn}
                        transition={{ ...fadeIn.transition, delay: 0.2 }}
                    >
                        Explore curated collections and discover your signature look with the power of AI.
                    </motion.p>
                    <motion.div
                        {...fadeIn}
                        transition={{ ...fadeIn.transition, delay: 0.4 }}
                    >
                        <button 
                            onClick={() => onNavigate('women')}
                            className="mt-8 px-8 py-3 bg-white text-brand-text font-semibold rounded-md hover:bg-white/90 transition-colors"
                        >
                            Shop New Arrivals
                        </button>
                    </motion.div>
                </div>
            </motion.section>

            {/* Category Section */}
            <section className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div 
                        className="relative h-96 rounded-lg overflow-hidden group cursor-pointer" 
                        onClick={() => onNavigate('women')}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <img src="https://images.pexels.com/photos/1375736/pexels-photo-1375736.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Stylish woman" className="w-full h-full object-cover"/>
                        <div className="absolute inset-0 bg-black/40 flex items-end p-8">
                            <div className="text-white">
                                <h2 className="text-3xl font-serif font-bold">Women's Collection</h2>
                                <div className="mt-2 flex items-center font-semibold group-hover:underline">Shop Now <ChevronRightIcon className="w-4 h-4 ml-2"/></div>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div 
                        className="relative h-96 rounded-lg overflow-hidden group cursor-pointer" 
                        onClick={() => onNavigate('men')}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <img src="https://images.pexels.com/photos/2955375/pexels-photo-2955375.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Stylish man" className="w-full h-full object-cover"/>
                        <div className="absolute inset-0 bg-black/40 flex items-end p-8">
                            <div className="text-white">
                                <h2 className="text-3xl font-serif font-bold">Men's Collection</h2>
                                <div className="mt-2 flex items-center font-semibold group-hover:underline">Shop Now <ChevronRightIcon className="w-4 h-4 ml-2"/></div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* New Arrivals Section */}
            <section className="py-16 bg-brand-surface">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-serif font-bold text-center text-brand-text mb-8">New Arrivals</h2>
                    {isWardrobeLoading ? (
                        <ProductGridSkeleton count={10} />
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
                            {newArrivals.map(item => (
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
                    )}
                </div>
            </section>
        </div>
    );
};

export default HomePage;