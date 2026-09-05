'use client';
import { useState, useRef, useEffect } from 'react';
import { Search, Check, X } from 'lucide-react';

export function SearchableSelect({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Search...", 
  disabled = false,
  renderOption = (opt) => opt.label,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm flex items-center justify-between cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'} focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
      >
        <span className={selectedOption ? 'text-ink' : 'text-muted'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {selectedOption && !disabled && (
            <button 
              onClick={(e) => { e.stopPropagation(); onChange(''); setSearch(''); }}
              className="text-muted hover:text-danger rounded-full p-0.5 transition-colors"
            >
              <X size={14} />
            </button>
          )}
          <span className="text-muted text-xs opacity-50">▼</span>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-border flex items-center gap-2 bg-bg/50">
            <Search size={16} className="text-muted" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to search..."
              className="w-full bg-transparent text-sm focus:outline-none text-ink"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-sm text-muted">No results found.</div>
            ) : (
              filteredOptions.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`px-3 py-2 text-sm rounded-lg cursor-pointer flex items-center justify-between group transition-colors ${
                    opt.value === value ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-bg text-ink'
                  }`}
                >
                  {renderOption(opt)}
                  {opt.value === value && <Check size={16} className="text-primary" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
