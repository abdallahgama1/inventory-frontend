
import * as XLSX from 'xlsx';

export interface ExcelData {
  [itemId: string]: number;
}

export const parseExcelFile = (file: File): Promise<ExcelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (!jsonData || jsonData.length < 2) {
          reject(new Error('Excel file appears to be empty or has insufficient data'));
          return;
        }
        
        // Find column indices
        const headers = jsonData[0] as string[];
        const itemIdIndex = findColumnIndex(headers, ['item id', 'itemid', 'sku', 'product code', 'id']);
        const qtyIndex = findColumnIndex(headers, ['expected quantity', 'expectedqty', 'qty', 'quantity', 'expected']);
        
        if (itemIdIndex === -1 || qtyIndex === -1) {
          reject(new Error('Could not find required columns. Please ensure your Excel file has "Item ID" and "Expected Quantity" columns'));
          return;
        }
        
        const result: ExcelData = {};
        
        // Process data rows
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          const itemId = row[itemIdIndex];
          const qty = row[qtyIndex];
          
          if (itemId && typeof itemId === 'string' && itemId.trim()) {
            const cleanItemId = itemId.toString().trim().toUpperCase();
            const parsedQty = parseFloat(qty) || 0;
            result[cleanItemId] = parsedQty;
          }
        }
        
        if (Object.keys(result).length === 0) {
          reject(new Error('No valid data found in the Excel file'));
          return;
        }
        
        resolve(result);
      } catch (error) {
        reject(new Error('Failed to parse Excel file. Please ensure it is a valid Excel format.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read the file'));
    };
    
    reader.readAsBinaryString(file);
  });
};

const findColumnIndex = (headers: string[], possibleNames: string[]): number => {
  const normalizedHeaders = headers.map(h => h.toString().toLowerCase().trim());
  
  for (const name of possibleNames) {
    const index = normalizedHeaders.findIndex(h => h.includes(name.toLowerCase()));
    if (index !== -1) return index;
  }
  
  return -1;
};
