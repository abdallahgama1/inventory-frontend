
# Inventory Checker Frontend Documentation

## Overview

This is a React-based inventory checking application that integrates with a Flask backend API. The application allows users to upload Excel inventory files and scan items to track inventory quantities and variances in real-time.

## Architecture

### Tech Stack
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Lucide React** for icons
- **TanStack React Query** for state management

### Project Structure
```
src/
├── components/
│   ├── FileUpload.tsx          # Excel file upload component
│   ├── ScannerInput.tsx        # Item scanning input form
│   └── ScannedProductDisplay.tsx # Product confirmation display
├── pages/
│   └── Index.tsx               # Main application page
├── services/
│   └── apiService.ts           # Backend API integration
└── App.tsx                     # Application root with routing
```

## Core Components

### 1. Index.tsx (Main Application)
The main page that orchestrates the entire application flow.

**State Management:**
- `inventoryData`: Local Excel data (legacy, unused with backend integration)
- `scannedItems`: Array of scanned inventory items from backend
- `isFileUploaded`: Boolean indicating successful file upload
- `isBackendConnected`: Backend connection status
- `isLoading`: Loading state for async operations

**Key Functions:**
- `checkBackendStatus()`: Verifies backend connectivity
- `loadScannedSummary()`: Fetches current inventory state from backend
- `handleFileUpload()`: Processes Excel file uploads
- `handleItemScanned()`: Processes scanned items

### 2. FileUpload.tsx
Handles Excel file upload with drag-and-drop functionality.

**Features:**
- Drag and drop file upload
- File type validation (.xlsx, .xls)
- Visual feedback for drag operations

### 3. ScannerInput.tsx
Main scanning interface for item input.

**Features:**
- Auto-focus input field
- Item ID validation and formatting (uppercase conversion)
- Integration with ScannedProductDisplay for confirmation

### 4. ScannedProductDisplay.tsx
Confirmation screen for scanned items before submission.

**Features:**
- Display item information
- Quantity input with positive/negative support
- Inventory status indication
- Confirmation/cancellation actions

## Data Types and Interfaces

### Frontend Interfaces

```typescript
// Main inventory item structure (frontend format)
interface InventoryItem {
  itemId: string;        // Unique item identifier
  expectedQty: number;   // Expected quantity from Excel
  scannedQty: number;    // Current scanned quantity
  variance: number;      // Calculated difference (scannedQty - expectedQty)
}

// Backend inventory item (from API responses)
interface BackendInventoryItem {
  item_id: string;           // Product ID from Excel
  product_name: string;      // Product name from Excel
  expected_qty: number;      // Expected quantity (Inventory Quantity column)
  scanned_qty: number;       // Current scanned quantity
  item_price: number;        // Price per item from Excel
  expected_total_price: number; // expected_qty * item_price
  scanned_total_price: number;  // scanned_qty * item_price
}

// Legacy Excel data structure (not used with backend)
interface ExcelInventoryData {
  [itemId: string]: number;  // itemId -> expectedQty mapping
}
```

## API Integration

### Base Configuration
- **Backend URL**: `http://127.0.0.1:5000`
- **Content Type**: `application/json` for POST requests
- **File Upload**: `multipart/form-data`

### API Endpoints

#### 1. Health Check
**Endpoint**: `GET /`
**Purpose**: Verify backend connectivity
**Response**:
```json
{
  "message": "Backend is running"
}
```

#### 2. Excel Upload
**Endpoint**: `POST /upload-excel`
**Purpose**: Upload and process Excel inventory file
**Request**: 
```
FormData {
  file: File  // Excel file (.xlsx)
}
```
**Response**:
```json
{
  "message": "Excel file uploaded and initialized successfully.",
  "items_loaded": 25
}
```

#### 3. Item Scanning
**Endpoint**: `POST /scan-item`
**Purpose**: Record a scanned item quantity
**Request**:
```json
{
  "item_id": "ABC123",   // Product ID from Excel
  "quantity": 2          // Quantity scanned (incremental)
}
```
**Response**:
```json
{
  "message": "Item scanned successfully.",
  "item_id": "ABC123",
  "product_name": "Product A",
  "expected_qty": 5,
  "scanned_qty": 7,
  "item_price": 10,
  "expected_total_price": 50,
  "scanned_total_price": 70
}
```

