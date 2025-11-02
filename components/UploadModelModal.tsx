/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WardrobeItem } from '../types';
import Spinner from './Spinner';
import { XIcon, UploadCloudIcon } from './icons';

interface UploadModelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFileSelect: (file: File) => void;
    pendingGarment: WardrobeItem | null;
    isLoading: boolean;
    loadingMessage: string;
    error: string | null;
}

const UploadModelModal: React.FC<UploadModelModalProps> = ({ isOpen, onClose, onFileSelect, pendingGarment, isLoading, loadingMessage, error }) => {
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    const triggerFileUpload = () => {
        const fileInput = document.getElementById('modal-image-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.click();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={isLoading ? undefined : onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 20, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="bg-brand-surface rounded-2xl w-full max-w-lg shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {!isLoading && (
                            <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full text-brand-subtle hover:bg-brand-border/60 transition-colors" aria-label="Close">
                                <XIcon className="w-5 h-5" />
                            </button>
                        )}
                        
                        <div className="p-6 md:p-8 text-center">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-48">
                                    <Spinner />
                                    <p className="text-lg font-serif text-brand-text/90 mt-4 text-center px-4">
                                        {loadingMessage || 'Processing...'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-text">
                                        {pendingGarment ? 'Virtually Try On' : 'Create Your Model'}
                                    </h1>

                                    {pendingGarment && (
                                        <>
                                            <p className="text-xl font-serif text-brand-text/80 mt-2 mb-4">{pendingGarment.name}</p>
                                            <div className="aspect-[3/4] w-32 mx-auto rounded-lg bg-brand-border overflow-hidden mb-4 shadow-lg">
                                                <img src={pendingGarment.image_urls[0]} alt={pendingGarment.name} className="w-full h-full object-cover"/>
                                            </div>
                                        </>
                                    )}

                                    <h2 className="text-xl font-serif text-brand-text mt-4 mb-2">Upload Your Photo</h2>
                                    <p className="text-brand-subtle mb-6 max-w-sm mx-auto">For the best results, use a clear, full-body photo where your outfit is visible.</p>

                                    <button 
                                        onClick={triggerFileUpload}
                                        className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-brand-teal rounded-md cursor-pointer hover:bg-teal-700 transition-colors"
                                    >
                                      <UploadCloudIcon className="w-5 h-5 mr-3" />
                                      Choose Photo to Continue
                                    </button>
                                    
                                    <input id="modal-image-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp, image/avif, image/heic, image/heif" onChange={handleFileChange} />
                                    
                                    {error && (
                                        <p className="text-red-500 text-sm mt-4">{error}</p>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default UploadModelModal;