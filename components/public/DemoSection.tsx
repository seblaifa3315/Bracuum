'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import { Play } from 'lucide-react';

export function DemoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section
      id="demo"
      className="relative py-24 px-6 bg-background"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">
            See It In Action
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-foreground mb-4">
            Watch the Bracuum Demo
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience how Bracuum seamlessly transitions between sweeping and vacuuming in one fluid motion.
          </p>
        </motion.div>

        {/* Video Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl group"
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          >
            <source src="/hero-background.mp4" type="video/mp4" />
          </video>

          {/* Subtle overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

          {/* Play indicator (decorative) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
