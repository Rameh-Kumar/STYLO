/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { ArrowUturnLeftIcon } from './icons';

interface PageProps {
  onNavigateBack: () => void;
}

const PrivacyPolicyPage: React.FC<PageProps> = ({ onNavigateBack }) => {
  return (
    <div className="bg-brand-bg min-h-screen">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <button onClick={onNavigateBack} className="flex items-center text-sm font-semibold text-brand-subtle hover:text-brand-text mb-8 transition-colors">
                <ArrowUturnLeftIcon className="w-4 h-4 mr-2" />
                Back
            </button>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-text mb-6">Privacy Policy</h1>
            <div className="text-brand-text/90 max-w-none space-y-4">
                <p className="text-brand-subtle">Last Updated: October 3, 2025</p>
                <p>STYLON ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.</p>
                
                <h2 className="text-2xl font-serif font-bold text-brand-text pt-6 pb-2">1. Information We Collect</h2>
                <p>We may collect information about you in a variety of ways. The information we may collect via the Application includes:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                    <li><strong>Images You Provide:</strong> We collect the photos you upload to the application for the sole purpose of generating your virtual model and try-on images. These images are processed by our AI service provider and are not stored on our servers long-term.</li>
                    <li><strong>Usage Data:</strong> We may automatically collect information about your device and how you use the application, such as your IP address, browser type, and operating system to improve our service.</li>
                </ul>

                <h2 className="text-2xl font-serif font-bold text-brand-text pt-6 pb-2">2. Use of Your Information</h2>
                <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                    <li>Generate your virtual model and try-on results.</li>
                    <li>Monitor and analyze usage and trends to improve your experience with the Application.</li>
                    <li>Ensure the security and operational functionality of our services.</li>
                </ul>

                <h2 className="text-2xl font-serif font-bold text-brand-text pt-6 pb-2">3. Disclosure of Your Information</h2>
                <p>We do not share, sell, rent, or trade your personal information with third parties for their commercial purposes. We may share information with our third-party AI service provider (Google Gemini) who performs services for us and are bound by confidentiality agreements.</p>
                
                <h2 className="text-2xl font-serif font-bold text-brand-text pt-6 pb-2">4. Security of Your Information</h2>
                <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>
                
                <h2 className="text-2xl font-serif font-bold text-brand-text pt-6 pb-2">5. Contact Us</h2>
                <p>If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:contact@stylon.tech" className="text-brand-teal hover:underline">contact@stylon.tech</a></p>
            </div>
        </div>
    </div>
  );
};

export default PrivacyPolicyPage;