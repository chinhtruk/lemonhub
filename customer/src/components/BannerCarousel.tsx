'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiArrowRight } from 'react-icons/fi';

interface Banner {
  id: number;
  image: string;
  link?: string;
}

interface BannerCarouselProps {
  banners: Banner[];
  isLoading?: boolean;
  autoSlideInterval?: number;
}

const BannerCarousel = ({
  banners = [],
  isLoading = false,
  autoSlideInterval = 5000,
}: BannerCarouselProps) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Auto slide banners
  useEffect(() => {
    if (banners.length === 0 || isHovering) return;
    
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, autoSlideInterval);
    
    return () => clearInterval(timer);
  }, [banners.length, autoSlideInterval, isHovering]);

  return (
    <div 
      className="relative w-full h-full aspect-[16/5] md:aspect-[16/5] lg:aspect-[16/6] overflow-hidden group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {isLoading ? (
        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
      ) :
        banners.map((banner, index) => (
          <Link
            key={banner.id}
            href={banner.link || '/product'}
            className={`absolute inset-0 w-full h-full transition-all duration-[1.2s] ease-in-out transform ${
              index === currentBanner 
                ? 'opacity-100 translate-x-0 scale-100' 
                : 'opacity-0 translate-x-full scale-105'
            }`}
          >
            {/* Image background with zoom effect */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <div className={`absolute inset-0 w-full h-full transition-transform duration-[8s] ease-out ${
                index === currentBanner ? 'scale-110' : 'scale-100'
              }`}>
                <Image
                  src={banner.image}
                  alt="Banner"
                  fill
                  className="object-cover object-center w-full h-full"
                  priority
                  quality={100}
                  sizes="100vw"
                />
              </div>
            </div>
          </Link>
        ))
      }
      {/* Banner navigation */}
      {banners.length > 1 && (
        <>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                aria-label={`Chuyển đến banner ${index + 1}`}
                className={`h-1 rounded-full transition-all duration-500 ${
                  index === currentBanner 
                    ? 'bg-white/80 w-6' 
                    : 'bg-white/40 w-3 hover:bg-white/60 hover:w-4'
                }`}
              />
            ))}
          </div>
          {/* Navigation arrows */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
            }}
            aria-label="Banner trước"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 
              bg-black/20 hover:bg-black/40 text-white/90 p-2 rounded-full transition-all duration-300 
              backdrop-blur-sm hover:scale-110 z-10"
          >
            <FiArrowRight className="w-5 h-5 transform rotate-180" />
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              setCurrentBanner((prev) => (prev + 1) % banners.length);
            }}
            aria-label="Banner tiếp theo"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 
              bg-black/20 hover:bg-black/40 text-white/90 p-2 rounded-full transition-all duration-300 
              backdrop-blur-sm hover:scale-110 z-10"
          >
            <FiArrowRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
};

export default BannerCarousel; 