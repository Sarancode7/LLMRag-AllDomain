import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Menu
} from 'lucide-react';

const SidePanel = ({ isOpen, setIsOpen }) => {
  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Side Panel */}
      <div className={`
        fixed left-0 top-0 h-full bg-white/10 backdrop-blur-lg border-r border-white/20 
        transition-all duration-300 ease-in-out z-20 shadow-2xl
        ${isOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full'}
        overflow-hidden
      `}>
        <div className="flex flex-col h-full w-80">
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center space-x-2">
              <Menu className="w-5 h-5 text-white/80" />
              <h2 className="text-lg font-semibold text-white">Control Panel</h2>
            </div>
            <button
              onClick={togglePanel}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Panel Content - Empty for now */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="text-center text-white/60 py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                <Menu className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-lg font-medium text-white/80 mb-2">Panel Ready</h3>
              <p className="text-sm text-white/60">
                This panel is ready for your custom features
              </p>
            </div>
          </div>

          {/* Panel Footer */}
          <div className="p-4 border-t border-white/20">
            <div className="text-xs text-white/60 text-center">
              RAG Chatbot v1.0.0
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Button (when panel is closed) */}
      {!isOpen && (
        <button
          onClick={togglePanel}
          className="fixed left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Overlay (when panel is open on smaller screens) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10 lg:hidden"
          onClick={togglePanel}
        />
      )}
    </>
  );
};

export default SidePanel;