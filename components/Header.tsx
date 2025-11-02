/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloudIcon, MenuIcon, XIcon, SparklesIcon, HeartIcon, SearchIcon } from './icons';

type Page = 'home' | 'women' | 'men' | 'pdp' | 'about' | 'privacy' | 'terms' | 'wishlist';

interface HeaderProps {
    activePage: Page;
    onNavigate: (page: Page) => void;
    onTryOnCtaClick: () => void;
    wishlistCount: number;
    onSearchClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ activePage, onNavigate, onTryOnCtaClick, wishlistCount, onSearchClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleNavClick = (page: Page) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  const handleTryOnClick = () => {
    onTryOnCtaClick();
    setIsMenuOpen(false);
  };
  
  const navItems: { page: 'women' | 'men', label: string, path: string }[] = [
      { page: 'women', label: 'Women', path: '#/women' },
      { page: 'men', label: 'Men', path: '#/men' },
  ];

  return (
    <>
      <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${isScrolled ? 'bg-brand-bg/80 backdrop-blur-md border-b border-brand-border' : 'bg-transparent border-b border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <a href="#/" onClick={(e) => { e.preventDefault(); handleNavClick('home'); }} className="text-2xl font-serif font-bold text-brand-text">
                STYLON
              </a>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex md:items-center md:space-x-10">
              {navItems.map(item => (
                <a
                    key={item.page}
                    href={item.path}
                    onClick={(e) => { e.preventDefault(); handleNavClick(item.page); }}
                    className={`text-sm font-semibold transition-colors focus:outline-none relative ${activePage === item.page ? 'text-brand-teal' : 'text-brand-text/70 hover:text-brand-text'}`}
                    aria-current={activePage === item.page ? 'page' : undefined}
                >
                    {item.label}
                    {activePage === item.page && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-brand-teal rounded-full"></span>}
                </a>
              ))}
            </nav>

            <div className="flex items-center">
              {/* Desktop Icons */}
              <div className="hidden md:flex items-center gap-2">
                 <button
                    onClick={onSearchClick}
                    className="p-2 rounded-full text-brand-text/70 hover:text-brand-text hover:bg-brand-border/60 transition-colors"
                    aria-label="Search"
                 >
                    <SearchIcon className="h-6 w-6" />
                 </button>
                 <button
                    onClick={() => handleNavClick('wishlist')}
                    className="flex items-center justify-center p-2 rounded-full text-brand-text/70 hover:text-brand-text hover:bg-brand-border/60 transition-colors relative"
                    aria-label={`Wishlist, ${wishlistCount} items`}
                 >
                    <HeartIcon className="h-6 w-6" />
                    {wishlistCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                            {wishlistCount}
                        </span>
                    )}
                 </button>
              </div>

              <button
                onClick={onTryOnCtaClick}
                className="hidden md:flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-brand-teal rounded-md cursor-pointer hover:bg-teal-700 transition-colors ml-4"
              >
                <SparklesIcon className="w-4 h-4 mr-2" />
                Virtual Try-On
              </button>

              {/* Mobile Icons */}
              <div className="md:hidden flex items-center">
                 <button
                    onClick={onSearchClick}
                    className="p-2 rounded-md text-brand-text hover:bg-brand-border/60"
                    aria-label="Search"
                 >
                    <SearchIcon className="h-6 w-6" />
                 </button>
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-brand-text hover:bg-brand-border/60 focus:outline-none"
                  aria-label="Open main menu"
                >
                  <MenuIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-brand-bg/95 backdrop-blur-sm md:hidden"
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col items-center justify-center h-full"
            >
              <button onClick={() => setIsMenuOpen(false)} className="absolute top-4 right-4 p-2" aria-label="Close menu">
                <XIcon className="h-6 w-6 text-brand-text" />
              </button>

              <nav className="flex flex-col items-center space-y-8">
                  {navItems.map(item => (
                      <a
                        key={item.page}
                        href={item.path}
                        onClick={(e) => { e.preventDefault(); handleNavClick(item.page); }}
                        className={`text-2xl font-semibold transition-colors focus:outline-none ${activePage === item.page ? 'text-brand-teal' : 'text-brand-text/70 hover:text-brand-text'}`}
                        aria-current={activePage === item.page ? 'page' : undefined}
                      >
                        {item.label}
                      </a>
                  ))}
                   <a
                      href="#/wishlist"
                      onClick={(e) => { e.preventDefault(); handleNavClick('wishlist'); }}
                      className={`flex items-center text-2xl font-semibold transition-colors focus:outline-none ${activePage === 'wishlist' ? 'text-brand-teal' : 'text-brand-text/70 hover:text-brand-text'}`}
                      aria-current={activePage === 'wishlist' ? 'page' : undefined}
                    >
                      Wishlist
                      {wishlistCount > 0 && (
                        <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
                          {wishlistCount}
                        </span>
                      )}
                    </a>
                  <button
                    onClick={handleTryOnClick}
                    className="flex items-center justify-center px-6 py-3 text-lg font-semibold text-white bg-brand-teal rounded-md cursor-pointer hover:bg-teal-700 transition-colors mt-8"
                  >
                    <SparklesIcon className="w-5 h-5 mr-3" />
                    Virtual Try-On
                  </button>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;