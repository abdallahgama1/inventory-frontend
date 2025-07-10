
const API_BASE_URL = 'http://127.0.0.1:5000';

export interface BackendInventoryItem {
  item_id: string;
  product_name: string;
  item_price: number;
  expected_qty: number;
  scanned_qty: number;
  variance: number;
  total_price: number;
}

export interface ScanItemRequest {
  item_id: string;
  quantity: number;
}

export const apiService = {
  // Check backend status
  checkStatus: async (): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/`);
    if (!response.ok) {
      throw new Error('Backend is not responding');
    }
    return response.text();
  },

  // Upload Excel file
  uploadExcel: async (file: File): Promise<{ message: string; items_loaded: number }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload-excel`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload Excel file');
    }

    return response.json();
  },

  // Delete uploaded inventory data
  deleteUploaded: async (): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/delete-uploaded`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete uploaded data');
    }

    return response.json();
  },

  // Scan an item
  scanItem: async (itemId: string, quantity: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/scan-item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        item_id: itemId,
        quantity: quantity,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to scan item');
    }

    return response.json();
  },

  // Get scanned summary
  getScannedSummary: async (): Promise<BackendInventoryItem[]> => {
    const response = await fetch(`${API_BASE_URL}/get-scanned-summary`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch scanned summary');
    }

    const data = await response.json();
    return data.all_scanned_data || [];
  },
};
