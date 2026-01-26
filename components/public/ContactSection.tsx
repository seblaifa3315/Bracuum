'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, User, MessageSquare, Phone, MapPin, Instagram, Linkedin } from 'lucide-react';

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

    // TODO: Implement actual form submission (e.g., API call)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact" className="relative py-20 md:py-32 px-6 bg-background overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm uppercase tracking-widest text-muted-foreground mb-3">
            Get In Touch
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-foreground mb-6">
            Contact Us
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Have questions about Bracuum? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Main Contact Card */}
            <div className="relative bg-gradient-to-br from-foreground to-foreground/50 rounded-3xl p-8 text-background overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-background/10 rounded-full" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-background/5 rounded-full" />

              <div className="relative z-10">
                <h3 className="text-2xl font-semibold mb-2">Let's talk</h3>
                <p className="text-background/70 mb-8">
                  We're here to help and answer any questions you might have.
                </p>

                {/* Email */}
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center gap-4 group mb-6"
                >
                  <div className="w-12 h-12 rounded-2xl bg-background/10 flex items-center justify-center group-hover:bg-background/20 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-background/60">Email</p>
                    <p className="font-medium group-hover:text-accent transition-colors">
                      {contactInfo.email}
                    </p>
                  </div>
                </a>

                {/* Phone */}
                <a
                  href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-4 group mb-6"
                >
                  <div className="w-12 h-12 rounded-2xl bg-background/10 flex items-center justify-center group-hover:bg-background/20 transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-background/60">Phone</p>
                    <p className="font-medium group-hover:text-accent transition-colors">
                      {contactInfo.phone}
                    </p>
                  </div>
                </a>

                {/* City */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-background/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-background/60">Location</p>
                    <p className="font-medium">{contactInfo.city}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-6">
              <p className="text-sm text-muted-foreground mb-4">Follow us on social media</p>
              <div className="flex gap-3">
                {contactInfo.socials.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                      whileHover={{ y: -4 }}
                      className="w-12 h-12 rounded-2xl bg-foreground/5 border border-border/50 flex items-center justify-center hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300"
                      aria-label={social.name}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 md:p-10 shadow-xl shadow-foreground/5"
          >
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent/30">
                  <Send className="w-9 h-9 text-background" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">
                  Message Sent!
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Thank you for reaching out. We'll get back to you soon.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-8 px-6 py-2 text-accent hover:text-background hover:bg-accent rounded-full border border-accent transition-all duration-300"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Send us a message</h3>
                  <p className="text-muted-foreground text-sm">Fill out the form below and we'll get back to you shortly.</p>
                </div>

                {/* Name & Email Row */}
                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Name
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your name"
                        className="w-full pl-12 pr-4 py-3.5 bg-background/50 border border-border/50 rounded-2xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent focus:bg-background transition-all"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="your@email.com"
                        className="w-full pl-12 pr-4 py-3.5 bg-background/50 border border-border/50 rounded-2xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent focus:bg-background transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </label>
                  <div className="relative group">
                    <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="How can we help you?"
                      className="w-full pl-12 pr-4 py-3.5 bg-background/50 border border-border/50 rounded-2xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent focus:bg-background transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-4 px-6 bg-foreground text-background font-semibold rounded-2xl hover:bg-foreground/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-foreground/10 mt-6"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
