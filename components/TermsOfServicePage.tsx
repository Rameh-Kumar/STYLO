/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { ArrowUturnLeftIcon } from './icons';

interface PageProps {
  onNavigateBack: () => void;
}

const TermsOfServicePage: React.FC<PageProps> = ({ onNavigateBack }) => {
  return (
    <div className="bg-brand-bg min-h-screen">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <button onClick={onNavigateBack} className="flex items-center text-sm font-semibold text-brand-subtle hover:text-brand-text mb-8 transition-colors">
                <ArrowUturnLeftIcon className="w-4 h-4 mr-2" />
                Back
            </button>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-text mb-6">Terms of Service</h1>
            <div className="text-brand-text/90 max-w-none space-y-4">
                <p className="text-brand-subtle">Last Updated: October 3, 2025</p>
                <p>Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the STYLON application (the "Service") operated by us.</p>
                <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>
                
                <h2 className="text-2xl font-serif font-bold text-brand-text pt-6 pb-2">1. Acceptance of Terms</h2>
                <p>By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>

                <h2 className="text-2xl font-serif font-bold text-brand-text pt-6 pb-2">2. Use of the Service</h2>
                <p>You agree not to use the Service to create any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable. You are solely responsible for the images you upload and the content you create.</p>
                <p>We grant you a limited, non-exclusive, non-transferable, revocable license to use the Service for your personal, non-commercial purposes.</p>

                <h2 className="text-2xl font-serif font-bold text-brand-text pt-6 pb-2">3. Intellectual Property</h2>
                <p>The Service and its original content, features, and functionality are and will remain the exclusive property of STYLON and its licensors. You retain ownership of the images you upload. By using the service, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and modify your content for the purpose of providing the Service to you.</p>

                <h2 className="text-2xl font-serif font-bold text-brand-text pt-6 pb-2">4. Termination</h2>
                <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

                <h2 className="text-2xl font-serif font-bold text-brand-text pt-6 pb-2">5. Changes to Terms</h2>
                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms of Service on this page.</p>

                <h2 className="text-2xl font-serif font-bold text-brand-text pt-6 pb-2">6. Contact Us</h2>
                <p>If you have any questions about these Terms, please contact us at: <a href="mailto:contact@stylon.tech" className="text-brand-teal hover:underline">contact@stylon.tech</a></p>
            </div>
        </div>
    </div>
  );
};

export default TermsOfServicePage;