import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
  showClearButton?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
  className,
  onClear,
  showClearButton = true,
  disabled = false,
  autoFocus = false,
  onKeyDown,
  onFocus,
  onBlur
}: SearchInputProps) {
  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        className="pl-10 pr-10"
        disabled={disabled}
        autoFocus={autoFocus}
      />
      {showClearButton && value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
          onClick={handleClear}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

// Advanced search input with filters
interface AdvancedSearchInputProps extends SearchInputProps {
  filters?: Array<{
    key: string;
    label: string;
    active: boolean;
  }>;
  onFilterToggle?: (key: string) => void;
  onFiltersClick?: () => void;
  showFiltersButton?: boolean;
}

export function AdvancedSearchInput({
  filters = [],
  onFilterToggle,
  onFiltersClick,
  showFiltersButton = true,
  ...searchProps
}: AdvancedSearchInputProps) {
  const activeFiltersCount = filters.filter(f => f.active).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <SearchInput {...searchProps} className="flex-1" />
        {showFiltersButton && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onFiltersClick}
            className="relative"
          >
            <Filter className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        )}
      </div>
      
      {/* Active filters */}
      {filters.some(f => f.active) && (
        <div className="flex flex-wrap gap-2">
          {filters
            .filter(f => f.active)
            .map(filter => (
              <Badge
                key={filter.key}
                variant="secondary"
                className="cursor-pointer hover:bg-muted"
                onClick={() => onFilterToggle?.(filter.key)}
              >
                {filter.label}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))
          }
        </div>
      )}
    </div>
  );
}

// Search input with suggestions
interface SearchWithSuggestionsProps extends SearchInputProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  showSuggestions?: boolean;
  maxSuggestions?: number;
}

export function SearchWithSuggestions({
  suggestions,
  onSuggestionClick,
  showSuggestions = true,
  maxSuggestions = 5,
  value,
  onChange,
  ...searchProps
}: SearchWithSuggestionsProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  
  const filteredSuggestions = React.useMemo(() => {
    if (!value || !showSuggestions) return [];
    
    return suggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(value.toLowerCase()) &&
        suggestion.toLowerCase() !== value.toLowerCase()
      )
      .slice(0, maxSuggestions);
  }, [suggestions, value, showSuggestions, maxSuggestions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    onSuggestionClick(suggestion);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  return (
    <div className="relative">
      <SearchInput
        {...searchProps}
        value={value}
        onChange={(newValue) => {
          onChange(newValue);
          setIsOpen(true);
          setHighlightedIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          // Delay to allow suggestion clicks
          setTimeout(() => setIsOpen(false), 200);
        }}
      />
      
      {/* Suggestions dropdown */}
      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              className={cn(
                'w-full text-left px-3 py-2 hover:bg-muted transition-colors',
                index === highlightedIndex && 'bg-muted'
              )}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Search input with recent searches
interface SearchWithHistoryProps extends SearchInputProps {
  recentSearches: string[];
  onRecentSearchClick: (search: string) => void;
  onClearHistory?: () => void;
  maxRecentSearches?: number;
}

export function SearchWithHistory({
  recentSearches,
  onRecentSearchClick,
  onClearHistory,
  maxRecentSearches = 5,
  value,
  ...searchProps
}: SearchWithHistoryProps) {
  const [showHistory, setShowHistory] = React.useState(false);
  
  const displayedSearches = recentSearches
    .filter(search => search !== value)
    .slice(0, maxRecentSearches);

  return (
    <div className="relative">
      <SearchInput
        {...searchProps}
        value={value}
        onFocus={() => setShowHistory(true)}
        onBlur={() => {
          setTimeout(() => setShowHistory(false), 200);
        }}
      />
      
      {/* Recent searches dropdown */}
      {showHistory && displayedSearches.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b flex items-center justify-between">
            <span>Búsquedas recientes</span>
            {onClearHistory && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={onClearHistory}
              >
                Limpiar
              </Button>
            )}
          </div>
          {displayedSearches.map((search, index) => (
            <button
              key={`${search}-${index}`}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-muted transition-colors flex items-center space-x-2"
              onClick={() => onRecentSearchClick(search)}
            >
              <Search className="h-3 w-3 text-muted-foreground" />
              <span>{search}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}