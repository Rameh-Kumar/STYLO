/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Canvas from './components/Canvas';
import WardrobePanel from './components/WardrobeModal';
import OutfitStack from './components/OutfitStack';
import { generateVirtualTryOnImage, generatePoseVariation, enhanceImageQuality, generateModelImage, generateInitialTryOn } from './services/geminiService';
import { OutfitLayer, WardrobeItem } from './types';
import { ChevronDownIcon, ChevronUpIcon } from './components/icons';
import Footer from './components/Footer';
import Header from './components/Header';
import HomePage from './components/HomePage';
import CollectionPage from './components/CollectionPage';
import UploadModelModal from './components/UploadModelModal';
import { getFriendlyErrorMessage, addWatermark, getRetailerName, urlToFile } from './lib/utils';
import Spinner from './components/Spinner';
import ShopTheLook from './components/AddProductModal';
import AboutPage from './components/AboutPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import ShareModal from './components/ShareModal';
import SharedLookPage from './components/SharedLookPage';
import { supabase } from './lib/supabaseClient';
import ProductDetailsPage from './components/ProductDetailsPage';
import RedirectModal from './components/RedirectModal';
import WishlistPage from './components/WishlistPage';
import SearchModal from './components/SearchModal';
import { useAnalytics } from './hooks/useAnalytics';

const POSE_INSTRUCTIONS = [
  "Full frontal view, hands on hips",
  "Slightly turned, 3/4 view",
  "Side profile view",
  "Jumping in the air, mid-action shot",
  "Walking towards camera",
  "Leaning against a wall",
];

const MODEL_CREATION_MESSAGES = [
  "Creating your personal model...",
  "Analyzing body shape and pose...",
  "Preparing the virtual mannequin...",
  "This is a complex AI process, thanks for your patience!",
  "Generating a high-fidelity digital twin...",
  "Almost there, applying the final touches...",
];

const FASHION_TIPS_MESSAGES = [
  "Pro Tip: Rolling your sleeves can instantly make a formal shirt look more casual.",
  "Our AI is analyzing the fabric's texture for a realistic drape...",
  "Fun Fact: The first fashion magazine was sold in Germany in 1586.",
  "Styling Trick: A French tuck (partially tucking in your shirt) can define your waistline.",
  "Simulating how light interacts with the virtual garment...",
  "Did you know? Sneakers were first called 'plimsolls' in the 1870s.",
  "Perfecting the virtual fit and seams...",
  "Pro Tip: A well-placed belt can completely change an outfit's silhouette.",
  "Fun Fact: The modern zipper wasn't widely used in fashion until the 1930s!",
];

type Page = 'home' | 'women' | 'men' | 'pdp' | 'about' | 'privacy' | 'terms' | 'wishlist';

const pageToPath: Record<string, string> = {
  home: '#/',
  women: '#/women',
  men: '#/men',
  wishlist: '#/wishlist',
  about: '#/about',
  privacy: '#/privacy',
  terms: '#/terms',
};

const pathToPage: Record<string, Page> = {
    '/': 'home',
    '/women': 'women',
    '/men': 'men',
    '/wishlist': 'wishlist',
    '/about': 'about',
    '/privacy': 'privacy',
    '/terms': 'terms'
};


const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = React.useState(() => window.matchMedia(query).matches);

  React.useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

    mediaQueryList.addEventListener('change', listener);
    
    if (mediaQueryList.matches !== matches) {
      setMatches(mediaQueryList.matches);
    }

    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, [query, matches]);

  return matches;
};

const useWishlist = (wardrobe: WardrobeItem[], logEvent: (eventName: string, eventParams?: { [key: string]: any; }) => void) => {
    const [wishlist, setWishlist] = React.useState<string[]>(() => {
        try {
            const items = window.localStorage.getItem('stylon-wishlist');
            return items ? JSON.parse(items) : [];
        } catch (error) {
            console.error("Error reading wishlist from localStorage", error);
            return [];
        }
    });

    React.useEffect(() => {
        try {
            window.localStorage.setItem('stylon-wishlist', JSON.stringify(wishlist));
        } catch (error) {
            console.error("Error saving wishlist to localStorage", error);
        }
    }, [wishlist]);

    const toggleWishlist = (productId: string) => {
        const product = wardrobe.find(p => p.id === productId);
        setWishlist((prev) => {
            const isAdding = !prev.includes(productId);
            if (isAdding) {
                logEvent('add_to_wishlist', {
                    currency: 'INR',
                    value: product?.price,
                    items: [{
                        item_id: product?.id,
                        item_name: product?.name,
                        item_brand: product?.brand,
                        item_category: product?.category,
                        price: product?.price
                    }]
                });
                return [...prev, productId];
            } else {
                 logEvent('remove_from_wishlist', {
                    currency: 'INR',
                    value: product?.price,
                    items: [{
                        item_id: product?.id,
                        item_name: product?.name,
                        item_brand: product?.brand,
                        item_category: product?.category,
                        price: product?.price
                    }]
                });
                return prev.filter((id) => id !== productId);
            }
        });
    };

    const isInWishlist = (productId: string) => {
        return wishlist.includes(productId);
    };

    return { wishlist, toggleWishlist, isInWishlist };
};


