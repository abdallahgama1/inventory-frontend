
import React, { useState } from 'react';
import { Package, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ScannedProductDisplayProps {
  itemId: string;
  productName: string;
  expectedQty: number;
  sellingPrice?: number;
  onConfirm: (quantity: number) => void;
  onCancel: () => void;
}

export const ScannedProductDisplay = ({ 
  itemId, 
  productName,
  expectedQty, 
  sellingPrice,
  onConfirm, 
  onCancel 
}: ScannedProductDisplayProps) => {
  const [quantity, setQuantity] = useState(1);
  const isInInventory = expectedQty > 0;
  const { toast } = useToast();

  const handleConfirm = () => {
    // Validate quantity
    if (quantity === 0) {
      toast({
        title: "Invalid Quantity",
        description: "Quantity cannot be zero. Please enter a positive or negative number.",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(quantity)) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid number for quantity.",
        variant: "destructive",
      });
      return;
    }

    // Check for reasonable quantity limits
    if (Math.abs(quantity) > 10000) {
      toast({
        title: "Quantity Too Large",
        description: "Quantity must be between -10,000 and 10,000.",
        variant: "destructive",
      });
      return;
    }

    onConfirm(quantity);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) ;
    setQuantity(value);
  };

  return (
    <div className="bg-card rounded-lg border p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Package className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Scanned Product</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Item ID:</span>
          <span className="font-mono font-bold">{itemId}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Status:</span>
          <div className="flex items-center gap-2">
            {productName}
          </div>
        </div>
        
        {/* <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Expected Qty:</span>
          <span className="font-medium">
            {isInInventory ? expectedQty : 'N/A'}
          </span>
        </div>
         */}
        <div className="space-y-2">
          <Label htmlFor="quantity" className="text-sm font-medium text-muted-foreground">
            Set Quantity:
          </Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleConfirm();
              }
            }}
            className="text-lg h-12 font-bold text-primary"
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Enter a negative number to decrease inventory count.
          </p>
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button onClick={handleConfirm} className="flex-1" disabled={quantity === 0}>
          {quantity > 0 ? 'Add to Inventory' : 'Remove from Inventory'}
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
};
