
import React, { useState, useEffect } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { ScannerInput } from '@/components/ScannerInput';
import { InventoryTable } from '@/components/InventoryTable';
import { apiService, BackendInventoryItem } from '@/services/apiService';
import { Package, FileSpreadsheet, Wifi, WifiOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export interface InventoryItem {
  itemId: string;
  expectedQty: number;
  scannedQty: number;
  variance: number;
}

export interface ExcelInventoryData {
  [itemId: string]: number;
}

const Index = () => {
  const [inventoryData, setInventoryData] = useState<ExcelInventoryData>({});
  const [scannedItems, setScannedItems] = useState<BackendInventoryItem[]>([]);
  const [allItems, setAllItems] = useState<BackendInventoryItem[]>([]);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check backend status on component mount
  useEffect(() => {
    checkBackendStatus();
    loadScannedSummary();
  }, []);

  const checkBackendStatus = async () => {
    try {
      await apiService.checkStatus();
      setIsBackendConnected(true);
      console.log('Backend connected successfully');
    } catch (error) {
      setIsBackendConnected(false);
      console.error('Backend connection failed:', error);
      toast({
        title: "Connection Error",
        description: "Could not connect to the backend server. Please make sure it's running.",
        variant: "destructive",
      });
    }
  };

  const loadScannedSummary = async () => {
    if (!isBackendConnected) return;
    
    try {
      const backendItems = await apiService.getScannedSummary();
      // Store all items for search suggestions
      setAllItems(backendItems);
      
      // Filter to show only scanned products (scanned_qty > 0)
      const scannedOnlyItems = backendItems.filter(item => item.scanned_qty > 0);
      setScannedItems(scannedOnlyItems);
      
      // Check if we have any data to determine if file is uploaded
      if (backendItems.length > 0) {
        setIsFileUploaded(true);
      }
    } catch (error) {
      console.error('Failed to load scanned summary:', error);
      toast({
        title: "Load Error",
        description: "Failed to load existing inventory data from the server.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!isBackendConnected) {
      toast({
        title: "Connection Required",
        description: "Backend connection is required to upload files.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid Excel file (.xlsx or .xls).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiService.uploadExcel(file);
      setIsFileUploaded(true);
      
      console.log(`Excel file uploaded successfully - Loaded ${result.items_loaded} items from inventory sheet`);

      // After successful upload, load the summary to get any existing scanned data
      await loadScannedSummary();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload Excel file. Please check the file format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFrontend = () => {
    // Only clear frontend state, don't delete from backend
    setIsFileUploaded(false);
    setScannedItems([]);
    setInventoryData({});
    
    console.log('Frontend data cleared - ready for new file upload');
    
    toast({
      title: "Success",
      description: "Frontend cleared. You can now upload a new file.",
    });
  };

  const handleItemScanned = async (itemId: string, quantity: number) => {
    if (!itemId.trim()) {
      toast({
        title: "Invalid Input",
        description: "Item ID cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (quantity === 0) {
      toast({
        title: "Invalid Quantity",
        description: "Quantity cannot be zero. Please enter a positive or negative number.",
        variant: "destructive",
      });
      return;
    }

    if (!isBackendConnected) {
      toast({
        title: "Connection Required",
        description: "Backend connection is required to scan items.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiService.scanItem(itemId, quantity);
      
      console.log(`Item scanned successfully: ${itemId} - Quantity: ${quantity}`);

      // Reload the scanned summary after successful scan
      await loadScannedSummary();
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Scan Failed",
        description: error instanceof Error ? error.message : "Failed to scan item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Package className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Inventory Checker</h1>
            <div className="flex items-center gap-2 ml-4">
              {isBackendConnected ? (
                <>
                  <Wifi className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-600">Backend Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-red-600">Backend Disconnected</span>
                </>
              )}
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            Upload your inventory Excel sheet and scan items to check quantities in real-time
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-card rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Upload Inventory Sheet</h2>
            </div>
            {isFileUploaded && (
              <Button 
                onClick={handleClearFrontend} 
                variant="outline" 
                size="sm"
                disabled={isLoading}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear & Upload New File
              </Button>
            )}
          </div>
          <FileUpload onFileUpload={handleFileUpload} />
          {isFileUploaded && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm">
                ✓ Inventory data uploaded successfully! Ready for scanning.
              </p>
            </div>
          )}
          {isLoading && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800 text-sm">
                Processing... Please wait.
              </p>
            </div>
          )}
        </div>

        {/* Scanner Section */}
        {isBackendConnected && (
          <div className="bg-card rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Scan Items</h2>
            <ScannerInput 
              onItemScanned={handleItemScanned} 
              inventoryData={inventoryData}
              allItems={allItems}
            />
          </div>
        )}

        {/* Inventory Table - Only show scanned items */}
        {scannedItems.length > 0 && (
          <div className="mb-6">
            <InventoryTable items={scannedItems} />
          </div>
        )}

        {/* Help Text */}
        {!isBackendConnected && (
          <div className="text-center mt-8 p-6 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-800 font-medium mb-2">Backend Connection Required</p>
            <p className="text-red-700">
              Make sure your Flask server is running on http://127.0.0.1:5000 before using the inventory checker.
            </p>
          </div>
        )}

        {isBackendConnected && !isFileUploaded && (
          <div className="text-center mt-8 p-6 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground">
              Start by uploading an Excel file with columns "Item ID" and "Expected Quantity"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
