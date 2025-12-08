import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import useIsMobile from '../hooks/useIsMobile';
import { useVirtualizer } from '@tanstack/react-virtual';

const CustomSelect = ({ 
  value, 
  onChange, 
  options, 
  isGrouped, 
  defaultLabel = "全部艺术家",
  placeholder = "Select..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const isMobile = useIsMobile();
  
  // Ref for the scrolling container
  const parentRef = useRef(null);

  // Close on click outside (Desktop)
  useEffect(() => {
    if (isMobile) return;
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  // Reset search when opening
  useEffect(() => {
    if (isOpen) {
        setSearchTerm('');
    }
  }, [isOpen]);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobile && isOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'unset';
    }
    return () => {
        document.body.style.overflow = 'unset';
    }
  }, [isMobile, isOpen]);

  // Find label for current value
  let currentLabel = defaultLabel;
  if (value && options) {
    if (isGrouped) {
        // Search in groups
        if (options.sortedKeys) {
            for (const key of options.sortedKeys) {
                if (options.groups[key]) {
                    const found = options.groups[key].find(item => item.name === value);
                    if (found) {
                        currentLabel = `${found.name} (${found.count})`;
                        break;
                    }
                }
            }
        }
    } else if (Array.isArray(options)) {
        const found = options.find(([name]) => name === value);
        if (found) currentLabel = `${found[0]} (${found[1]})`;
    }
  }

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;

    const lowerSearch = searchTerm.toLowerCase();

    if (isGrouped && options.sortedKeys) {
        const newGroups = {};
        const newKeys = [];
        
        options.sortedKeys.forEach(key => {
            const filteredGroup = options.groups[key].filter(item => 
                item.name.toLowerCase().includes(lowerSearch)
            );
            if (filteredGroup.length > 0) {
                newGroups[key] = filteredGroup;
                newKeys.push(key);
            }
        });
        return { groups: newGroups, sortedKeys: newKeys };
    } else if (Array.isArray(options)) {
        return options.filter(([name]) => name.toLowerCase().includes(lowerSearch));
    }
    return options;
  }, [options, isGrouped, searchTerm]);

  // Flatten options for virtualization
  const flattenedData = useMemo(() => {
      const flat = [];
      // Default option
      flat.push({ type: 'default', label: defaultLabel, value: '' });

      if (isGrouped && filteredOptions && filteredOptions.sortedKeys) {
          if (filteredOptions.sortedKeys.length === 0) {
               flat.push({ type: 'empty', label: '没有找到匹配的艺术家' });
          } else {
              filteredOptions.sortedKeys.forEach(key => {
                  flat.push({ type: 'header', label: key });
                  filteredOptions.groups[key].forEach(item => {
                      flat.push({ type: 'item', name: item.name, count: item.count });
                  });
              });
          }
      } else if (Array.isArray(filteredOptions)) {
          if (filteredOptions.length === 0) {
               flat.push({ type: 'empty', label: '没有找到匹配的艺术家' });
          } else {
              filteredOptions.forEach(([name, count]) => {
                  flat.push({ type: 'item', name, count });
              });
          }
      }
      return flat;
  }, [filteredOptions, isGrouped, defaultLabel]);

  // Virtualizer
  const rowVirtualizer = useVirtualizer({
    count: flattenedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
        const item = flattenedData[index];
        if (item.type === 'header') return 45; // Height for header
        return 50; // Height for standard item
    },
    overscan: 5,
  });

  const renderVirtualRow = (virtualRow) => {
      const item = flattenedData[virtualRow.index];
      const isSelected = item.type === 'item' ? value === item.name : (!value && item.type === 'default');

      return (
          <div
              key={virtualRow.key}
              style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
              }}
          >
              {item.type === 'header' && (
                  <div className="px-4 py-2 bg-gray-50 text-indigo-600 font-serif font-bold text-lg border-y border-gray-100">
                      {item.label}
                  </div>
              )}
              {item.type === 'default' && (
                   <div
                      className={`px-4 py-3 hover:bg-indigo-50 cursor-pointer text-gray-800 border-b border-gray-100 flex justify-between items-center h-full ${isSelected ? 'bg-indigo-50 font-semibold text-indigo-700' : ''}`}
                      onClick={() => { onChange(''); setIsOpen(false); }}
                  >
                      <span>{item.label}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-500"></span>}
                  </div>
              )}
              {item.type === 'item' && (
                  <div
                      className={`px-4 py-3 pl-6 active:bg-gray-100 cursor-pointer text-gray-700 border-b border-gray-50 flex justify-between items-center h-full ${isSelected ? 'bg-indigo-50 text-indigo-700 font-medium' : ''}`}
                      onClick={() => { onChange(item.name); setIsOpen(false); }}
                  >
                      <div className="flex-1 truncate pr-2">
                          {item.name} <span className="text-gray-400 text-sm ml-1">({item.count})</span>
                      </div>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0"></span>}
                  </div>
              )}
              {item.type === 'empty' && (
                   <div className="p-8 text-center text-gray-400 h-full flex items-center justify-center">
                       {item.label}
                   </div>
              )}
          </div>
      );
  };


  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-left flex items-center justify-between transition-all group"
      >
        <span className="truncate mr-2 text-white">{currentLabel}</span>
        <ChevronDownIcon className={`w-5 h-5 text-gray-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isMobile && createPortal(
          <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                >
                    <motion.div 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="w-full bg-white rounded-t-2xl overflow-hidden flex flex-col h-[85vh]" // Fixed height for mobile
                    onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white z-10 flex-shrink-0">
                            <h3 className="text-lg font-semibold text-gray-800">选择艺术家</h3>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex-shrink-0">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    type="text" 
                                    name="artist-search-mobile"
                                    id="artist-search-input-mobile"
                                    placeholder="搜索艺术家..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800"
                                />
                            </div>
                        </div>

                        {/* Virtualized Content List */}
                        <div 
                            ref={parentRef} 
                            className="flex-1 overflow-y-auto w-full relative"
                            style={{ contain: 'strict' }}
                        >
                            <div
                                style={{
                                    height: `${rowVirtualizer.getTotalSize()}px`,
                                    width: '100%',
                                    position: 'relative',
                                }}
                            >
                                {rowVirtualizer.getVirtualItems().map(renderVirtualRow)}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
          </AnimatePresence>,
          document.body
      )}

      {!isMobile && (
          <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col max-h-[400px]"
                >
                    {/* Search Bar */}
                    <div className="p-3 border-b border-gray-100 bg-gray-50">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                name="artist-search-desktop"
                                id="artist-search-input-desktop"
                                placeholder="搜索..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Virtualized List for Desktop */}
                    <div 
                        ref={parentRef} 
                        className="flex-1 overflow-y-auto w-full relative bg-white"
                    >
                        <div
                            style={{
                                height: `${rowVirtualizer.getTotalSize()}px`,
                                width: '100%',
                                position: 'relative',
                            }}
                        >
                            {rowVirtualizer.getVirtualItems().map(renderVirtualRow)}
                        </div>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
      )}
    </div>
  );
};

export default CustomSelect;