"use client";

import React, { useEffect, useRef } from "react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
}

export default function VideoModal({ isOpen, onClose, videoSrc }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Lock scroll when modal is open
      document.body.style.overflow = "hidden";
      
      // Auto-play the video when the modal opens
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.log("Auto-play was prevented by the browser. Awaiting user interaction.", err);
          });
        }
      }
    } else {
      // Restore scroll when closed
      document.body.style.overflow = "";
      
      // Pause video when closed
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }

    // Cleanup scroll lock on unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md transition-all duration-300 animate-fade-in">
      {/* Click outside to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl mx-4 aspect-video bg-neutral-950 rounded-lg overflow-hidden border border-white/10 shadow-2xl z-10 animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/80 transition-all border border-white/10 hover:scale-105 cursor-pointer"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Video Player */}
        <video
          ref={videoRef}
          src={videoSrc}
          controls
          autoPlay
          playsInline
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