const App: React.FC = () => {
  const { logEvent } = useAnalytics();
  const [modelImageUrl, setModelImageUrl] = React.useState<string | null>(null);
  const [outfitHistory, setOutfitHistory] = React.useState<OutfitLayer[]>([]);
  const [currentOutfitIndex, setCurrentOutfitIndex] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [currentPoseIndex, setCurrentPoseIndex] = React.useState(0);
  const [isSheetCollapsed, setIsSheetCollapsed] = React.useState(false);
  const [wardrobe, setWardrobe] = React.useState<WardrobeItem[]>([]);
  const [isWardrobeLoading, setIsWardrobeLoading] = React.useState(true);
  
  const [currentPage, setCurrentPage] = React.useState<Page>('home');
  const [previousPage, setPreviousPage] = React.useState<Page>('home');

  const [pdpItem, setPdpItem] = React.useState<WardrobeItem | null>(null);
  const [shareId, setShareId] = React.useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [isSharing, setIsSharing] = React.useState(false);
  const [shareUrl, setShareUrl] = React.useState<string | null>(null);
  const [sharedImageUrl, setSharedImageUrl] = React.useState<string | null>(null);
  const [shareError, setShareError] = React.useState<string | null>(null);
  
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [pendingGarment, setPendingGarment] = React.useState<WardrobeItem | null>(null);
  
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  const [redirectInfo, setRedirectInfo] = React.useState<{url: string; retailerName: string} | null>(null);
  
  const isMobile = useMediaQuery('(max-width: 767px)');
  
  const { wishlist, toggleWishlist, isInWishlist } = useWishlist(wardrobe, logEvent);

  const isDressingScreenActive = !!modelImageUrl && !isLoading && !shareId;

  const handleNavigate = React.useCallback((page: Page) => {
    const newUrl = new URL(window.location.origin + window.location.pathname);
    newUrl.hash = pageToPath[page];
    window.history.pushState({}, '', newUrl);

    if (shareId) setShareId(null);
    if (pdpItem) setPdpItem(null);

    if (page !== 'pdp' && page !== 'about' && page !== 'privacy' && page !== 'terms' && page !== 'wishlist') {
      setPreviousPage(page);
    }
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }, [shareId, pdpItem]);
  
  const handleProductSelect = React.useCallback((item: WardrobeItem) => {
      setIsSearchOpen(false);
      
      logEvent('select_content', {
        content_type: 'product',
        item_id: item.id,
      });

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('product', item.id);
      newUrl.hash = '';
      window.history.pushState({ productId: item.id }, '', newUrl);
      
      if (currentPage !== 'pdp') {
          setPreviousPage(currentPage);
      }
      setPdpItem(item);
      setCurrentPage('pdp');
      window.scrollTo(0, 0);
  }, [currentPage, logEvent]);

  // Effect for page view analytics
  React.useEffect(() => {
    const getPagePath = () => {
        if (pdpItem) return `/?product=${pdpItem.id}`;
        if (shareId) return `/?share=${shareId}`;
        return pageToPath[currentPage] || '/';
    };
    const pageTitle = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);
    logEvent('page_view', {
        page_title: pdpItem ? pdpItem.name : pageTitle,
        page_path: getPagePath(),
    });
  }, [currentPage, pdpItem, shareId, logEvent]);
  
  // Effect for tracking when VTO modal is opened
  React.useEffect(() => {
    if (isUploadModalOpen) {
        logEvent('vto_start', {
            entry_point: pendingGarment ? 'pdp' : 'header_cta',
            item_id: pendingGarment?.id,
        });
    }
  }, [isUploadModalOpen, pendingGarment, logEvent]);


  // Effect for cycling loading messages to entertain the user.
  React.useEffect(() => {
    let intervalId: number | undefined;
    let timeoutId: number | undefined;

    if (isLoading) {
      const isModelCreation = MODEL_CREATION_MESSAGES.includes(loadingMessage);
      
      const baseMessages = isModelCreation
        ? MODEL_CREATION_MESSAGES.filter(m => m !== loadingMessage)
        : [];
      
      const allMessages = [...baseMessages, ...FASHION_TIPS_MESSAGES];
      const shuffledMessages = allMessages.sort(() => Math.random() - 0.5);
      let messageIndex = 0;

      timeoutId = window.setTimeout(() => {
        intervalId = window.setInterval(() => {
          setLoadingMessage(shuffledMessages[messageIndex]);
          messageIndex = (messageIndex + 1) % shuffledMessages.length;
        }, 3500);
      }, 4000);
    }

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoading, loadingMessage]);

  React.useEffect(() => {
    const shouldShowAds = true;
    
    const manageAdSenseMetaTag = (showAds: boolean) => {
      const metaTagId = 'google-adsense-control';
      let metaTag = document.getElementById(metaTagId) as HTMLMetaElement | null;
      if (showAds) {
        if (metaTag) metaTag.remove();
      } else {
        if (!metaTag) {
          metaTag = document.createElement('meta');
          metaTag.id = metaTagId;
          metaTag.name = 'google_ad_modifications';
          metaTag.content = 'page_level_ads: off';
          document.head.appendChild(metaTag);
        }
      }
    };
    manageAdSenseMetaTag(shouldShowAds);

    const handleRouting = () => {
      const params = new URLSearchParams(window.location.search);
      const shareIdFromUrl = params.get('share');
      const productIdFromUrl = params.get('product');
      const hash = window.location.hash;
      const path = hash ? hash.substring(1) : '/';
    
      if (shareIdFromUrl) {
        setShareId(shareIdFromUrl);
        setPdpItem(null);
        setCurrentPage('home');
      } else if (productIdFromUrl) {
        setShareId(null);
        setCurrentPage('pdp');
        // The actual product data loading is handled by another effect
        // that waits for the wardrobe to be fetched.
      } else {
        // This is a standard hash-based page
        setShareId(null);
        setPdpItem(null);
        const page = pathToPage[path] || 'home';
        setCurrentPage(page);
      }
    };

    handleRouting(); // Initial routing on load
    window.addEventListener('hashchange', handleRouting);
    window.addEventListener('popstate', handleRouting); // Listen for browser back/forward

    const fetchWardrobe = async () => {
      setIsWardrobeLoading(true);
      try {
        const { data, error: dbError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (dbError) throw dbError;

        const sanitizedData = (data as any[]).map(item => {
            let imageUrls = item.image_urls || [];
            if (!Array.isArray(imageUrls)) {
                imageUrls = [];
            }
            if (imageUrls.length === 0 && typeof item.image_url === 'string') {
                imageUrls.push(item.image_url);
            }
            return { ...item, image_urls: imageUrls };
        }).filter(item => item.image_urls.length > 0);

        setWardrobe(sanitizedData as WardrobeItem[]);
      } catch (err) {
        console.error("Error fetching wardrobe:", err);
        setError("Could not load wardrobe items from the database.");
      } finally {
        setIsWardrobeLoading(false);
      }
    };
    fetchWardrobe();

    return () => {
      window.removeEventListener('hashchange', handleRouting);
      window.removeEventListener('popstate', handleRouting);
    };
  }, []);

  // Effect to load product data when on a PDP route and wardrobe is available.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productIdFromUrl = params.get('product');

    if (currentPage === 'pdp' && productIdFromUrl && !isWardrobeLoading && wardrobe.length > 0) {
      if (pdpItem?.id === productIdFromUrl) {
        return; // Already showing the correct product
      }

      const product = wardrobe.find(item => item.id === productIdFromUrl);
      if (product) {
        if (previousPage !== 'pdp' && currentPage !== previousPage) {
          // Set previous page state if we're not already coming from a PDP
          // This happens on initial deep-link load.
          setPreviousPage(currentPage === 'pdp' ? 'home' : currentPage);
        }
        setPdpItem(product);
        logEvent('view_item', {
            currency: 'INR',
            value: product.price,
            items: [{
                item_id: product.id,
                item_name: product.name,
                item_brand: product.brand,
                item_category: product.category,
                price: product.price,
            }]
        });
      } else {
        console.warn(`Product with ID ${productIdFromUrl} not found.`);
        handleNavigate('home');
      }
    }
  }, [isWardrobeLoading, wardrobe, currentPage, pdpItem, handleNavigate, previousPage, logEvent]);

  const activeOutfitLayers = React.useMemo(() => 
    outfitHistory.slice(0, currentOutfitIndex + 1), 
    [outfitHistory, currentOutfitIndex]
  );
  
  const activeGarmentIds = React.useMemo(() => 
    activeOutfitLayers.map(layer => layer.garment?.id).filter(Boolean) as string[], 
    [activeOutfitLayers]
  );
  
  const displayImageUrl = React.useMemo(() => {
    if (outfitHistory.length === 0) return modelImageUrl;
    const currentLayer = outfitHistory[currentOutfitIndex];
    if (!currentLayer) return modelImageUrl;

    const poseInstruction = POSE_INSTRUCTIONS[currentPoseIndex];
    const poseImage = currentLayer.poseImages[poseInstruction];

    const poseKeys = Object.keys(currentLayer.poseImages);
    const fallbackPose = poseKeys.length > 0 ? currentLayer.poseImages[poseKeys[0]] : undefined;
    return poseImage?.enhanced ?? poseImage?.standard ?? fallbackPose?.standard ?? modelImageUrl;
  }, [outfitHistory, currentOutfitIndex, currentPoseIndex, modelImageUrl]);

  const isEnhanced = React.useMemo(() => {
    if (outfitHistory.length === 0) return false;
    const currentLayer = outfitHistory[currentOutfitIndex];
    const poseInstruction = POSE_INSTRUCTIONS[currentPoseIndex];
    return !!currentLayer?.poseImages[poseInstruction]?.enhanced;
  }, [outfitHistory, currentOutfitIndex, currentPoseIndex]);

  const availablePoseKeys = React.useMemo(() => {
    if (outfitHistory.length === 0) return [];
    const currentLayer = outfitHistory[currentOutfitIndex];
    return currentLayer ? Object.keys(currentLayer.poseImages) : [];
  }, [outfitHistory, currentOutfitIndex]);

  const handleModelFinalized = React.useCallback((url: string) => {
    logEvent('vto_model_created', { method: 'user_upload' });
    setModelImageUrl(url);
    setOutfitHistory([{
      garment: null,
      poseImages: { [POSE_INSTRUCTIONS[0]]: { standard: url } }
    }]);
    setCurrentOutfitIndex(0);
    setIsUploadModalOpen(false);
  }, [logEvent]);

  const handleInitialTryOnFinalized = React.useCallback((baseModelUrl: string, finalTryOnUrl: string, garmentInfo: WardrobeItem) => {
      logEvent('vto_model_created', { method: 'user_upload_with_garment' });
      logEvent('vto_garment_applied', {
          item_id: garmentInfo.id,
          item_name: garmentInfo.name,
          item_category: garmentInfo.category,
          item_brand: garmentInfo.brand
      });
      setModelImageUrl(baseModelUrl);
      
      const baseLayer: OutfitLayer = {
        garment: null,
        poseImages: { [POSE_INSTRUCTIONS[0]]: { standard: baseModelUrl } }
      };
  
      const tryOnLayer: OutfitLayer = {
        garment: garmentInfo,
        poseImages: { [POSE_INSTRUCTIONS[0]]: { standard: finalTryOnUrl } }
      };
      
      setOutfitHistory([baseLayer, tryOnLayer]);
      setCurrentOutfitIndex(1);
      setPendingGarment(null);
      setIsUploadModalOpen(false);

      setWardrobe(prev => {
        if (prev.find(item => item.id === garmentInfo.id)) {
            return prev;
        }
        return [...prev, garmentInfo];
      });
  }, [logEvent]);

  const handleStartOver = () => {
    logEvent('vto_start_over');
    setModelImageUrl(null);
    setOutfitHistory([]);
    setCurrentOutfitIndex(0);
    setIsLoading(false);
    setLoadingMessage('');
    setError(null);
    setCurrentPoseIndex(0);
    setIsSheetCollapsed(false);
    handleNavigate('home');
  };

  const handleGarmentSelect = React.useCallback(async (garmentFile: File, garmentInfo: WardrobeItem) => {
    if (!displayImageUrl || isLoading) return;

    const nextLayer = outfitHistory[currentOutfitIndex + 1];
    if (nextLayer && nextLayer.garment?.id === garmentInfo.id) {
        setCurrentOutfitIndex(prev => prev + 1);
        setCurrentPoseIndex(0);
        return;
    }

    setError(null);
    setIsLoading(true);
    setLoadingMessage(`Adding ${garmentInfo.name}...`);

    try {
      const newImageUrl = await generateVirtualTryOnImage(displayImageUrl, garmentFile);
      const currentPoseInstruction = POSE_INSTRUCTIONS[currentPoseIndex];
      
      const newLayer: OutfitLayer = { 
        garment: garmentInfo, 
        poseImages: { [currentPoseInstruction]: { standard: newImageUrl } } 
      };

      logEvent('vto_garment_applied', {
        item_id: garmentInfo.id,
        item_name: garmentInfo.name,
        item_category: garmentInfo.category,
        item_brand: garmentInfo.brand
      });

      setOutfitHistory(prevHistory => {
        const newHistory = prevHistory.slice(0, currentOutfitIndex + 1);
        return [...newHistory, newLayer];
      });
      setCurrentOutfitIndex(prev => prev + 1);
      
      setWardrobe(prev => {
        if (prev.find(item => item.id === garmentInfo.id)) {
            return prev;
        }
        return [...prev, garmentInfo];
      });
    } catch (err) {
      const friendlyError = getFriendlyErrorMessage(String(err), 'Failed to apply garment');
      setError(friendlyError);
      logEvent('exception', { description: `VTO Garment Apply Error: ${String(err)}`, fatal: false });
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [displayImageUrl, isLoading, currentPoseIndex, outfitHistory, currentOutfitIndex, logEvent]);

  const handleRemoveLastGarment = () => {
    if (currentOutfitIndex > 0) {
      logEvent('vto_garment_removed', {
        item_id: outfitHistory[currentOutfitIndex].garment?.id
      });
      setCurrentOutfitIndex(prevIndex => prevIndex - 1);
      setCurrentPoseIndex(0);
    }
  };
  
  const handlePoseSelect = React.useCallback(async (newIndex: number) => {
    if (isLoading || outfitHistory.length === 0 || newIndex === currentPoseIndex) return;
    
    const poseInstruction = POSE_INSTRUCTIONS[newIndex];
    const currentLayer = outfitHistory[currentOutfitIndex];

    if (currentLayer.poseImages[poseInstruction]?.standard) {
      setCurrentPoseIndex(newIndex);
      return;
    }

    const baseImageForPoseChange = displayImageUrl;
    if (!baseImageForPoseChange) return;

    setError(null);
    setIsLoading(true);
    setLoadingMessage(`Changing pose...`);
    
    const prevPoseIndex = currentPoseIndex;
    setCurrentPoseIndex(newIndex);

    try {
      const newImageUrl = await generatePoseVariation(baseImageForPoseChange, poseInstruction);
      logEvent('vto_pose_changed', { pose_name: poseInstruction });
      setOutfitHistory(prevHistory =>
        prevHistory.map((layer, index) => {
          if (index !== currentOutfitIndex) {
            return layer;
          }
          const updatedPoseImages = {
            ...layer.poseImages,
            [poseInstruction]: { standard: newImageUrl },
          };
          return { ...layer, poseImages: updatedPoseImages };
        }),
      );
    } catch (err) {
      const friendlyError = getFriendlyErrorMessage(String(err), 'Failed to change pose');
      setError(friendlyError);
      logEvent('exception', { description: `VTO Pose Change Error: ${String(err)}`, fatal: false });
      setCurrentPoseIndex(prevPoseIndex);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [currentPoseIndex, outfitHistory, isLoading, currentOutfitIndex, displayImageUrl, logEvent]);

  const handleEnhanceImage = React.useCallback(async () => {
    if (!displayImageUrl || isLoading) return;

    const currentLayer = outfitHistory[currentOutfitIndex];
    const poseInstruction = POSE_INSTRUCTIONS[currentPoseIndex];
    if (currentLayer.poseImages[poseInstruction]?.enhanced) return;

    setError(null);
    setIsLoading(true);
    setLoadingMessage('Enhancing image quality...');

    try {
        const enhancedImageUrl = await enhanceImageQuality(displayImageUrl);
        logEvent('vto_image_enhanced');
        setOutfitHistory(prevHistory =>
            prevHistory.map((layer, index) => {
                if (index !== currentOutfitIndex) {
                    return layer;
                }
                const updatedPoseImages = { ...layer.poseImages };
                const poseToUpdate = updatedPoseImages[poseInstruction];
                if (poseToUpdate) {
                    updatedPoseImages[poseInstruction] = { ...poseToUpdate, enhanced: enhancedImageUrl };
                }
                return { ...layer, poseImages: updatedPoseImages };
            }),
        );
    } catch (err) {
        const friendlyError = getFriendlyErrorMessage(String(err), 'Failed to enhance image');
        setError(friendlyError);
        logEvent('exception', { description: `VTO Enhance Image Error: ${String(err)}`, fatal: false });
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  }, [displayImageUrl, isLoading, currentOutfitIndex, currentPoseIndex, outfitHistory, logEvent]);

  const handleOpenShareModal = () => {
    setShareUrl(null);
    setShareError(null);
    setSharedImageUrl(null);
    setIsShareModalOpen(true);
    handleShareLook(); // Start generating the link immediately
  };

  const handleShareLook = async () => {
    if (!displayImageUrl) return;
    setIsSharing(true);
    setShareError(null);
    setShareUrl(null);

    try {
      const watermarkedBlob = await addWatermark(displayImageUrl);
      const fileName = `stylon-look-${new Date().getTime()}-${Math.random().toString(36).substring(2, 8)}.jpeg`;

      const { error: uploadError } = await supabase.storage
        .from('shared-looks')
        .upload(fileName, watermarkedBlob);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('shared-looks')
        .getPublicUrl(fileName);
      
      const imageUrl = publicUrlData.publicUrl;
      setSharedImageUrl(imageUrl);

      const productIds = activeOutfitLayers
        .map(layer => layer.garment?.id)
        .filter(id => id && !id.startsWith('custom-')) as string[];

      const { data: insertData, error: insertError } = await supabase
        .from('shared_looks')
        .insert({ image_url: imageUrl, product_ids: productIds })
        .select()
        .single();

      if (insertError) throw insertError;
      
      logEvent('share', {
        method: 'Stylon App',
        content_type: 'outfit',
        item_id: insertData.id
      });

      const newShareUrl = `${window.location.origin}/?share=${insertData.id}`;
      setShareUrl(newShareUrl);
    } catch (err) {
        console.error("Sharing failed:", err);
        const friendlyError = "Sorry, we couldn't share your look. Please try again.";
        setShareError(friendlyError);
        logEvent('exception', { description: `Share Error: ${String(err)}`, fatal: false });
    } finally {
        setIsSharing(false);
    }
  };
  
  const handleTryOnFromPdp = (item: WardrobeItem) => {
      setPendingGarment(item);
      setIsUploadModalOpen(true);
  };

  const handleShopClick = (item: WardrobeItem) => {
    if (item.product_url) {
        logEvent('begin_checkout', {
            currency: 'INR',
            value: item.price,
            items: [{
                item_id: item.id,
                item_name: item.name,
                item_brand: item.brand,
                item_category: item.category,
                price: item.price
            }],
            coupon: 'STYLON_AI'
        });
      setRedirectInfo({
        url: item.product_url,
        retailerName: getRetailerName(item.product_url),
      });
    }
  };

  const handleFileSelectForTryOn = React.useCallback(async (file: File) => {
    setError(null);
    setIsLoading(true);

    try {
      if (pendingGarment) {
        setLoadingMessage('Creating your virtual try-on...');
        const garmentFile = await urlToFile(pendingGarment.image_urls[0], pendingGarment.name);
        const { baseModelUrl, finalTryOnUrl } = await generateInitialTryOn(file, garmentFile);
        handleInitialTryOnFinalized(baseModelUrl, finalTryOnUrl, pendingGarment);
      } else {
        setLoadingMessage(MODEL_CREATION_MESSAGES[0]);
        const result = await generateModelImage(file);
        handleModelFinalized(result);
      }
    } catch (err) {
        const friendlyError = getFriendlyErrorMessage(err, 'Failed to create your look');
        setError(friendlyError);
        logEvent('exception', { description: `VTO Creation Error: ${String(err)}`, fatal: true });
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  }, [pendingGarment, handleInitialTryOnFinalized, handleModelFinalized, logEvent]);

  const viewVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
    transition: { duration: 0.5, ease: 'easeInOut' as const }
  };

  if (shareId) {
    return (
        <div className="font-sans bg-brand-bg text-brand-text min-h-screen">
            <SharedLookPage id={shareId} onNavigate={handleNavigate} />
            <Footer 
                isOnDressingScreen={false} 
                onNavigate={handleNavigate} 
            />
        </div>
    );
  }

  // RENDER VIRTUAL TRY-ON SCREEN
  if (modelImageUrl) {
      return (
        <motion.div
            key="main-app"
            className="relative flex flex-col h-screen bg-brand-bg overflow-hidden"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={viewVariants}
        >
            <main className="flex-grow relative flex flex-col md:flex-row overflow-hidden">
              <div className="w-full h-full flex-grow flex items-center justify-center pb-16 relative">
                <Canvas 
                  displayImageUrl={displayImageUrl}
                  onStartOver={handleStartOver}
                  onShare={handleOpenShareModal}
                  isLoading={isLoading}
                  loadingMessage={loadingMessage}
                  onSelectPose={handlePoseSelect}
                  poseInstructions={POSE_INSTRUCTIONS}
                  currentPoseIndex={currentPoseIndex}
                  availablePoseKeys={availablePoseKeys}
                  onEnhanceImage={handleEnhanceImage}
                  isEnhanced={isEnhanced}
                />
              </div>

              <aside 
                className={`absolute md:relative md:flex-shrink-0 bottom-0 right-0 h-auto max-h-[60vh] md:h-full md:max-h-full w-full md:w-1/3 md:max-w-sm bg-brand-surface/80 backdrop-blur-md flex flex-col border-t md:border-t-0 md:border-l border-brand-border transition-transform duration-500 ease-in-out sm:pb-16 ${isSheetCollapsed ? 'translate-y-[calc(100%-4.5rem)]' : 'translate-y-0'} md:translate-y-0`}
                style={{ transitionProperty: 'transform' }}
              >
                  <button 
                    onClick={() => setIsSheetCollapsed(!isSheetCollapsed)} 
                    className="md:hidden w-full h-8 flex items-center justify-center bg-brand-border/30"
                    aria-label={isSheetCollapsed ? 'Expand panel' : 'Collapse panel'}
                  >
                    {isSheetCollapsed ? <ChevronUpIcon className="w-6 h-6 text-brand-subtle" /> : <ChevronDownIcon className="w-6 h-6 text-brand-subtle" />}
                  </button>
                  <div className="p-4 md:p-6 overflow-y-auto flex-grow flex flex-col gap-8">
                    {error && (
                      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md" role="alert">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                      </div>
                    )}
                    <OutfitStack 
                      outfitHistory={activeOutfitLayers}
                      onRemoveLastGarment={handleRemoveLastGarment}
                    />
                    <WardrobePanel
                      onGarmentSelect={handleGarmentSelect}
                      activeGarmentIds={activeGarmentIds}
                      isLoading={isLoading}
                      wardrobe={wardrobe}
                      isWardrobeLoading={isWardrobeLoading}
                    />
                    <ShopTheLook items={activeOutfitLayers.map(l => l.garment)} onShopClick={handleShopClick} />
                  </div>
              </aside>
            </main>
            <AnimatePresence>
              {isLoading && isMobile && (
                <motion.div
                  className="fixed inset-0 bg-brand-bg/80 backdrop-blur-md flex flex-col items-center justify-center z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Spinner />
                  {loadingMessage && (
                    <p className="text-lg font-serif text-brand-text/90 mt-4 text-center px-4">{loadingMessage}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <Footer 
                isOnDressingScreen={isDressingScreenActive} 
                onNavigate={handleNavigate} 
            />
            <ShareModal
              isOpen={isShareModalOpen}
              onClose={() => setIsShareModalOpen(false)}
              isLoading={isSharing}
              shareUrl={shareUrl}
              error={shareError}
              imageUrl={sharedImageUrl ?? displayImageUrl}
            />
            <RedirectModal 
              isOpen={!!redirectInfo}
              onClose={() => setRedirectInfo(null)}
              onConfirm={() => {
                if (redirectInfo) {
                  window.open(redirectInfo.url, '_blank', 'noopener,noreferrer');
                  setRedirectInfo(null);
                }
              }}
              retailerName={redirectInfo?.retailerName ?? 'the retailer'}
            />
        </motion.div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'women':
        return <motion.div key="women" {...viewVariants}><CollectionPage category="Women" wardrobe={wardrobe} isWardrobeLoading={isWardrobeLoading} onProductSelect={handleProductSelect} onToggleWishlist={toggleWishlist} isInWishlist={isInWishlist} /></motion.div>;
      case 'men':
        return <motion.div key="men" {...viewVariants}><CollectionPage category="Men" wardrobe={wardrobe} isWardrobeLoading={isWardrobeLoading} onProductSelect={handleProductSelect} onToggleWishlist={toggleWishlist} isInWishlist={isInWishlist} /></motion.div>;
      case 'wishlist':
        return <motion.div key="wishlist" {...viewVariants}><WishlistPage wishlist={wishlist} wardrobe={wardrobe} isWardrobeLoading={isWardrobeLoading} onProductSelect={handleProductSelect} onToggleWishlist={toggleWishlist} isInWishlist={isInWishlist} /></motion.div>;
      case 'about':
        return <motion.div key="about" {...viewVariants}><AboutPage onNavigateBack={() => handleNavigate(previousPage)} /></motion.div>;
      case 'privacy':
        return <motion.div key="privacy" {...viewVariants}><PrivacyPolicyPage onNavigateBack={() => handleNavigate(previousPage)} /></motion.div>;
      case 'terms':
        return <motion.div key="terms" {...viewVariants}><TermsOfServicePage onNavigateBack={() => handleNavigate(previousPage)} /></motion.div>;
      case 'pdp':
        return pdpItem && <motion.div key={pdpItem.id} {...viewVariants}><ProductDetailsPage 
            item={pdpItem} 
            onBack={() => handleNavigate(previousPage)} 
            onTryOn={handleTryOnFromPdp}
            onShop={handleShopClick}
            wardrobe={wardrobe}
            onProductSelect={handleProductSelect}
            isWardrobeLoading={isWardrobeLoading}
            onToggleWishlist={toggleWishlist}
            isInWishlist={isInWishlist}
          /></motion.div>;
      case 'home':
      default:
        return <motion.div key="home" {...viewVariants}><HomePage onNavigate={handleNavigate} onProductSelect={handleProductSelect} newArrivals={wardrobe.slice(0, 10)} isWardrobeLoading={isWardrobeLoading} onToggleWishlist={toggleWishlist} isInWishlist={isInWishlist} /></motion.div>;
    }
  };

  // RENDER MAIN E-COMMERCE SITE
  return (
    <div className="font-sans bg-brand-bg text-brand-text min-h-screen flex flex-col">
      <Header 
        activePage={currentPage}
        onNavigate={handleNavigate} 
        onTryOnCtaClick={() => setIsUploadModalOpen(true)}
        wishlistCount={wishlist.length}
        onSearchClick={() => setIsSearchOpen(true)}
      />
      <main className="flex-grow">
          <AnimatePresence mode="wait">
              {renderPage()}
          </AnimatePresence>
      </main>
      <Footer 
        isOnDressingScreen={false} 
        onNavigate={handleNavigate} 
      />
      <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          wardrobe={wardrobe}
          onProductSelect={handleProductSelect}
      />
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        isLoading={isSharing}
        shareUrl={shareUrl}
        error={shareError}
        imageUrl={sharedImageUrl ?? displayImageUrl}
      />
      <RedirectModal 
        isOpen={!!redirectInfo}
        onClose={() => setRedirectInfo(null)}
        onConfirm={() => {
          if (redirectInfo) {
            window.open(redirectInfo.url, '_blank', 'noopener,noreferrer');
            setRedirectInfo(null);
          }
        }}
        retailerName={redirectInfo?.retailerName ?? 'the retailer'}
      />
      <UploadModelModal
        isOpen={isUploadModalOpen}
        onClose={() => {
            setIsUploadModalOpen(false);
            setPendingGarment(null); // Clear pending garment if modal is closed
            setError(null); // Clear any errors from a previous attempt
        }}
        onFileSelect={handleFileSelectForTryOn}
        pendingGarment={pendingGarment}
        isLoading={isLoading}
        loadingMessage={loadingMessage}
        error={error}
      />
    </div>
  );
};

export default App;