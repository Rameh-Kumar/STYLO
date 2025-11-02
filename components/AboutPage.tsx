/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { ArrowUturnLeftIcon } from './icons';

interface PageProps {
  onNavigateBack: () => void;
}

const AboutPage: React.FC<PageProps> = ({ onNavigateBack }) => {
  return (
    <div className="bg-brand-bg min-h-screen">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <button onClick={onNavigateBack} className="flex items-center text-sm font-semibold text-brand-subtle hover:text-brand-text mb-8 transition-colors">
                <ArrowUturnLeftIcon className="w-4 h-4 mr-2" />
                Back
            </button>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-text mb-6">About STYLON</h1>
            <div className="text-brand-text/90 max-w-none space-y-4 text-lg">
                <p><strong>STYLON is a generative AI-powered virtual fitting room that redefines the way you shop for clothes.</strong> We believe that everyone deserves to feel confident in their style, and that begins with knowing how an item will truly look and fit before you buy it.</p>
                
                <h2 className="text-3xl font-serif font-bold text-brand-text pt-8 pb-2">Our Mission</h2>
                <p>Our mission is to eliminate the guesswork and uncertainty from online shopping. By providing a photorealistic virtual try-on experience, we empower users to explore new styles, make confident purchasing decisions, and reduce the environmental impact of returns. We're bridging the gap between the digital and physical wardrobe, making fashion more accessible, personal, and sustainable for everyone.</p>
                
                <h2 className="text-3xl font-serif font-bold text-brand-text pt-8 pb-2">The Technology</h2>
                <p>STYLON is built on the cutting-edge Google Nano Banana. When you upload your photo, our advanced AI models create a personalized, digital model that accurately reflects your unique features and body type. From there, another AI model specialized in image editing seamlessly drapes any selected garment onto your model, accounting for pose, lighting, and texture to create a stunningly realistic result. It’s more than an overlay; it’s a true virtual try-on, brought to life by the power of generative AI.</p>
            </div>
        </div>
    </div>
  );
};

export default AboutPage;