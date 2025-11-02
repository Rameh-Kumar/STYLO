/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo, useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WardrobeItem } from '../types';
import { ArrowUturnLeftIcon, ExternalLinkIcon, SparklesIcon, ChevronLeftIcon, ChevronRightIcon, PaperAirplaneIcon, CheckCircleIcon, HeartIcon } from './icons';
import ProductImage from './ProductImage';
import { getPlaceholderSrc, createProductShareImage } from '../lib/utils';

interface ProductDetailsPageProps {
  item: WardrobeItem;
  onBack: () => void;
  onTryOn: (item: WardrobeItem) => void;
  onShop: (item: WardrobeItem) => void;
  wardrobe: WardrobeItem[];
  onProductSelect: (item: WardrobeItem) => void;
  isWardrobeLoading: boolean;
  onToggleWishlist: (itemId: string) => void;
  isInWishlist: (itemId: string) => boolean;
}

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ item, onBack, onTryOn, onShop, wardrobe, onProductSelect, isWardrobeLoading, onToggleWishlist, isInWishlist }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [[currentImageIndex, direction], setCurrentImage] = useState([0, 0]);
  
  // Reset carousel to first image when product changes
  useEffect(() => {
    setCurrentImage([0, 0]);
  }, [item.id]);

  // Preload next and previous images in the carousel for a smoother experience
  useEffect(() => {
    if (item.image_urls && item.image_urls.length > 1) {
      const imageUrls = item.image_urls;
      const totalImages = imageUrls.length;

      // Preload next image
      const nextIndex = (currentImageIndex + 1) % totalImages;
      if (imageUrls[nextIndex]) {
        const nextImage = new Image();
        nextImage.src = imageUrls[nextIndex];
      }
      
      // Preload previous image
      const prevIndex = (currentImageIndex - 1 + totalImages) % totalImages;
      if (imageUrls[prevIndex]) {
        const prevImage = new Image();
        prevImage.src = imageUrls[prevIndex];
      }
    }
  }, [item.image_urls, currentImageIndex]);

  const hasMultipleImages = item.image_urls && item.image_urls.length > 1;

  const paginate = (newDirection: number) => {
    if (!hasMultipleImages) return;
    let nextIndex = currentImageIndex + newDirection;
    if (nextIndex < 0) {
      nextIndex = item.image_urls.length - 1;
    } else if (nextIndex >= item.image_urls.length) {
      nextIndex = 0;
    }
    setCurrentImage([nextIndex, newDirection]);
  };

  const currentImageUrl = item.image_urls?.[currentImageIndex] ?? '';
  const placeholderSrc = useMemo(() => getPlaceholderSrc(currentImageUrl), [currentImageUrl]);

  const relatedItems = useMemo(() => {
    if (!wardrobe || !item) return [];

    const shuffle = (array: WardrobeItem[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const sameType = wardrobe.filter(
        p => p.id !== item.id && p.category === item.category && p.product_type === item.product_type
    );
    const sameCategory = wardrobe.filter(
        p => p.id !== item.id && p.category === item.category && p.product_type !== item.product_type
    );
    
    const recommendations = [...shuffle(sameType), ...shuffle(sameCategory)];
    return recommendations.slice(0, 10);
  }, [item, wardrobe]);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ canScrollLeft: false, canScrollRight: false });

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
  }, [checkScroll, relatedItems]);

  const handleScroll = (scrollDirection: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (el) {
        const scrollAmount = el.clientWidth * 0.8;
        el.scrollBy({
            left: scrollDirection === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    }
  };

  const handleShare = async () => {
    const productUrl = `${window.location.origin}/?product=${item.id}`;
    const shareText = `Take a look at this ${item.name} on STYLON\n${productUrl}`;
    
    if (navigator.share) {
      try {
        // Base payload with text and URL.
        const sharePayload: ShareData = {
          title: item.name,
          text: shareText,
          url: productUrl,
        };
        
        try {
          // Attempt to generate and attach a custom share image.
          const file = await createProductShareImage({
            productImageUrl: item.image_urls[0],
            productName: item.name,
            productBrand: item.brand,
            productPrice: item.price
          });
          
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
              sharePayload.files = [file];
          }
        } catch (e) {
            console.error("Could not create or attach custom share image, sharing text only:", e);
        }
        
        await navigator.share(sharePayload);
      } catch (err) {
        if ((err as DOMException).name !== 'AbortError') {
            console.error('Web Share API error:', err);
        }
      }
    } else {
      // Fallback for desktop or unsupported browsers
      navigator.clipboard.writeText(shareText).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
      });
    }
  };

  const RelatedItemsSkeleton = () => (
    <div className="flex space-x-4 md:space-x-6 overflow-x-hidden py-2 -mx-4 px-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="animate-pulse snap-start shrink-0 w-3/4 sm:w-1/3 md:w-1/4 lg:w-1/5">
          <div className="aspect-[3/4] w-full bg-brand-border rounded-lg"></div>
          <div className="mt-2 space-y-2">
            <div className="h-4 bg-brand-border rounded w-4/5"></div>
            <div className="h-3 bg-brand-border rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const carouselVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  const isWishlisted = isInWishlist(item.id);

  return (
    <div className="w-full bg-brand-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={onBack} className="flex items-center text-sm font-semibold text-brand-subtle hover:text-brand-text mb-6 transition-colors">
          <ArrowUturnLeftIcon className="w-4 h-4 mr-2" />
          Back to Collection
        </button>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div 
            className="relative flex items-center justify-center rounded-lg overflow-hidden aspect-[3/4] group/carousel"
            draggable={false}
          >
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentImageUrl}
                className="absolute inset-0 w-full h-full"
                custom={direction}
                variants={carouselVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(event, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x;
                  if (swipe < -10000) paginate(1);
                  else if (swipe > 10000) paginate(-1);
                }}
              >
                <ProductImage
                  src={currentImageUrl}
                  alt={`${item.name} - view ${currentImageIndex + 1}`}
                  placeholderSrc={placeholderSrc}
                  eager={true}
                />
              </motion.div>
            </AnimatePresence>
            
            <button
                onClick={() => onToggleWishlist(item.id)}
                className="absolute top-4 right-4 z-30 p-2.5 bg-white/80 rounded-full backdrop-blur-sm transition-all duration-200 hover:bg-white active:scale-95 shadow-md"
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
                <HeartIcon className={`w-6 h-6 transition-all ${isWishlisted ? 'text-red-500 fill-current' : 'text-brand-text'}`} />
            </button>

            {hasMultipleImages && (
              <>
                <div className="absolute top-1/2 left-3 -translate-y-1/2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
                  <button onClick={() => paginate(-1)} className="w-10 h-10 rounded-full bg-white/80 border border-brand-border shadow-md flex items-center justify-center hover:bg-white transition-colors active:scale-95 backdrop-blur-sm" aria-label="Previous image">
                    <ChevronLeftIcon className="w-6 h-6 text-brand-text" />
                  </button>
                </div>
                <div className="absolute top-1/2 right-3 -translate-y-1/2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
                   <button onClick={() => paginate(1)} className="w-10 h-10 rounded-full bg-white/80 border border-brand-border shadow-md flex items-center justify-center hover:bg-white transition-colors active:scale-95 backdrop-blur-sm" aria-label="Next image">
                    <ChevronRightIcon className="w-6 h-6 text-brand-text" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {item.image_urls.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage([i, i > currentImageIndex ? 1 : -1])}
                      className={`w-2 h-2 rounded-full transition-colors ${i === currentImageIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/75'}`}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div>
            {item.brand && <p className="text-sm font-semibold text-brand-subtle uppercase tracking-wider">{item.brand}</p>}
            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-brand-text mt-2 mb-4">{item.name}</h1>
            {item.price && <p className="text-3xl font-serif text-brand-text mb-6">₹{item.price.toLocaleString('en-IN')}</p>}
            
            <div className="space-y-4">
               <button
                  onClick={() => onTryOn(item)}
                  className="w-full flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-brand-teal rounded-md cursor-pointer group hover:bg-teal-700 transition-colors"
               >
                  <SparklesIcon className="w-6 h-6 mr-3 transform group-hover:animate-pulse" />
                  Virtual Try-On
               </button>
               <div className={`grid ${item.product_url ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                {item.product_url && (
                    <button
                        onClick={() => onShop(item)}
                        className="w-full flex items-center justify-center px-6 py-3 text-base font-semibold text-brand-text bg-brand-border/70 rounded-md hover:bg-brand-border transition-colors"
                    >
                        <ExternalLinkIcon className="w-5 h-5 mr-3" />
                        Shop Now
                    </button>
                )}
                <button
                    onClick={handleShare}
                    className={`w-full flex items-center justify-center px-6 py-3 text-base font-semibold rounded-md transition-all duration-200 ${
                        copySuccess ? 'bg-green-500 text-white' : 'bg-brand-border/70 text-brand-text hover:bg-brand-border'
                    }`}
                    aria-label="Share this product"
                    >
                    {copySuccess ? (
                        <>
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        Link Copied!
                        </>
                    ) : (
                        <>
                        <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                        Share
                        </>
                    )}
                    </button>
                </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-brand-border">
                <h3 className="text-lg font-serif font-semibold text-brand-text mb-2">Description</h3>
                <p className="text-brand-subtle">
                    {item.description || `Discover the perfect blend of style and comfort with the ${item.name} from ${item.brand || 'our collection'}. This piece is a versatile addition to any wardrobe, designed for a modern look and feel.`}
                </p>
            </div>
          </div>
        </div>
      </div>
      {(isWardrobeLoading || relatedItems.length > 0) && (
        <div className="w-full bg-brand-surface py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-serif font-bold text-center text-brand-text mb-8">You May Also Like</h2>
                {isWardrobeLoading ? (
                    <RelatedItemsSkeleton />
                ) : (
                    <div className="relative group/carousel">
                        <div 
                            ref={scrollContainerRef}
                            className="flex space-x-4 md:space-x-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-2 -mx-4 px-4"
                        >
                            {relatedItems.map(relatedItem => (
                                <div key={relatedItem.id} className="group/card relative snap-start shrink-0 w-3/4 sm:w-1/3 md:w-1/4 lg:w-1/5">
                                    <button onClick={() => onProductSelect(relatedItem)} className="w-full text-left">
                                        <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-brand-border relative">
                                            <ProductImage
                                                src={relatedItem.image_urls[0]}
                                                alt={relatedItem.name}
                                                className="h-full w-full object-cover object-center transition-transform duration-300 group-hover/card:scale-105"
                                                placeholderSrc={getPlaceholderSrc(relatedItem.image_urls[0])}
                                            />
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => onToggleWishlist(relatedItem.id)}
                                        className="absolute top-2 right-2 z-10 p-2 bg-white/70 rounded-full backdrop-blur-sm transition-all duration-200 hover:bg-white"
                                        aria-label={isInWishlist(relatedItem.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                                    >
                                        <HeartIcon className={`w-5 h-5 transition-all ${isInWishlist(relatedItem.id) ? 'text-red-500 fill-current' : 'text-brand-text'}`} />
                                    </button>
                                    <div className="mt-2 text-left">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-grow overflow-hidden pr-2">
                                                <h3 className="text-sm font-semibold text-brand-text truncate" title={relatedItem.name}>
                                                    {relatedItem.name}
                                                </h3>
                                                {relatedItem.brand && <p className="text-xs text-brand-subtle">{relatedItem.brand}</p>}
                                            </div>
                                            {relatedItem.price && (
                                                <p className="text-sm font-semibold text-brand-text flex-shrink-0">
                                                    ₹{relatedItem.price.toLocaleString('en-IN')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <AnimatePresence>
                          {scrollState.canScrollLeft && (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }} 
                                transition={{ duration: 0.2 }} 
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-20 bg-gradient-to-r from-brand-surface to-transparent hidden md:flex items-center justify-start opacity-0 group-hover/carousel:opacity-100"
                            >
                              <button onClick={() => handleScroll('left')} className="w-10 h-10 rounded-full bg-white/80 border border-brand-border shadow-md flex items-center justify-center hover:bg-white transition-colors active:scale-95 backdrop-blur-sm" aria-label="Scroll left">
                                <ChevronLeftIcon className="w-6 h-6 text-brand-text" />
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <AnimatePresence>
                          {scrollState.canScrollRight && (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }} 
                                transition={{ duration: 0.2 }} 
                                className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-20 bg-gradient-to-l from-brand-surface to-transparent hidden md:flex items-center justify-end opacity-0 group-hover/carousel:opacity-100"
                            >
                              <button onClick={() => handleScroll('right')} className="w-10 h-10 rounded-full bg-white/80 border border-brand-border shadow-md flex items-center justify-center hover:bg-white transition-colors active:scale-95 backdrop-blur-sm" aria-label="Scroll right">
                                <ChevronRightIcon className="w-6 h-6 text-brand-text" />
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;