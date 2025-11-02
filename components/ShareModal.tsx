/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, CheckCircleIcon, ShareIcon } from './icons';
import Spinner from './Spinner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  shareUrl: string | null;
  error: string | null;
  imageUrl: string | null;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, isLoading, shareUrl, error, imageUrl }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [isWebShareSupported, setIsWebShareSupported] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCopySuccess(false);
    }
    // Check for Web Share API support when component might be shown
    if (typeof navigator.share === 'function') {
        setIsWebShareSupported(true);
    }
  }, [isOpen]);

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }, (err) => {
        console.error('Could not copy text: ', err);
      });
    }
  };
  
  const handleNativeShare = async () => {
    if (!shareUrl || !imageUrl) return;

    const shareData: ShareData = {
      title: 'STYLON Virtual Try-On',
      text: 'Check out my new virtual try-on look created with STYLON! ✨',
      url: shareUrl,
    };

    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'stylon-look.jpeg', { type: blob.type });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ ...shareData, files: [file] });
        } else {
            await navigator.share(shareData);
        }
    } catch (err) {
        console.error('Error using Web Share API:', err);
        // Fallback to clipboard if user cancels or there's an error.
        // Or simply do nothing, as the user likely intended to cancel.
    }
  };

  const shareText = "Check out my new virtual try-on look created with STYLON! ✨";
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl || '')}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl || '')}`;
  const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl || '')}&media=${encodeURIComponent(imageUrl || '')}&description=${encodeURIComponent(shareText)}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-brand-surface rounded-2xl w-full max-w-md shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full text-brand-subtle hover:bg-brand-border/60 transition-colors"
              aria-label="Close"
            >
              <XIcon className="w-5 h-5" />
            </button>
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-serif font-bold text-brand-text mb-4 text-center">Share Your Look</h2>

              {imageUrl && <img src={imageUrl} alt="Your shared look" className="w-full aspect-[2/3] object-cover rounded-lg mb-4 bg-brand-border" />}

              {isLoading && (
                <div className="flex flex-col items-center justify-center h-24">
                  <Spinner />
                  <p className="text-brand-subtle mt-2">Generating your link...</p>
                </div>
              )}
              
              {error && (
                <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-md text-center">
                  <p>{error}</p>
                </div>
              )}

              {shareUrl && (
                <div className="space-y-4 animate-fade-in">
                    {isWebShareSupported ? (
                        <button 
                            onClick={handleNativeShare}
                            className="w-full flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-brand-teal rounded-md cursor-pointer hover:bg-teal-700 transition-colors"
                        >
                            <ShareIcon className="w-5 h-5 mr-2" />
                            Share via...
                        </button>
                    ) : (
                        <>
                            <div className="grid grid-cols-3 gap-3">
                                <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="text-center font-semibold text-brand-text py-2 px-3 bg-brand-border/70 rounded-md hover:bg-brand-border transition-colors">X / Twitter</a>
                                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="text-center font-semibold text-brand-text py-2 px-3 bg-brand-border/70 rounded-md hover:bg-brand-border transition-colors">Facebook</a>
                                <a href={pinterestUrl} target="_blank" rel="noopener noreferrer" className="text-center font-semibold text-brand-text py-2 px-3 bg-brand-border/70 rounded-md hover:bg-brand-border transition-colors">Pinterest</a>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="text" value={shareUrl} readOnly className="w-full px-3 py-2 border border-brand-border rounded-md bg-brand-bg text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal" />
                                <button onClick={handleCopy} className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${copySuccess ? 'bg-green-500 text-white' : 'bg-brand-teal text-white hover:bg-teal-700'}`}>
                                    {copySuccess ? <CheckCircleIcon className="w-5 h-5"/> : 'Copy'}
                                </button>
                            </div>
                        </>
                    )}
                    <p className="text-xs text-brand-subtle text-center pt-2">
                        P.S. Don't forget to tag <strong className="font-semibold text-brand-text/90">@stylon.tech</strong> on Instagram! ✨
                    </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;