'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

export function HeroSection() {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

return (
  <section
    id="hero"
    ref={ref}
    className="relative min-h-screen overflow-hidden"
  >
    {/* Video Background */}
    <motion.div style={{ y }} className="absolute inset-0 z-0">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        // poster="/hero-background-fallback.jpg"
      >
        <source src="/hero-background.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50" />
    </motion.div>

    {/* Bottom Left Content */}
    <motion.div
      style={{ opacity }}
      className="absolute bottom-48 left-6 sm:left-10 lg:left-32 z-10 max-w-4xl"
    >
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-md sm:text-base uppercase tracking-widest text-white/70 mb-3"
      >
        Introducing Bracuum
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-8 max-w-3xl leading-tight"
      >
        Stop switching tools. Start cleaning smarter. Meet your new floor companion.
      </motion.h1>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="flex flex-row gap-4"
      >
        <Button
          size="lg"
          variant="whiteblack"
          className=" px-8 py-6 text-md shadow-lg hover:shadow-xl transition-all"
          onClick={() => scrollToId("explore")}
        >
          LEARN MORE
        </Button>

        <Button
          size="lg"
          variant="blackwhite"
          className=" px-8 py-6 text-md transition-all"
          onClick={() => scrollToId("demo")}
        >
          WATCH DEMO
        </Button>
      </motion.div>
    </motion.div>
  </section>
);


}
