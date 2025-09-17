import { useState, useEffect } from 'react';

export const useSidePanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('documents');

  // Close panel on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && isOpen) {
        // On mobile, you might want to auto-close on resize
        // setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const openPanel = () => {
    setIsOpen(true);
  };

  const closePanel = () => {
    setIsOpen(false);
  };

  const switchTab = (tabId) => {
    setActiveTab(tabId);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  return {
    isOpen,
    activeTab,
    togglePanel,
    openPanel,
    closePanel,
    switchTab,
    setActiveTab
  };
};