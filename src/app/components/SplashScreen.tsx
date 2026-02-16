/**
 * Splash Screen with Framer Motion Animations
 */

import { motion } from 'motion/react';
import { Factory } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 2.5 }}
      onAnimationComplete={onComplete}
    >
      <div className="text-center">
        {/* Logo Icon - Fade In & Scale */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.6, -0.05, 0.01, 0.99],
          }}
        >
          <div className="bg-white rounded-full p-8 shadow-2xl">
            <Factory className="w-24 h-24 text-blue-900" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Brand Text - Reveal Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h1 className="text-5xl font-bold text-white mb-2">
            Mini Bo Enterprise
          </h1>
          <motion.div
            className="text-xl text-blue-200 font-light"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            Ultimate Edition
          </motion.div>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          className="mt-6 text-blue-300 text-sm tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          Manufacturing Management System
        </motion.div>

        {/* Loading Indicator */}
        <motion.div
          className="mt-10 flex justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.8 }}
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 bg-white rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
