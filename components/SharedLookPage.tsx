/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { WardrobeItem } from '../types';
import Spinner from './Spinner';
import ShopTheLook from './AddProductModal';
import { ShirtIcon } from './icons';
import RedirectModal from './RedirectModal';
import { getRetailerName } from '../lib/utils';

interface SharedLookPageProps {
  id: string;
  onNavigate: (page: 'home' | 'about' | 'privacy' | 'terms') => void;
}

interface SharedLook {
  id: string;
  created_at: string;
  image_url: string;
  product_ids: string[];
}

const SharedLookPage: React.FC<SharedLookPageProps> = ({ id, onNavigate }) => {
  const [look, setLook] = useState<SharedLook | null>(null);
  const [products, setProducts] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirectInfo, setRedirectInfo] = useState<{url: string; retailerName: string} | null>(null);

  useEffect(() => {
    const fetchLook = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: lookData, error: lookError } = await supabase
          .from('shared_looks')
          .select('*')
          .eq('id', id)
          .single();

        if (lookError || !lookData) {
          throw new Error('Look not found.');
        }
        setLook(lookData);

        if (lookData.product_ids && lookData.product_ids.length > 0) {
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('*')
            .in('id', lookData.product_ids);

          if (productError) {
            throw new Error('Could not load products for this look.');
          }
          
          const sanitizedData = (productData as any[]).map(item => {
              let imageUrls = item.image_urls || [];
              if (!Array.isArray(imageUrls)) {
                  imageUrls = [];
              }
              if (imageUrls.length === 0 && typeof item.image_url === 'string') {
                  imageUrls.push(item.image_url);
              }
              return { ...item, image_urls: imageUrls };
          }).filter(item => item.image_urls.length > 0);
          
          setProducts(sanitizedData as WardrobeItem[]);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading the shared look.');
      } finally {
        setLoading(false);
      }
    };

    fetchLook();
  }, [id]);

  const handleShopClick = (item: WardrobeItem) => {
    if (item.product_url) {
      setRedirectInfo({
        url: item.product_url,
        retailerName: getRetailerName(item.product_url),
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Spinner />
        <p className="mt-4 text-lg font-serif text-brand-subtle">Loading Shared Look...</p>
      </div>
    );
  }

  if (error || !look) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h1 className="text-3xl font-serif font-bold text-red-600">Oops!</h1>
        <p className="mt-2 text-lg text-brand-text">{error || 'This look could not be found.'}</p>
        <button 
          onClick={() => onNavigate('home')} 
          className="mt-6 px-6 py-3 text-base font-semibold text-white bg-brand-teal rounded-md cursor-pointer hover:bg-teal-700 transition-colors"
        >
          Create Your Own Style
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
        <div className="w-full bg-brand-surface text-center py-4">
            <p className="text-brand-text">
                <span className="font-semibold">Someone shared a STYLON look with you!</span> 
                <button onClick={() => onNavigate('home')} className="ml-2 text-brand-teal font-bold hover:underline">Try it yourself!</button>
            </p>
        </div>
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div className="flex items-center justify-center">
                    <img src={look.image_url} alt="Shared virtual try-on look" className="rounded-xl shadow-2xl w-full max-w-lg aspect-[2/3] object-cover bg-brand-border" />
                </div>
                <div className="flex flex-col justify-center">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-text leading-tight mb-6">Style, Reimagined.</h1>
                    <div className="bg-brand-surface p-6 rounded-xl border border-brand-border">
                        <ShopTheLook items={products} onShopClick={handleShopClick} />
                        {products.length === 0 && (
                            <p className="text-brand-subtle text-center">This look features custom uploaded items and isn't shoppable.</p>
                        )}
                    </div>
                    <button 
                      onClick={() => onNavigate('home')} 
                      className="mt-8 w-full flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-brand-teal rounded-md cursor-pointer group hover:bg-teal-700 transition-colors"
                    >
                      <ShirtIcon className="w-6 h-6 mr-3" />
                      Create Your Own Look
                    </button>
                </div>
            </div>
        </div>
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
    </div>
  );
};

export default SharedLookPage;