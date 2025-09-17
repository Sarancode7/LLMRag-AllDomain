import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Search,
  Database,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import domainsData from '../../data/domains.json';

const SidePanel = ({ isOpen, setIsOpen }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState([]);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  // Group domains by category
  const domainsByCategory = useMemo(() => {
    const grouped = {};
    domainsData.domains.forEach(domain => {
      if (!grouped[domain.category]) {
        grouped[domain.category] = [];
      }
      grouped[domain.category].push(domain);
    });
    return grouped;
  }, []);

  // Filter domains based on search
  const filteredDomains = useMemo(() => {
    if (!searchTerm.trim()) return domainsByCategory;
    
    const filtered = {};
    const searchLower = searchTerm.toLowerCase();
    
    Object.entries(domainsByCategory).forEach(([category, domains]) => {
      const matchingDomains = domains.filter(domain =>
        domain.name.toLowerCase().includes(searchLower) ||
        domain.description.toLowerCase().includes(searchLower)
      );
      
      if (matchingDomains.length > 0) {
        filtered[category] = matchingDomains;
      }
    });
    
    return filtered;
  }, [domainsByCategory, searchTerm]);

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Auto-expand categories when searching
  React.useEffect(() => {
    if (searchTerm.trim()) {
      setExpandedCategories(Object.keys(filteredDomains));
    }
  }, [searchTerm, filteredDomains]);

  const totalDomains = domainsData.domains.length;
  const totalCategories = Object.keys(domainsByCategory).length;

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
              <Database className="w-5 h-5 text-white/80" />
              <h2 className="text-lg font-semibold text-white">Data Sources</h2>
            </div>
            <button
              onClick={togglePanel}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Stats */}
          <div className="p-4 border-b border-white/20">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-blue-300 font-bold text-lg">{totalDomains}</div>
                <div className="text-white/70">Domains</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-green-300 font-bold text-lg">{totalCategories}</div>
                <div className="text-white/70">Categories</div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-white/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <input
                type="text"
                placeholder="Search domains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg 
                         text-white placeholder-white/50 focus:outline-none focus:border-blue-400 
                         focus:bg-white/15 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Domain List */}
          <div className="flex-1 overflow-y-auto">
            {Object.keys(filteredDomains).length === 0 ? (
              <div className="p-6 text-center">
                <Database className="w-12 h-12 text-white/30 mx-auto mb-3" />
                <p className="text-white/60 text-sm">No domains found matching your search.</p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-2 text-blue-300 hover:text-blue-200 text-sm underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="p-2">
                {Object.entries(filteredDomains).map(([category, domains]) => (
                  <div key={category} className="mb-2">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 
                               rounded-lg transition-colors group"
                    >
                      <span className="font-medium text-white">{category}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-white/60">{domains.length}</span>
                        {expandedCategories.includes(category) ? (
                          <ChevronUp className="w-4 h-4 text-white/60" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-white/60" />
                        )}
                      </div>
                    </button>

                    {/* Domain List */}
                    {expandedCategories.includes(category) && (
                      <div className="mt-2 ml-4 space-y-2">
                        {domains.map((domain) => (
                          <div
                            key={domain.id}
                            className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            <div className="font-medium text-white text-sm mb-1">
                              {domain.name}
                            </div>
                            <div className="text-xs text-white/70 line-clamp-2">
                              {domain.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Panel Footer */}
          <div className="p-4 border-t border-white/20">
            <div className="text-xs text-white/60 text-center">
              RAG Chatbot v1.0.0
              <br />
              {totalDomains} Indian Government Data Sources
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