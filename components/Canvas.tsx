/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCcwIcon, ChevronLeftIcon, ChevronRightIcon, ZoomInIcon, ZoomOutIcon, MaximizeIcon, SparklesIcon, Share2Icon } from './icons';
import Spinner from './Spinner';
import { AnimatePresence, motion } from 'framer-motion';

interface CanvasProps {
  displayImageUrl: string | null;
  onStartOver: () => void;
  onShare: () => void;
  isLoading: boolean;
  loadingMessage: string;
  onSelectPose: (index: number) => void;
  poseInstructions: string[];
  currentPoseIndex: number;
  availablePoseKeys: string[];
  onEnhanceImage: () => void;
  isEnhanced: boolean;
}

const Canvas: React.FC<CanvasProps> = ({ 
  displayImageUrl, 
  onStartOver,
  onShare,
  isLoading, 
  loadingMessage, 
  onSelectPose, 
  poseInstructions, 
  currentPoseIndex, 
  availablePoseKeys,
  onEnhanceImage,
  isEnhanced
}) => {
  const [isPoseMenuOpen, setIsPoseMenuOpen] = useState(false);
  
  // State and refs for zoom/pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const pinchStartRef = useRef({
    distance: 0,
    zoom: 1,
    pan: { x: 0, y: 0 },
    midpoint: { x: 0, y: 0 },
  });

  // Reset zoom and pan when the image changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [displayImageUrl]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => {
    setZoom(prev => {
      const newZoom = Math.max(prev - 0.2, 1);
      if (newZoom <= 1) {
        setPan({ x: 0, y: 0 }); // Reset pan when zoomed all the way out
      }
      return newZoom;
    });
  };
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handlePanStart = useCallback((clientX: number, clientY: number) => {
    if (zoom <= 1) return;
    setIsPanning(true);
    lastPointRef.current = { x: clientX, y: clientY };
  }, [zoom]);

  const handlePanMove = useCallback((clientX: number, clientY: number) => {
    if (!isPanning) return;
    const dx = clientX - lastPointRef.current.x;
    const dy = clientY - lastPointRef.current.y;
    lastPointRef.current = { x: clientX, y: clientY };
    setPan(prev => {
      const newPan = { x: prev.x + dx, y: prev.y + dy };
      
      if (imageRef.current && viewportRef.current) {
        const imageW = imageRef.current.offsetWidth;
        const imageH = imageRef.current.offsetHeight;
        const viewportW = viewportRef.current.offsetWidth;
        const viewportH = viewportRef.current.offsetHeight;
        
        const panLimitX = Math.max(0, (imageW * zoom - viewportW) / 2);
        const panLimitY = Math.max(0, (imageH * zoom - viewportH) / 2);

        newPan.x = Math.max(-panLimitX, Math.min(panLimitX, newPan.x));
        newPan.y = Math.max(-panLimitY, Math.min(panLimitY, newPan.y));
      }

      return newPan;
    });
  }, [isPanning, zoom]);

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (isLoading) return;
    e.preventDefault();
    const zoomDirection = e.deltaY < 0 ? 1 : -1; // 1 for zoom in, -1 for zoom out
    const zoomFactor = 0.1;
    setZoom(prev => {
      const newZoom = Math.max(1, Math.min(prev + zoomDirection * zoomFactor, 3));
       if (newZoom <= 1) {
        setPan({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handlePreviousPose = () => {
    if (isLoading || availablePoseKeys.length <= 1) return;

    const currentPoseInstruction = poseInstructions[currentPoseIndex];
    const currentIndexInAvailable = availablePoseKeys.indexOf(currentPoseInstruction);
    
    // Fallback if current pose not in available list (shouldn't happen)
    if (currentIndexInAvailable === -1) {
        onSelectPose((currentPoseIndex - 1 + poseInstructions.length) % poseInstructions.length);
        return;
    }

    const prevIndexInAvailable = (currentIndexInAvailable - 1 + availablePoseKeys.length) % availablePoseKeys.length;
    const prevPoseInstruction = availablePoseKeys[prevIndexInAvailable];
    const newGlobalPoseIndex = poseInstructions.indexOf(prevPoseInstruction);
    
    if (newGlobalPoseIndex !== -1) {
        onSelectPose(newGlobalPoseIndex);
    }
  };

  const handleNextPose = () => {
    if (isLoading) return;

    const currentPoseInstruction = poseInstructions[currentPoseIndex];
    const currentIndexInAvailable = availablePoseKeys.indexOf(currentPoseInstruction);

    // Fallback or if there are no generated poses yet
    if (currentIndexInAvailable === -1 || availablePoseKeys.length === 0) {
        onSelectPose((currentPoseIndex + 1) % poseInstructions.length);
        return;
    }
    
    const nextIndexInAvailable = currentIndexInAvailable + 1;
    if (nextIndexInAvailable < availablePoseKeys.length) {
        // There is another generated pose, navigate to it
        const nextPoseInstruction = availablePoseKeys[nextIndexInAvailable];
        const newGlobalPoseIndex = poseInstructions.indexOf(nextPoseInstruction);
        if (newGlobalPoseIndex !== -1) {
            onSelectPose(newGlobalPoseIndex);
        }
    } else {
        // At the end of generated poses, generate the next one from the master list
        const newGlobalPoseIndex = (currentPoseIndex + 1) % poseInstructions.length;
        onSelectPose(newGlobalPoseIndex);
    }
  };

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLImageElement>) => {
    if (isLoading) return;
    if (e.touches.length === 2) {
      e.preventDefault();
      setIsPinching(true);
      setIsPanning(false);
      pinchStartRef.current = {
        distance: Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        ),
        zoom,
        pan,
        midpoint: {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        },
      };
    } else if (e.touches.length === 1) {
      handlePanStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [isLoading, zoom, pan, handlePanStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLImageElement>) => {
    if (isLoading) return;
    if (e.touches.length === 2) {
        e.preventDefault();
        const { zoom: initialZoom, pan: initialPan, distance: initialDistance, midpoint: initialMidpoint } = pinchStartRef.current;
        
        const newDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        const scale = newDistance / initialDistance;
        let newZoom = Math.max(1, Math.min(initialZoom * scale, 3));
        
        const newMidpoint = {
            x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
            y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        };

        const imagePoint = {
            x: (initialMidpoint.x - initialPan.x) / initialZoom,
            y: (initialMidpoint.y - initialPan.y) / initialZoom,
        };
        
        let newPan = {
            x: newMidpoint.x - imagePoint.x * newZoom,
            y: newMidpoint.y - imagePoint.y * newZoom,
        };

        if (newZoom <= 1) {
            newZoom = 1;
            newPan = { x: 0, y: 0 };
        } else if (imageRef.current && viewportRef.current) {
            const imageW = imageRef.current.offsetWidth;
            const imageH = imageRef.current.offsetHeight;
            const viewportW = viewportRef.current.offsetWidth;
            const viewportH = viewportRef.current.offsetHeight;
            
            const panLimitX = Math.max(0, (imageW * newZoom - viewportW) / 2);
            const panLimitY = Math.max(0, (imageH * newZoom - viewportH) / 2);
            
            newPan.x = Math.max(-panLimitX, Math.min(panLimitX, newPan.x));
            newPan.y = Math.max(-panLimitY, Math.min(panLimitY, newPan.y));
        }
        
        setZoom(newZoom);
        setPan(newPan);

    } else if (e.touches.length === 1) {
        handlePanMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [isLoading, handlePanMove]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLImageElement>) => {
    if (isLoading) return;
    setIsPinching(false);
    handlePanEnd();

    if (e.touches.length === 1) {
      handlePanStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [isLoading, handlePanEnd, handlePanStart]);
  
  return (
    <div className="w-full h-full flex items-center justify-center p-4 relative animate-zoom-in group">
      {/* Top-left Buttons */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
        <button 
            onClick={onStartOver}
            className="flex items-center justify-center text-center bg-brand-surface/60 border border-brand-border text-brand-text font-semibold py-2 px-4 rounded-full transition-all duration-200 ease-in-out hover:bg-brand-surface hover:border-brand-border/80 active:scale-95 text-sm backdrop-blur-sm"
        >
            <RotateCcwIcon className="w-4 h-4 mr-2" />
            Start Over
        </button>
        <button 
            onClick={onShare}
            className="flex items-center justify-center text-center bg-brand-surface/60 border border-brand-border text-brand-text font-semibold py-2 px-4 rounded-full transition-all duration-200 ease-in-out hover:bg-brand-surface hover:border-brand-border/80 active:scale-95 text-sm backdrop-blur-sm"
        >
            <Share2Icon className="w-4 h-4 mr-2" />
            Share
        </button>
      </div>


      {/* Zoom & Enhance Controls */}
      {displayImageUrl && !isLoading && (
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-1 bg-brand-surface/60 backdrop-blur-md rounded-full p-1 border border-brand-border/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button onClick={onEnhanceImage} aria-label="Enhance Quality" className="p-2 rounded-full hover:bg-brand-surface/80 active:scale-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading || isEnhanced}>
                <SparklesIcon className="w-5 h-5 text-brand-text" />
            </button>
            <button onClick={handleZoomIn} aria-label="Zoom In" className="p-2 rounded-full hover:bg-brand-surface/80 active:scale-90 transition-all disabled:opacity-50" disabled={zoom >= 3}>
                <ZoomInIcon className="w-5 h-5 text-brand-text" />
            </button>
            <button onClick={handleZoomOut} aria-label="Zoom Out" className="p-2 rounded-full hover:bg-brand-surface/80 active:scale-90 transition-all disabled:opacity-50" disabled={zoom <= 1}>
                <ZoomOutIcon className="w-5 h-5 text-brand-text" />
            </button>
            <button onClick={handleResetZoom} aria-label="Reset Zoom" className="p-2 rounded-full hover:bg-brand-surface/80 active:scale-90 transition-all disabled:opacity-50" disabled={zoom <= 1 && pan.x === 0 && pan.y === 0}>
                <MaximizeIcon className="w-5 h-5 text-brand-text" />
            </button>
        </div>
      )}


      {/* Image Display or Placeholder */}
      <div 
        ref={viewportRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onWheel={handleWheel}
      >
        {isEnhanced && (
            <div className="absolute top-2 left-2 z-10 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm pointer-events-none">
                HD
            </div>
        )}
        {displayImageUrl ? (
          <img
            ref={imageRef}
            key={displayImageUrl} // Use key to force re-render and trigger animation on image change
            src={displayImageUrl}
            alt="Virtual try-on model"
            className="max-w-full max-h-full object-contain rounded-lg select-none"
            style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                cursor: zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
                transition: isPanning || isPinching ? 'none' : 'transform 0.2s ease-out',
                touchAction: 'none' // Prevent default browser actions on touch devices
            }}
            draggable={false}
            onMouseDown={(e) => handlePanStart(e.clientX, e.clientY)}
            onMouseMove={(e) => handlePanMove(e.clientX, e.clientY)}
            onMouseUp={handlePanEnd}
            onMouseLeave={handlePanEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        ) : (
            <div className="w-[400px] h-[600px] bg-brand-border/50 border border-brand-border rounded-lg flex flex-col items-center justify-center">
              <Spinner />
              <p className="text-md font-serif text-brand-text/70 mt-4">Loading Model...</p>
            </div>
        )}
        
        <AnimatePresence>
          {isLoading && (
              <motion.div
                  className="absolute inset-0 bg-brand-surface/80 backdrop-blur-md flex flex-col items-center justify-center z-20 rounded-lg"
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
      </div>

      {/* Pose Controls */}
      {displayImageUrl && !isLoading && (
        <div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onMouseEnter={() => setIsPoseMenuOpen(true)}
          onMouseLeave={() => setIsPoseMenuOpen(false)}
        >
          {/* Pose popover menu */}
          <AnimatePresence>
              {isPoseMenuOpen && (
                  <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute bottom-full mb-3 w-64 bg-brand-surface/80 backdrop-blur-lg rounded-xl p-2 border border-brand-border"
                  >
                      <div className="grid grid-cols-2 gap-2">
                          {poseInstructions.map((pose, index) => (
                              <button
                                  key={pose}
                                  onClick={() => onSelectPose(index)}
                                  disabled={isLoading || index === currentPoseIndex}
                                  className="w-full text-left text-sm font-medium text-brand-text p-2 rounded-md hover:bg-brand-border/60 disabled:opacity-50 disabled:bg-brand-border/60 disabled:font-bold disabled:cursor-not-allowed"
                              >
                                  {pose}
                              </button>
                          ))}
                      </div>
                  </motion.div>
              )}
          </AnimatePresence>
          
          <div className="flex items-center justify-center gap-2 bg-brand-surface/60 backdrop-blur-md rounded-full p-2 border border-brand-border/80">
            <button 
              onClick={handlePreviousPose}
              aria-label="Previous pose"
              className="p-2 rounded-full hover:bg-brand-surface/80 active:scale-90 transition-all disabled:opacity-50"
              disabled={isLoading}
            >
              <ChevronLeftIcon className="w-5 h-5 text-brand-text" />
            </button>
            <span className="text-sm font-semibold text-brand-text w-48 text-center truncate" title={poseInstructions[currentPoseIndex]}>
              {poseInstructions[currentPoseIndex]}
            </span>
            <button 
              onClick={handleNextPose}
              aria-label="Next pose"
              className="p-2 rounded-full hover:bg-brand-surface/80 active:scale-90 transition-all disabled:opacity-50"
              disabled={isLoading}
            >
              <ChevronRightIcon className="w-5 h-5 text-brand-text" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;