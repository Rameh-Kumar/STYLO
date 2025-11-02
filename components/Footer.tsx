/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface FooterProps {
  isOnDressingScreen?: boolean;
  onNavigate: (page: 'home' | 'about' | 'privacy' | 'terms') => void;
}

const Footer: React.FC<FooterProps> = ({ isOnDressingScreen = false, onNavigate }) => {
  return (
    <footer className={`w-full bg-brand-bg/80 backdrop-blur-md border-t border-brand-border p-3 z-30 ${isOnDressingScreen ? 'hidden sm:block fixed bottom-0 left-0 right-0' : 'relative'}`}>
      <div className="mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-brand-text/80 max-w-7xl px-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <a href="#/" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="font-serif text-sm font-bold text-brand-text">STYLON</a>
          <p>Your Style, Reimagined with AI.</p>
        </div>
        <nav className="flex flex-col sm:flex-row items-center gap-x-6 gap-y-2 mt-2 sm:mt-0">
            <div className="flex items-center gap-x-4">
                <a href="#/about" onClick={(e) => { e.preventDefault(); onNavigate('about'); }} className="hover:underline">About</a>
                <a href="#/privacy" onClick={(e) => { e.preventDefault(); onNavigate('privacy'); }} className="hover:underline">Privacy Policy</a>
                <a href="#/terms" onClick={(e) => { e.preventDefault(); onNavigate('terms'); }} className="hover:underline">Terms of Service</a>
            </div>
            <a href="https://www.instagram.com/stylon.tech/" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-text hover:underline">Follow us</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;