/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, ExternalLinkIcon } from './icons';

interface RedirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  retailerName: string;
}

const RedirectModal: React.FC<RedirectModalProps> = ({ isOpen, onClose, onConfirm, retailerName }) => {
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
            className="bg-brand-surface rounded-2xl w-full max-w-sm shadow-2xl relative p-6 md:p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full text-brand-subtle hover:bg-brand-border/60 transition-colors"
              aria-label="Close"
            >
              <XIcon className="w-5 h-5" />
            </button>
            
            <div className="mx-auto w-12 h-12 bg-brand-teal/10 text-brand-teal rounded-full flex items-center justify-center mb-4">
              <ExternalLinkIcon className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-serif font-bold text-brand-text mb-2">You're heading to {retailerName}</h2>
            <p className="text-brand-subtle mb-6">
              You'll be redirected to their website to complete your purchase. We'll take you right to the product page!
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={onConfirm}
                className="w-full bg-brand-teal text-white font-semibold py-2.5 px-4 rounded-md transition-colors duration-200 ease-in-out hover:bg-teal-700 active:scale-95"
              >
                Continue to {retailerName}
              </button>
              <button
                onClick={onClose}
                className="w-full bg-brand-border/70 text-brand-text font-semibold py-2.5 px-4 rounded-md transition-colors duration-200 ease-in-out hover:bg-brand-border active:scale-95"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RedirectModal;
