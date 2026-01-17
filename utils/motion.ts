// utils/motion.ts
import { Variants } from "framer-motion";

export const staggerContainer = (staggerChildren?: number, delayChildren?: number): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: staggerChildren || 0.1,
      delayChildren: delayChildren || 0,
    },
  },
});

export const fadeIn = (direction: 'up' | 'down' | 'left' | 'right', type: string, delay: number, duration: number): Variants => ({
  hidden: {
    opacity: 0,
    y: direction === 'up' ? 80 : direction === 'down' ? -80 : 0,
    x: direction === 'left' ? 80 : direction === 'right' ? -80 : 0,
  },
  show: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: {
      type,
      delay,
      duration,
      ease: 'easeOut',
    },
  },
});

export const slideIn = (direction: 'left' | 'right', type: string, delay: number, duration: number): Variants => ({
  hidden: {
    opacity: 0,
    x: direction === 'left' ? '-100%' : '100%',
  },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      type,
      delay,
      duration,
      ease: 'easeOut',
    },
  },
});

export const zoomIn = (delay: number, duration: number): Variants => ({
  hidden: {
    scale: 0.9,
    opacity: 0,
  },
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      delay,
      duration,
    },
  },
});