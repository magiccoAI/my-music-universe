import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import useIsMobile from '../hooks/useIsMobile';

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
  const listRef = useRef(null);

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

  // Mobile Drawer Component
  const MobileDrawer = () => (
    createPortal(
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
          className="w-full bg-white rounded-t-2xl overflow-hidden flex flex-col max-h-[85vh]"
          onClick={e => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white z-10">
                <h3 className="text-lg font-semibold text-gray-800">选择艺术家</h3>
                <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <XMarkIcon className="w-6 h-6 text-gray-500" />
                </button>
            </div>

            {/* Search Bar */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="搜索艺术家..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800"
                    />
                </div>
            </div>

            {/* Content List */}
            <div className="overflow-y-auto flex-1 overscroll-contain pb-safe" ref={listRef}>
                <div
                    className={`px-4 py-3 hover:bg-indigo-50 cursor-pointer text-gray-800 border-b border-gray-100 flex justify-between items-center ${!value ? 'bg-indigo-50 font-semibold text-indigo-700' : ''}`}
                    onClick={() => { onChange(''); setIsOpen(false); }}
                >
                    <span>{defaultLabel}</span>
                    {!value && <span className="w-2 h-2 rounded-full bg-indigo-500"></span>}
                </div>

                {isGrouped && filteredOptions && filteredOptions.sortedKeys ? (
                    filteredOptions.sortedKeys.length > 0 ? (
                        filteredOptions.sortedKeys.map(key => (
                            <div key={key} className="relative">
                                <div className="px-4 py-2 bg-gray-50 text-indigo-600 font-serif font-bold text-lg border-y border-gray-100 sticky top-0 z-10">
                                    {key}
                                </div>
                                {filteredOptions.groups[key].map(artist => (
                                     <div
                                        key={artist.name}
                                        className={`px-4 py-3 pl-6 active:bg-gray-100 cursor-pointer text-gray-700 border-b border-gray-50 flex justify-between items-center ${value === artist.name ? 'bg-indigo-50 text-indigo-700 font-medium' : ''}`}
                                        onClick={() => { onChange(artist.name); setIsOpen(false); }}
                                    >
                                        <div className="flex-1">
                                            {artist.name} <span className="text-gray-400 text-sm ml-1">({artist.count})</span>
                                        </div>
                                        {value === artist.name && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0"></span>}
                                    </div>
                                ))}
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-400">
                            没有找到匹配的艺术家
                        </div>
                    )
                ) : Array.isArray(filteredOptions) ? (
                    filteredOptions.length > 0 ? (
                        filteredOptions.map(([name, count]) => (
                            <div
                                key={name}
                                className={`px-4 py-3 active:bg-gray-100 cursor-pointer text-gray-700 border-b border-gray-50 flex justify-between items-center ${value === name ? 'bg-indigo-50 text-indigo-700 font-medium' : ''}`}
                                onClick={() => { onChange(name); setIsOpen(false); }}
                            >
                                <div className="flex-1">
                                    {name} <span className="text-gray-400 text-sm ml-1">({count})</span>
                                </div>
                                {value === name && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0"></span>}
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-400">
                            没有找到匹配的艺术家
                        </div>
                    )
                ) : null}
            </div>
        </motion.div>
      </motion.div>,
      document.body
    )
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 rounded-md bg-white/80 text-gray-800 flex justify-between items-center focus:outline-none hover:bg-white/90 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{currentLabel}</span>
        <ChevronDownIcon className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
            isMobile ? <MobileDrawer /> : (
              <motion.div
                initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute w-full mt-1 bg-white rounded-md shadow-xl z-50 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent"
                role="listbox"
              >
                {/* Desktop Dropdown Content (Can also add search here if needed, but keeping simple for now as requested) */}
                <div
                    className={`px-3 py-2 hover:bg-indigo-50 cursor-pointer text-gray-800 border-b border-gray-100 ${!value ? 'bg-indigo-50 font-semibold text-indigo-700' : ''}`}
                    onClick={() => { onChange(''); setIsOpen(false); }}
                    role="option"
                    aria-selected={!value}
                >
                    {defaultLabel}
                </div>

                {isGrouped ? (
                    options.sortedKeys.map(key => (
                        <div key={key} className="relative">
                            <div className="px-4 py-1.5 bg-gradient-to-r from-indigo-50 to-white text-indigo-600 font-serif font-bold text-lg border-b border-indigo-100 sticky top-0 z-10 shadow-sm">
                                {key}
                            </div>
                            {options.groups[key].map(artist => (
                                 <div
                                    key={artist.name}
                                    className={`px-3 py-2 pl-6 hover:bg-gray-100 cursor-pointer text-gray-700 transition-colors ${value === artist.name ? 'bg-indigo-50 text-indigo-700 font-medium' : ''}`}
                                    onClick={() => { onChange(artist.name); setIsOpen(false); }}
                                    role="option"
                                    aria-selected={value === artist.name}
                                >
                                    {artist.name} <span className="text-gray-400 text-xs ml-1">({artist.count})</span>
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    options.map(([name, count]) => (
                        <div
                            key={name}
                            className={`px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 transition-colors ${value === name ? 'bg-indigo-50 text-indigo-700 font-medium' : ''}`}
                            onClick={() => { onChange(name); setIsOpen(false); }}
                            role="option"
                            aria-selected={value === name}
                        >
                            {name} <span className="text-gray-400 text-xs ml-1">({count})</span>
                        </div>
                    ))
                )}
              </motion.div>
            )
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
