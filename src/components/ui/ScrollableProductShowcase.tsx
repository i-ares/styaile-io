import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ScrollableProductShowcaseProps {
  images: string[];
  title: string;
  subtitle: string;
  description: string;
  className?: string;
}

export function ScrollableProductShowcase({
  images,
  title,
  subtitle,
  description,
  className = ''
}: ScrollableProductShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Transform scroll progress to image index
  const imageIndex = useTransform(
    scrollYProgress,
    [0, 1],
    [0, images.length - 1]
  );

  // Update current image based on scroll
  useEffect(() => {
    const unsubscribe = imageIndex.onChange((latest) => {
      const index = Math.round(latest);
      if (index >= 0 && index < images.length) {
        setCurrentImageIndex(index);
      }
    });

    return unsubscribe;
  }, [imageIndex, images.length]);

  // Transform for smooth scaling and rotation
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.1, 0.9]);
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6]);

  return (
    <div 
      ref={containerRef}
      className={`relative min-h-[200vh] flex items-center justify-center ${className}`}
    >
      {/* Sticky container for the image */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="relative w-full max-w-6xl mx-auto px-6">
          
          {/* Text content */}
          <motion.div 
            className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10"
            style={{ opacity: useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [1, 0, 0, 1]) }}
          >
            <motion.h2 
              className="text-6xl md:text-8xl font-extralight tracking-wide text-black mb-4"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              {title}
            </motion.h2>
            <motion.p 
              className="text-xl md:text-2xl font-light text-gray-600 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              {subtitle}
            </motion.p>
          </motion.div>

          {/* Main product image */}
          <motion.div
            className="relative w-full h-[70vh] flex items-center justify-center"
            style={{
              scale,
              rotateY,
              opacity
            }}
          >
            <div className="relative w-full max-w-2xl h-full">
              {/* Background glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-blue-400/20 blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              {/* Product image */}
              <motion.img
                key={currentImageIndex}
                src={images[currentImageIndex]}
                alt={`${title} view ${currentImageIndex + 1}`}
                className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              
              {/* Reflection effect */}
              <motion.div
                className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-gray-100/30 to-transparent"
                style={{
                  transform: 'scaleY(-1)',
                  transformOrigin: 'bottom'
                }}
              />
            </div>
          </motion.div>

          {/* Progress indicator */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex ? 'bg-black' : 'bg-gray-300'
                }`}
                animate={{
                  scale: index === currentImageIndex ? 1.5 : 1
                }}
              />
            ))}
          </div>

          {/* Floating elements */}
          <motion.div
            className="absolute top-1/3 left-10 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 blur-xl"
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div
            className="absolute bottom-1/3 right-10 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 blur-xl"
            animate={{
              y: [0, 40, 0],
              x: [0, -25, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>
      </div>

      {/* Bottom content */}
      <motion.div 
        className="absolute bottom-0 w-full bg-gradient-to-t from-white via-white to-transparent py-20"
        style={{ 
          opacity: useTransform(scrollYProgress, [0.7, 1], [0, 1])
        }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h3 
            className="text-3xl md:text-4xl font-light tracking-wide text-black mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Crafted to Perfection
          </motion.h3>
          <motion.p 
            className="text-lg font-light text-gray-600 leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {description}
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}