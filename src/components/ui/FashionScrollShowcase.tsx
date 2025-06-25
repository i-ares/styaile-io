import React from 'react';
import { motion } from 'framer-motion';

export function FashionScrollShowcase() {
  return (
    <section className="relative h-screen bg-black flex items-center justify-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/showcase-bg.jpeg')" }}
      />
      
      {/* Overlaying Text */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.6 }}
        className="relative z-10 text-center text-white"
      >
        <p className="text-xl font-light uppercase tracking-[0.2em] mb-4">Crafted For Movement</p>
        <h2 className="text-6xl md:text-8xl font-extralight tracking-wide">
          ICONIC SILHOUETTE
        </h2>
      </motion.div>
    </section>
  );
}