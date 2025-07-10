import React from 'react';

interface PendingProduct {
  itemId: string;
  productName: string;
  expectedQty: number;
}

interface PendingProductsTableProps {
  products: PendingProduct[];
}

export const PendingProductsTable = ({ products }: PendingProductsTableProps) => {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="text-lg font-semibold mb-4">Pending Scanning Products</h2>
      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">All products scanned.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted text-left text-xs text-muted-foreground">
              <th className="py-2 px-3">Item ID</th>
              <th className="py-2 px-3">Product Name</th>
              <th className="py-2 px-3">Expected Quantity</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.itemId} className="border-t">
                <td className="py-2 px-3 font-mono">{product.itemId}</td>
                <td className="py-2 px-3">{product.productName}</td>
                <td className="py-2 px-3">{product.expectedQty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};