#### 4. Get Inventory Summary
**Endpoint**: `GET /get-scanned-summary`
**Purpose**: Retrieve current inventory state
**Response**:
```json
{
  "scanned_summary": [
    {
      "item_id": "ABC123",
      "product_name": "Product A",
      "expected_qty": 5,
      "scanned_qty": 7,
      "item_price": 10,
      "expected_total_price": 50,
      "scanned_total_price": 70
    }
  ]
}
```

## Data Flow

### 1. Application Initialization
```
1. Component mounts
2. Check backend connectivity (checkBackendStatus)
3. Load existing scanned data (loadScannedSummary)
4. Display connection status to user
```

### 2. Excel Upload Process
```
1. User selects/drops Excel file
2. Validate file type (.xlsx)
3. Send file to backend via FormData
4. Backend processes and stores inventory data
5. Backend creates/updates "Scan Results" sheet
6. Refresh scanned summary
7. Display success message with items loaded count
```

### 3. Item Scanning Process
```
1. User enters Item ID (Product ID)
2. Frontend formats ID (trim, uppercase)
3. Display ScannedProductDisplay component
4. User confirms quantity
5. Send scan request to backend
6. Backend increments scanned quantity
7. Backend updates "Scan Results" sheet
8. Refresh scanned summary with updated data
9. Reset form for next scan
```

### 4. Data Transformation
The frontend handles conversion between backend snake_case and frontend camelCase:

```typescript
// Backend → Frontend conversion
const convertedItems: InventoryItem[] = backendItems.map(item => ({
  itemId: item.item_id,
  expectedQty: item.expected_qty,
  scannedQty: item.scanned_qty,
  variance: item.scanned_qty - item.expected_qty, // Calculated on frontend
}));
```

## Excel File Requirements

### Required Excel Format
- **File Type**: .xlsx (Excel format)
- **Required Columns**:
  - **Product ID**: Unique identifier for each item
  - **Product Name**: Name of the product
  - **Product Price**: Price information (optional/ignored)
  - **Inventory Quantity**: Expected inventory count
  - **Item Price**: Price per individual item

### Backend Excel Processing
- Original uploaded file is saved on disk
- Backend creates/updates a "Scan Results" sheet within the same file
- Multiple scans of the same product increment the scanned quantity
- Column names are case-sensitive
- Items without valid Product ID or Inventory Quantity are skipped

## Error Handling

### Backend Connection
- Connection status checked on app initialization
- Visual indicators show connection state (Wifi/WifiOff icons)
- Scanning features disabled when backend disconnected

### API Errors
- Failed requests throw errors with backend error messages
- Console logging for debugging
- User-friendly error states in UI

### File Upload Validation
- Client-side file type validation (.xlsx only)
- Server-side processing error handling
- Loading states during upload

## UI States and Feedback

### Connection States
- **Connected**: Green wifi icon + "Backend Connected"
- **Disconnected**: Red wifi-off icon + "Backend Disconnected"

### Upload States
- **Default**: Upload area with drag-and-drop
- **Success**: Green success message with items loaded count
- **Loading**: Blue processing message

### Scanning States
- **Input**: Item ID input field with scan button
- **Confirmation**: Product display with quantity input
- **Processing**: Loading state during API calls

## Performance Considerations

- Auto-focus management for efficient scanning workflow
- Minimal re-renders through proper state management
- Efficient API calls with loading states
- Real-time inventory updates after each scan
- Incremental quantity tracking (multiple scans accumulate)

## Security Notes

- No sensitive data stored in frontend
- All inventory data managed by backend
- CORS configured for localhost development
- File uploads validated on both client and server
- Excel files saved securely on backend disk storage

## Known Discrepancies

### Current Frontend Implementation Issues
1. **API Response Structure**: Frontend expects `scanned_items` array but backend returns `scanned_summary`
2. **Data Format Mismatch**: Frontend conversion may not handle all backend fields (product_name, pricing data)
3. **Variance Calculation**: Frontend calculates variance locally instead of using backend data

### Recommended Frontend Updates
- Update apiService to use correct response field names
- Enhance InventoryItem interface to include product name and pricing
- Consider displaying pricing information in the UI
- Update data transformation to handle all backend fields properly
