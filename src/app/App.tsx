/**
 * Mini Bo Enterprise - Ultimate Edition
 * Main Application Entry Point
 */

import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { NextUIProvider } from '@nextui-org/react';
import { Toaster } from 'sonner';
import { SplashScreen } from './components/SplashScreen';
import { router } from './routes';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (!appReady || showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <NextUIProvider>
      <Toaster 
        position="top-right" 
        richColors 
        expand={false}
        closeButton
      />
      <RouterProvider router={router} />
    </NextUIProvider>
  );
}
