
import React, { useState, useRef, useEffect } from 'react';
import { Scan, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScannedProductDisplay } from './ScannedProductDisplay';
import { useToast } from '@/hooks/use-toast';
import { BackendInventoryItem } from '@/services/apiService';

interface ScannerInputProps {
  onItemScanned: (itemId: string, quantity: number) => void;
  inventoryData: { [itemId: string]: number };
  allItems?: BackendInventoryItem[];
}

interface SearchSuggestion {
  itemId: string;
  productName: string;
}

export const ScannerInput = ({ onItemScanned, inventoryData, allItems = [] }: ScannerInputProps) => {
  const [itemId, setItemId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<SearchSuggestion[]>([]);
  const [scannedProduct, setScannedProduct] = useState<{
    itemId: string;
    productName: string;
    expectedQty: number;
    sellingPrice: number;
  } | null>(null);
  const itemIdRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Filter suggestions based on search query
  useEffect(() => {
    if (searchQuery.trim() && allItems.length > 0) {
      const filtered = allItems
        .filter(item => 
          item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.item_id.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 10) // Limit to 10 suggestions
        .map(item => ({
          itemId: item.item_id,
          productName: item.product_name
        }));
      
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, allItems]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !searchRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScan();
  };

  const handleScan = () => {
    const trimmedItemId = itemId.trim();
    
    if (!trimmedItemId) {
      toast({
        title: "Invalid Input",
        description: "Please enter an Item ID before scanning.",
        variant: "destructive",
      });
      return;
    }

    // Check for valid item ID format (basic validation)
    if (trimmedItemId.length < 2) {
      toast({
        title: "Invalid Item ID",
        description: "Item ID must be at least 2 characters long.",
        variant: "destructive",
      });
      return;
    }

    const upperCaseItemId = trimmedItemId.toUpperCase();
    // For backend integration, we don't need to check inventory data locally
    // The backend will handle expected quantities
    const expectedQty = inventoryData[upperCaseItemId] || 0;

    const matchedItem = allItems.find(item => item.item_id.toUpperCase() === upperCaseItemId);
    const productName = matchedItem?.product_name || "Unknown Product";

    setScannedProduct({
      itemId: upperCaseItemId,
      expectedQty,
      productName,
      sellingPrice: matchedItem?.selling_price ?? 0,
    });
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setItemId(suggestion.itemId);
    setSearchQuery('');
    setShowSuggestions(false);
    itemIdRef.current?.focus();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Clear item ID when searching
    if (value && itemId) {
      setItemId('');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    searchRef.current?.focus();
  };

  const handleConfirm = (quantity: number) => {
    if (scannedProduct) {
      onItemScanned(scannedProduct.itemId, quantity);
      setScannedProduct(null);
      setItemId('');
      setSearchQuery('');
      setTimeout(() => {
        itemIdRef.current?.focus();
      }, 50); 
    }
  };

  const handleCancel = () => {
    setScannedProduct(null);
    itemIdRef.current?.focus();
  };

  // Auto-focus the input when component mounts
  useEffect(() => {
    itemIdRef.current?.focus();
  }, []);

  if (scannedProduct) {
    return (
      <ScannedProductDisplay
        itemId={scannedProduct.itemId}
        expectedQty={scannedProduct.expectedQty}
        productName={scannedProduct.productName}
        sellingPrice={scannedProduct.sellingPrice}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-4 max-w-md">
      {/* Search by Product Name */}
      <div className="relative">
        <Label htmlFor="productSearch" className="text-sm font-medium mb-2 block">
          Search by Product Name
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            id="productSearch"
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Type product name to search..."
            className="text-lg h-12 pl-10 pr-10"
            autoComplete="off"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion.itemId}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none border-b border-border last:border-b-0"
              >
                <div className="font-medium text-sm">{suggestion.productName}</div>
                <div className="text-xs text-muted-foreground">{suggestion.itemId}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* OR Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border"></div>
        <span className="text-sm text-muted-foreground">OR</span>
        <div className="flex-1 h-px bg-border"></div>
      </div>

      {/* Manual Item ID Entry */}
      <form onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="itemId" className="text-sm font-medium mb-2 block">
            Item ID
          </Label>
          <Input
            id="itemId"
            ref={itemIdRef}
            type="text"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            placeholder="Enter or scan Item ID..."
            className="text-lg h-12"
            autoComplete="off"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full h-12 gap-2 mt-4"
          disabled={!itemId.trim()}
        >
          <Scan className="w-4 h-4" />
          Scan Product
        </Button>
      </form>
    </div>
  );
};
