'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, Phone, MapPin, Instagram, Linkedin } from 'lucide-react';

// X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const contactInfo = {
  email: 'contact@bracuum.com',
  phone: '+1 (555) 123-4567',
  city: 'San Francisco, CA',
  socials: [
    { name: 'Twitter', url: 'https://twitter.com/bracuum', icon: XIcon },
    { name: 'Instagram', url: 'https://instagram.com/bracuum', icon: Instagram },
    { name: 'LinkedIn', url: 'https://linkedin.com/company/bracuum', icon: Linkedin },
  ],
};

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact" className="relative py-12 lg:py-16 px-4 sm:px-6 bg-muted overflow-hidden">


      <div className="max-w-6xl mx-auto w-full relative z-10">
        {/* Section Header - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 lg:mb-10"
        >
          {/* Decorative line with dot */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="h-px w-8 bg-accent2/40" />
                        <div className="w-1.5 h-1.5 rounded-full bg-accent2/60" />
                        <div className="h-px w-8 bg-accent2/40" />
                    </div>
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">
            Get in Touch
          </p>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-foreground mb-2">
            Contact Us
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            Have questions about Bracuum? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-24 items-stretch">
          {/* Left Column - Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="order-2 lg:order-1 flex flex-col px-4 lg:pl-12"
          >
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">Let's talk</h3>
              <p className="text-muted-foreground text-sm">
                Fill out the form and we'll get back to you promptly.
              </p>
            </div>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/30">
                  <Send className="w-6 h-6 text-background" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Message Sent!</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  We'll get back to you soon.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-5 py-1.5 text-sm text-accent hover:text-background hover:bg-accent rounded-full border border-accent transition-all duration-300"
                >
                  Send another
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-3">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-foreground mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-foreground/5 border border-border/50 rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent focus:bg-background transition-all"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-foreground mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-foreground/5 border border-border/50 rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent focus:bg-background transition-all"
                  />
                </div>

                {/* Message Field */}
                <div className="flex-1 flex flex-col">
                  <label htmlFor="message" className="block text-xs font-medium text-foreground mb-1">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full flex-1 min-h-[60px] px-3 py-2 bg-foreground/5 border border-border/50 rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent focus:bg-background transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-1/2 mt-6 py-2.5 px-6 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>

          {/* Right Column - Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="order-1 lg:order-2 px-4 lg:pl-12"
          >
            {/* Mobile: row layout with contact info left, logo right */}
            {/* Desktop: column layout with logo on top */}
            <div className="flex flex-row lg:flex-col items-center sm:items-center lg:items-start gap-4 sm:gap-0 justify-between">
              {/* Contact Details - appears first (left on mobile, top on tablet+) */}
              <div className="order-1 lg:order-2 space-y-2 flex-1 sm:flex-none sm:w-full max-w-xs lg:max-w-none">
                {/* Email */}
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center gap-3 group py-1"
                >
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Mail className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                      {contactInfo.email}
                    </p>
                  </div>
                </a>

                {/* Phone */}
                <a
                  href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-3 group py-1"
                >
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Phone className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                      {contactInfo.phone}
                    </p>
                  </div>
                </a>

                {/* City */}
                <div className="flex items-center gap-3 py-1">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium text-foreground">{contactInfo.city}</p>
                  </div>
                </div>

                {/* Social Media - inside contact details on mobile */}
                <div className="mt-3 pt-3 border-t border-border sm:mt-4 sm:pt-4">
                  <p className="text-xs text-muted-foreground mb-2">Follow us</p>
                  <div className="flex gap-2">
                    {contactInfo.socials.map((social, index) => {
                      const Icon = social.icon;
                      return (
                        <motion.a
                          key={social.name}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                          whileHover={{ y: -3 }}
                          className="w-9 h-9 rounded-lg bg-foreground/5 border border-border/50 flex items-center justify-center text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
                          aria-label={social.name}
                        >
                          <Icon className="w-4 h-4" />
                        </motion.a>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Logo - appears second (right on mobile, top on tablet+) */}
              <div className="order-2 sm:order-1 flex-shrink-0  mb-16 lg:mb-0">
                <img
                  src="/logo-no-bg-light.png"
                  alt="Bracuum logo"
                  className="h-42 sm:48 md:52 lg:56 w-auto"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
