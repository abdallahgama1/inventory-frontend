
import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { BackendInventoryItem } from '@/services/apiService';

interface InventoryTableProps {
  items: BackendInventoryItem[];
}

export const InventoryTable = ({ items }: InventoryTableProps) => {
  const getVarianceColor = (variance: number) => {
    if (variance === 0) return 'text-green-600';
    if (variance < 0) return 'text-red-600';
    return 'text-orange-600';
  };

  const getVarianceIcon = (variance: number) => {
    if (variance === 0) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (variance < 0) return <XCircle className="w-4 h-4 text-red-600" />;
    return <AlertTriangle className="w-4 h-4 text-orange-600" />;
  };

  const getStatusText = (variance: number) => {
    if (variance === 0) return 'Match';
    if (variance < 0) return 'Under Count';
    return 'Over Count';
  };

  const getRowClass = (variance: number) => {
    if (variance === 0) return 'bg-green-50/50';
    if (variance < 0) return 'bg-red-50/50';
    return 'bg-orange-50/50';
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
      <div className="p-4 border-b bg-muted/50">
        <h2 className="text-xl font-semibold">Scanned Products</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Showing {items.length} scanned product{items.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-left p-4 font-semibold">Product ID</th>
              <th className="text-left p-4 font-semibold">Product Name</th>
              <th className="text-right p-4 font-semibold">Expected Qty</th>
              <th className="text-right p-4 font-semibold">Scanned Qty</th>
              <th className="text-right p-4 font-semibold">Variance</th>
              <th className="text-right p-4 font-semibold">Item Price</th>
              <th className="text-right p-4 font-semibold">Total Value</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr 
                key={item.item_id} 
                className={`border-t hover:bg-muted/20 transition-colors ${getRowClass(item.variance)}`}
              >
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {getVarianceIcon(item.variance)}
                    <span className={`text-xs font-medium ${getVarianceColor(item.variance)}`}>
                      {getStatusText(item.variance)}
                    </span>
                  </div>
                </td>
                <td className="p-4 font-mono font-medium">{item.item_id}</td>
                <td className="p-4 font-medium">{item.product_name}</td>
                <td className="p-4 text-right font-medium">
                  {item.expected_qty}
                </td>
                <td className="p-4 text-right font-medium">
                  {item.scanned_qty}
                </td>
                <td className={`p-4 text-right font-medium ${getVarianceColor(item.variance)}`}>
                  {item.variance > 0 ? '+' : ''}{item.variance}
                </td>
                <td className="p-4 text-right font-medium">
                  ${item.item_price.toFixed(2)}
                </td>
                <td className="p-4 text-right font-medium">
                  ${item.total_price.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {items.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          <p>No scanned products yet. Start scanning items to see results here.</p>
        </div>
      )}
    </div>
  );
};
