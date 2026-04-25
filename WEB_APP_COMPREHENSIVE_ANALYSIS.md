# Comprehensive Next.js Web Application Analysis
## Tiles Inventory Management System

**Generated**: April 24, 2026  
**Web App Root**: `tiles-inventory/`  
**Analysis Level**: Thorough  

---

## Executive Summary

The **Tiles Inventory Management System** (Next.js web app) is an enterprise-grade B2B inventory and sales management platform for tile businesses. It features:

- **Multi-role system** (Admin, User)
- **Complete inventory lifecycle management** (Brands, Categories, Products, Batches, Locations)
- **Purchase & Sales order management** with status tracking
- **Real-time dashboard** with business intelligence
- **Image uploads** with cloud storage
- **Excel export** capabilities for reports
- **Idle session management** (20-min timeout with 2-min warning)
- **Global search** across all entities
- **Low-stock alerts** and inventory analytics
- **User audit trails** (created/updated tracking on all models)

---

## 1. DATA MODELS & DATABASE SCHEMA

**Database**: MongoDB (via Prisma ORM)

### Core Entities

#### **User**
- **Fields**: `id`, `email` (unique), `password`, `name`, `role` (ADMIN/USER), `isActive`
- **Tracking**: `createdAt`, `updatedAt`, `createdById`, `updatedById`
- **Relationships**: One-to-many with Notifications, and audit trail on all other entities
- **Unique Feature**: Complete audit trail - every entity tracks who created/modified it
- **Session Management**: 20-minute idle timeout with 2-minute warning (SessionContext)

#### **Brand**
- **Fields**: `name` (unique), `description`, `contactInfo`, `isActive`
- **Usage**: Associated with Products and Purchase Orders
- **Relationships**: One-to-many with Products and PurchaseOrders

#### **Category**
- **Fields**: `name` (unique), `description`, `isActive`
- **Usage**: Primary product classification
- **Relationships**: One-to-many with Products

#### **Collection**
- **Fields**: `name` (unique), `description`, `isActive`
- **Usage**: Secondary product grouping (e.g., design collection)
- **Relationships**: One-to-many with Products

#### **Size**
- **Fields**: `name` (unique), `description`, `length`, `width`, `isActive`
- **Usage**: Product sizing specifications (tiles have dimensions)
- **Relationships**: One-to-many with Products
- **Unique Feature**: Stores both name and dimensions (length, width)

#### **Product**
- **Fields**: 
  - `code` (product SKU)
  - `name`, `description`
  - `brandId`, `categoryId`, `collectionId`, `sizeId` (all relationships)
  - `length`, `width`, `thickness` (dimensions for custom sizing)
  - `sqftPerBox`, `pcsPerBox` (packaging info - tiles per box, sqft per box)
  - `imageUrl`, `isActive`
- **Relationships**: Belongs to Brand, Category, Collection, Size
- **Unique Feature**: Tile-specific fields (sqftPerBox, pcsPerBox for tile calculations)

#### **Location**
- **Fields**: `name`, `address`, `imageUrl`, `isActive`
- **Usage**: Warehouse/storage locations
- **Relationships**: One-to-many with Batches and PurchaseItems

#### **Batch**
- **Fields**:
  - `productId`, `locationId` (relationships)
  - `batchNumber`, `shade` (tile shade/color variant)
  - `quantity` (current stock level)
  - `purchasePrice`, `sellingPrice`
  - `receivedDate`, `expiryDate`
  - `imageUrl`, `isActive`
- **Usage**: Tracks specific product quantities at locations with pricing
- **Relationships**: Belongs to Product and Location; one-to-many with SalesItems

#### **PurchaseOrder**
- **Fields**:
  - `orderNumber` (unique), `brandId`
  - `status` (PENDING, CONFIRMED, RECEIVED, DELIVERED, CANCELLED)
  - `orderDate`, `expectedDate`, `receivedDate`
  - `totalAmount`, `notes`
- **Unique Feature**: Full order lifecycle tracking with timeline dates
- **Relationships**: Belongs to Brand; one-to-many with PurchaseItems

#### **PurchaseItem**
- **Fields**:
  - `purchaseOrderId`, `productId`, `locationId`
  - `batchNumber`, `shade`
  - `quantity`, `unitPrice`, `totalPrice`
  - `receivedQty` (for partial receipts)
- **Usage**: Line items in purchase orders
- **Unique Feature**: Tracks received quantity (partial receipts)

#### **SalesOrder**
- **Fields**:
  - `orderNumber` (unique)
  - `customerName`, `customerPhone`
  - `status` (PENDING, CONFIRMED, RECEIVED, DELIVERED, CANCELLED)
  - `orderDate`, `deliveryDate`
  - `totalAmount`, `discount`, `finalAmount`
  - `notes`
- **Unique Feature**: Customer-facing orders with discount support

#### **SalesItem**
- **Fields**:
  - `salesOrderId`, `productId`, `batchId`
  - `quantity`, `unitPrice`, `totalPrice`
- **Usage**: Line items in sales orders

#### **Notification**
- **Fields**:
  - `userId`, `title`, `message`
  - `type` (INFO, SUCCESS, WARNING, ERROR)
  - `read` (boolean)
- **Usage**: User notifications system

### Enums

```
OrderStatus: PENDING, CONFIRMED, RECEIVED, DELIVERED, CANCELLED
UserRole: ADMIN, USER
NotificationType: INFO, SUCCESS, WARNING, ERROR
```

---

## 2. API ENDPOINTS

### Authentication & Admin
| Method | Path | Purpose |
|--------|------|---------|
| **POST** | `/api/auth/login` | User login - returns JWT token |
| **POST** | `/api/auth/logout` | User logout - invalidates session |
| **POST** | `/api/auth/admin/login` | Admin-specific login (rate-limited: 10 attempts/15 min) |
| **GET** | `/api/auth/admin/verify` | Verify admin authentication |
| **POST** | `/api/auth/customer` | Customer authentication (public endpoint) |
| **POST** | `/api/admin/cleanup` | Delete soft-deleted records (ADMIN only) |

**Auth Features**:
- JWT token stored in cookies (`auth-token`)
- Rate limiting on login attempts
- Password hashing with bcryptjs
- Role-based access control (ADMIN/USER)
- Admin-specific verify endpoint

### Master Data Management

#### Brands
| Method | Path | Query Parameters | Purpose |
|--------|------|------------------|---------|
| **GET** | `/api/brands` | page, limit, search, isActive, dateFrom, dateTo | List brands with pagination/filtering |
| **POST** | `/api/brands` | - | Create new brand |
| **GET** | `/api/brands/[id]` | - | Get brand details |
| **PUT** | `/api/brands/[id]` | - | Update brand |
| **DELETE** | `/api/brands/[id]` | - | Delete brand (soft delete with _del_ suffix) |

#### Categories
| Method | Path | Purpose |
|--------|------|---------|
| **GET** | `/api/categories` | List categories (paginated) |
| **POST** | `/api/categories` | Create category |
| **GET** | `/api/categories/[id]` | Get category details |
| **PUT** | `/api/categories/[id]` | Update category |
| **DELETE** | `/api/categories/[id]` | Delete category |

#### Sizes
| Method | Path | Purpose |
|--------|------|---------|
| **GET** | `/api/sizes` | List sizes |
| **POST** | `/api/sizes` | Create size |
| **GET** | `/api/sizes/[id]` | Get size details |
| **PUT** | `/api/sizes/[id]` | Update size |
| **DELETE** | `/api/sizes/[id]` | Delete size |

#### Locations
| Method | Path | Purpose |
|--------|------|---------|
| **GET** | `/api/locations` | List warehouse/storage locations |
| **POST** | `/api/locations` | Create location |
| **GET** | `/api/locations/[id]` | Get location details |
| **PUT** | `/api/locations/[id]` | Update location |
| **DELETE** | `/api/locations/[id]` | Delete location |

#### Products
| Method | Path | Purpose |
|--------|------|---------|
| **GET** | `/api/products` | List products with relationships (brand, category, size) |
| **POST** | `/api/products` | Create product with image upload support |
| **GET** | `/api/products/[id]` | Get product with full details |
| **PUT** | `/api/products/[id]` | Update product |
| **DELETE** | `/api/products/[id]` | Delete product |

**Product Endpoints Special Features**:
- Image upload to Vercel Blob storage
- Validates all relationships exist before creating
- Returns product with nested brand, category, size data
- Supports product duplication on creation

### Inventory Management

#### Batches/Stock
| Method | Path | Query Parameters | Purpose |
|--------|------|------------------|---------|
| **GET** | `/api/inventory` | page, limit, search, locationId, brandId, categoryId, sizeId, lowStock, dateFrom, dateTo, sortBy, sortOrder | Complex inventory search with multi-field filtering |
| **POST** | `/api/inventory` | - | Add stock batch (creates default "Unassigned" location if needed) |
| **GET** | `/api/inventory/[id]` | - | Get batch details |
| **PUT** | `/api/inventory/[id]` | - | Update batch details |
| **DELETE** | `/api/inventory/[id]` | - | Delete batch |
| **GET** | `/api/inventory/by-product/[productId]` | - | Get all batches for a product |

**Inventory Special Features**:
- Low stock filtering (`lowStock=true` shows items with qty < 10)
- Shade/color tracking per batch
- Purchase and selling prices tracked separately
- Received and expiry dates
- Batch images support

### Orders - Purchase
| Method | Path | Query Parameters | Purpose |
|--------|------|------------------|---------|
| **GET** | `/api/purchase-orders` | page, limit, search, status, dateFrom, dateTo | List purchase orders with filtering |
| **POST** | `/api/purchase-orders` | - | Create purchase order |
| **GET** | `/api/purchase-orders/[id]` | - | Get purchase order details with items |
| **PUT** | `/api/purchase-orders/[id]` | - | Update purchase order |
| **DELETE** | `/api/purchase-orders/[id]` | - | Delete purchase order |
| **POST** | `/api/purchase-orders/[id]/status` | - | Update PO status |
| **POST** | `/api/purchase-orders/[id]/deliver` | - | Mark PO as delivered |

### Orders - Sales
| Method | Path | Query Parameters | Purpose |
|--------|------|------------------|---------|
| **GET** | `/api/sales-orders` | page, limit, search, status, dateFrom, dateTo | List sales orders with filtering |
| **POST** | `/api/sales-orders` | - | Create sales order |
| **GET** | `/api/sales-orders/[id]` | - | Get sales order with items and customer info |
| **PUT** | `/api/sales-orders/[id]` | - | Update sales order |
| **DELETE** | `/api/sales-orders/[id]` | - | Delete sales order |
| **POST** | `/api/sales-orders/[id]/status` | - | Update status |

**Order Special Features**:
- Status lifecycle: PENDING → CONFIRMED → RECEIVED → DELIVERED (or CANCELLED)
- Order number is unique (auto-generated)
- Sales orders include customer name and phone
- Sales orders support discounts (`discount` field)
- Full audit trail on all changes

### Dashboard & Analytics
| Method | Path | Purpose |
|--------|------|---------|
| **GET** | `/api/dashboard/stats` | Real-time KPIs: total products, brands, categories, sizes, pending purchase orders, sales order count, low stock items, monthly sales total |
| **GET** | `/api/dashboard/low-stock` | Top 10 low stock items (qty < 10) with product and brand info |
| **GET** | `/api/dashboard/recent-orders` | Recent purchase and sales orders |
| **GET** | `/api/dashboard/sales-data` | Sales performance data |
| **GET** | `/api/dashboard/design-stock` | Design/collection stock availability |

### Search & Discovery
| Method | Path | Query Parameters | Purpose |
|--------|------|------------------|---------|
| **GET** | `/api/global-search` | q (query), limit | Multi-entity search across brands, categories, sizes, products, purchase orders, sales orders |
| **GET** | `/api/enquiries` | - | Product enquiries (customer inquiries about products) |
| **POST** | `/api/enquiries` | - | Submit product enquiry (productId, name, email, phone, quantity, message) |

### File Operations
| Method | Path | Query Parameters | Purpose |
|--------|------|------------------|---------|
| **POST** | `/api/upload` | filename | Upload image file to Vercel Blob (rate-limited: 30 uploads/min, max 5MB, only JPEG/PNG/WebP/GIF) |

### Reports
| Method | Path | Purpose |
|--------|------|---------|
| **GET** | `/api/reports` | Access report data (used by Reports page) |
| **GET** | `/api/reports/design-stock` | Design collection stock report |

**API Security & Rate Limiting**:
- JWT authentication required (via `requireAuth()` middleware)
- Rate limiting on login (10 attempts/15 minutes)
- Rate limiting on uploads (30 uploads/60 seconds)
- Input validation with Zod schemas
- All endpoints require authentication except login and enquiries

---

## 3. PAGES & USER-FACING FEATURES

### Public Pages
| Page | Route | Purpose | Key Features |
|------|-------|---------|--------------|
| **Login** | `/login` | User authentication | Email/password login, role-based redirect |
| **Landing** | `/landing` or `/landing-new` | Public marketing page | Product showcase (if enabled) |
| **Website** | `/website` | Public e-commerce catalog | Browse products, submit enquiries |

### Authenticated User Pages
| Section | Routes | Features |
|---------|--------|----------|
| **Dashboard** | `/dashboard` | KPI widgets, low stock alerts, recent orders, sales charts |
| **Products** | `/products` | CRUD operations, search, filter by brand/category/size, image upload |
| **Inventory** | `/inventory` | Stock management, add batches, filter by location/batch status, low stock alerts |
| **Brands** | `/brands` | Manage tile brands, add/edit/delete |
| **Categories** | `/categories` | Manage product categories |
| **Sizes** | `/sizes` | Manage tile sizes (with dimensions) |
| **Locations** | `/locations` | Manage warehouse locations |
| **Purchase Orders** | `/purchase-orders` | Create POs, track items, update status, view expected delivery dates |
| **Sales Orders** | `/sales-orders` | Create sales orders, apply discounts, customer info, delivery tracking |
| **Reports** | `/reports` | Export to Excel, design stock reports, sales analytics |
| **Notifications** | `/notifications` | View user notifications with type badges (INFO/SUCCESS/WARNING/ERROR) |
| **Settings** | `/settings` | User profile, preferences |
| **Search** | `/global-search` | Global search across all entities |

### Admin-Only Pages
| Page | Route | Purpose |
|------|-------|---------|
| **Admin Dashboard** | `/admin/dashboard` | Admin overview |
| **Admin Brands** | `/admin/brands` | Manage all brands |
| **Admin Categories** | `/admin/categories` | Manage all categories |
| **Admin Products** | `/admin/products` | Manage all products |
| **Admin Inventory** | `/admin/inventory` | System-wide inventory view |
| **Admin Locations** | `/admin/locations` | Manage all locations |
| **Admin Users** | `/admin/users` | User management, role assignment |
| **Admin Purchases** | `/admin/purchase-orders` | PO management |
| **Admin Sales** | `/admin/sales-orders` | SO management |
| **Admin Sizes** | `/admin/sizes` | Manage sizes |
| **Admin Notifications** | `/admin/notifications` | System notifications |
| **Cleanup** | `/admin/[adminName]/` | Data cleanup tools (soft-delete removal) |

---

## 4. COMPONENTS & UI PATTERNS

### Layout Components
- **ProtectedRoute.tsx**: Route protection based on authentication and role
- **Layout**: Main app layout with navigation
- **AuthDebug.tsx**: Debug authentication state

### Navigation
- **CartSidebar.tsx**: Sidebar for e-commerce features (public website)
- **UserDropdown.tsx**: User menu (profile, logout, settings)
- **NotificationDropdown.tsx**: User notification center

### Data Display
| Component | Purpose |
|-----------|---------|
| **ResponsiveTable.tsx** | Adaptive table for desktop/mobile views |
| **DataView.tsx** | Flexible data display component |
| **MobileCard.tsx** / **InventoryMobileCard.tsx** | Card-based layouts for mobile views |
| **Pagination.tsx** | Paginated data navigation |
| **TableFilters.tsx** | Advanced filtering UI |
| **RowDetailsDialog.tsx** | Expandable row details |

### Form Components
| Component | Purpose |
|-----------|---------|
| **ProductForm.tsx** | Create/edit products with image upload |
| **PurchaseOrderForm.tsx** | Create/edit purchase orders |
| **SalesOrderForm.tsx** | Create/edit sales orders |
| **ImageUpload.tsx** | File upload component |
| **SearchableSelect.tsx** | Dropdown with search capability |

### Specialized Components
| Component | Purpose |
|-----------|---------|
| **Dashboard.tsx** + **dashboard-card.tsx** | Dashboard widget system with KPIs |
| **AddStockForm.tsx** | Quick add inventory batch form |
| **ImagePreview.tsx** | Preview uploaded images |
| **NotificationDropdown.tsx** | Notification bell with list |
| **CartSidebar.tsx** | Shopping cart (public website feature) |
| **InventoryTable.tsx** (implied) | Complex inventory table |

### UI System (Radix UI + Tailwind)
- **Badge.tsx**: Status badges
- **Button.tsx**: Customizable buttons with variants
- **Card.tsx**: Container component
- **Dialog.tsx** / **ConfirmationDialog.tsx**: Modal dialogs
- **Input.tsx**, **Textarea.tsx**: Form inputs
- **Label.tsx**: Form labels
- **Select.tsx**: Dropdown select
- **Skeleton.tsx**: Loading skeleton
- **Table.tsx**: Data table
- **DatePicker.tsx**: Date selection
- **Toast.tsx**: Toast notifications
- **QuickAddPanel.tsx**: Floating action panels

### Form & Validation
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **@hookform/resolvers**: Integration between RHF and Zod

---

## 5. STATE MANAGEMENT & CONTEXT

### Global Contexts (in `/src/contexts/`)

#### **SessionContext.tsx**
```
Purpose: Authentication and session management
Features:
  - User login/logout
  - JWT token management
  - Idle timeout (20 minutes)
  - Warning before timeout (2 minutes before expiry)
  - Session refresh
  - Activity tracking (resetIdleTimer on user actions)
```

#### **ThemeContext.tsx**
```
Purpose: Dark/light mode theme management
Features:
  - Toggle theme preference
  - Persist theme to localStorage
  - CSS variable injection
```

#### **ToastContext.tsx**
```
Purpose: Toast notification system
Features:
  - Show notifications with type (success/error/info/warning)
  - Auto-dismiss
  - Toast queue management
```

#### **NotificationContext.tsx**
```
Purpose: User notification management (from DB)
Features:
  - Fetch user notifications
  - Mark notifications as read
  - Delete notifications
  - Notification badge count
```

### Custom Hooks (in `/src/hooks/`)
- **useDebounce.ts**: Debounce user input
- **useMediaQuery.ts**: Responsive design support
- **useResponsiveDefaultView.ts**: Responsive layout management

---

## 6. SERVICES & BUSINESS LOGIC

### Authentication Service (`/src/lib/auth.ts`)
```typescript
Key Functions:
  - verifyToken(token): JWT verification
  - getAuthUser(request): Extract user from request cookies
  - requireAuth(request): Enforce authentication
```

### Excel Export Service (`/src/lib/excel-export.tsx`)
```typescript
Features:
  - Export data to XLSX format
  - Custom styling with navy theme branding
  - Company headers and timestamps
  - Column formatting (dates as DD-MMM-YYYY)
  - Multiple column support with custom formatters
  - File naming with timestamps
  
Used for:
  - Inventory reports
  - Purchase order exports
  - Sales order exports
  - Design stock reports
```

### Rate Limiting (`/src/lib/rate-limit.ts`)
```typescript
Features:
  - Per-user rate limiting (IP-based)
  - Configurable limits per endpoint
  - 10 login attempts per 15 minutes
  - 30 uploads per 60 seconds
```

### Upload Service (`/src/lib/uploadUtils.ts`)
```typescript
Features:
  - Image validation (type, size)
  - Vercel Blob storage integration
  - File name sanitization
  - Base64 image handling
```

### Prisma Service (`/src/lib/prisma.ts`)
```typescript
Features:
  - MongoDB connection
  - Query building
  - Transaction support
```

### Utility Functions (`/src/lib/utils.ts`)
```typescript
General utility functions for data formatting, transformations
```

---

## 7. UNIQUE & ENTERPRISE FEATURES

### ✅ Features UNIQUE to This System (Not Basic E-Commerce)

#### 1. **Tile-Specific Product Model**
- `sqftPerBox`: Square feet per box (used for coverage calculations)
- `pcsPerBox`: Pieces per box (unit quantity)
- `shade`: Color/finish variant tracking per batch
- `length`, `width`, `thickness`: Physical dimensions

#### 2. **Complex Inventory Management**
- **Batch-level tracking** (not just product-level)
  - Different prices per batch (purchasePrice, sellingPrice)
  - Batch numbers and shades
  - Received date, expiry date
  - Batch images
  - Location-specific stock levels
- **Automatic location creation** (if location not specified, creates "Unassigned")
- **Low-stock alerts** (hardcoded at qty < 10)

#### 3. **Purchase Order Lifecycle**
- Full order date tracking: `orderDate`, `expectedDate`, `receivedDate`
- Status progression: PENDING → CONFIRMED → RECEIVED → DELIVERED
- Partial receipt tracking (`receivedQty` on items)
- Brand-associated purchasing
- Item-level quantity received tracking

#### 4. **Sales Order with Customer & Discount Management**
- Customer-facing: `customerName`, `customerPhone`
- Discount support: `discount` field separate from totalAmount
- Final amount calculation: `finalAmount = totalAmount - discount`
- Customer information persistence

#### 5. **Multi-Location Warehouse System**
- Products tracked across multiple warehouse locations
- Location images for warehouse identification
- Location-specific batch quantities

#### 6. **Complete Audit Trail**
- Every record tracks: `createdById`, `updatedById`
- All entities have `createdAt`, `updatedAt` timestamps
- Admin can see who created/modified what
- Useful for accountability and debugging

#### 7. **Collection/Design-Based Grouping**
- Products grouped by Design Collections
- Collections can have multiple products
- Separate from categories (allows dual-axis grouping)
- Design-focused stock reports

#### 8. **Global Search**
- Single search endpoint searching across:
  - Brands, Categories, Sizes
  - Products, Purchase Orders, Sales Orders
- Limit configurable (default 6 results per entity type)
- Case-insensitive substring matching

#### 9. **Advanced Dashboard Analytics**
- KPI widgets showing system health
- Monthly sales calculations
- Low-stock alerts (< 10 units)
- Pending purchase orders count
- Recent order tracking
- Sales data visualization

#### 10. **Session Management with Idle Timeout**
- 20-minute idle timeout
- 2-minute warning before logout
- Activity-based timer reset
- Toast notifications on warning

#### 11. **Soft Delete Pattern**
- Items marked with `_del_` suffix for logical deletion
- Admin cleanup endpoint to permanently remove soft-deleted records
- Preserves data integrity

#### 12. **Excel Export with Branding**
- Custom styling with company branding
- Professional report headers
- Date formatting (DD-MMM-YYYY)
- Multiple column types with custom formatters
- Timestamp on exports

#### 13. **Rate-Limited Authentication**
- 10 login attempts per 15 minutes per IP
- Prevents brute force attacks
- Per-user upload limits (30/min)

#### 14. **Product Enquiries**
- Public customers can enquire about products
- Enquiry form: productId, name, email, phone, quantity, message
- Enquiry data collection (currently just logged, not stored in DB schema)

#### 15. **Image Upload & Cloud Storage**
- Product images uploaded to Vercel Blob storage
- Batch images for variant tracking
- Location images for warehouse identification
- File validation (size, type)
- Auto-generated filenames with timestamps

---

## 8. AUTHENTICATION & SECURITY

### Authentication System
```typescript
Type: JWT-based (jsonwebtoken)
Storage: HTTP-only cookies (auth-token)
Token Structure: { userId, email, role }
```

### Authorization Levels
```
PUBLIC: Login page, landing, website
USER: All standard features (CRUD for assigned entities)
ADMIN: User management, system cleanup, admin dashboards
```

### Security Features
- Password hashing (bcryptjs)
- JWT token verification
- Rate limiting on auth endpoints
- Input validation with Zod
- SQL injection protection (Prisma ORM)
- Admin-only endpoints with role checks

### Admin-Specific Features
- Admin login verification endpoint
- User management interface
- System cleanup (delete soft-deleted records)
- Access to all admin dashboards
- Full data visibility

---

## 9. TECHNOLOGY STACK

### Frontend
- **React 19**: Latest React version
- **Next.js 16.1.6**: Full-stack framework
- **TypeScript 5.9.3**: Type safety
- **Tailwind CSS 3.4.1**: Utility-first styling
- **Radix UI**: Headless component library
- **Framer Motion 12.36**: Animation library
- **React Hook Form 7.49**: Form state
- **Zod 3.22**: Schema validation

### Backend
- **Next.js API Routes**: Serverless endpoints
- **Prisma 5.8.1**: ORM for MongoDB
- **MongoDB**: NoSQL database
- **JWT (jsonwebtoken 9.0.3)**: Authentication
- **bcryptjs 3.0.3**: Password hashing
- **Vercel Blob 2.3.1**: File storage

### Data & Export
- **XLSX 0.18.5**: Excel reading/writing
- **xlsx-js-style 1.2.0**: Excel styling
- **jsPDF 4.2.1**: PDF generation
- **jspdf-autotable 5.0.7**: PDF tables
- **html2canvas 1.4.1**: Screenshot capture

### UI & Animation
- **Lucide React 0.460**: Icon library
- **Date-fns 3.2.0**: Date utilities
- **React-hot-toast 2.6.0**: Toast notifications
- **Recharts 2.10.3**: Charting library
- **Cloudinary 2.9.0**: Image CDN
- **next-cloudinary 6.15.1**: Cloudinary integration

### Development
- **ESLint 9**: Code linting
- **babel-plugin-react-compiler 1.0.0**: React compiler
- **Puppeteer 24.39.1**: Browser automation
- **tsx 4.7.0**: TypeScript executor

---

## 10. COMPARISON WITH BASIC E-COMMERCE

### What's Different from Generic E-Commerce

| Feature | Basic E-Commerce | Tiles Inventory System |
|---------|------------------|----------------------|
| **Product Model** | name, description, price, image | + sqftPerBox, pcsPerBox, shade, dimensions, purchasePrice, sellingPrice |
| **Inventory** | Simple stock tracking | Batch-level per location with prices and dates |
| **Orders** | Sales only | Purchase Orders + Sales Orders + status lifecycle |
| **Purchase** | Not tracked | Full PO management with partial receipts |
| **Customers** | Registered users | Transient customer info on orders (name, phone) |
| **Locations** | Single warehouse | Multi-warehouse support |
| **Pricing** | Single price | Separate purchase/selling price per batch |
| **Audit Trail** | Often missing | Complete on all entities |
| **Discounts** | Simple line-item discounts | Order-level discount tracking |
| **Categorization** | Single category | Category + Collection + Brand + Size |
| **Variants** | SKUs or attributes | Batch + Shade system |
| **Reporting** | Sales reports | + Inventory analytics, low-stock, design collection stock |
| **Soft Delete** | Usually hard delete | Soft delete with cleanup utilities |

---

## 11. CRITICAL PATTERNS FOR MOBILE PORT

### Data Fetching Patterns
```
Single resource: GET /api/[entity]/[id]
Paginated lists: GET /api/[entity]?page=1&limit=25&search=query&filters
Complex queries: GET /api/inventory?locationId=x&brandId=y&categoryId=z
```

### Authentication Flow
```
1. POST /api/auth/login { email, password }
2. Returns { token, user }
3. Store token in secure storage (mobile)
4. Include token in all future requests
5. Handle 401 responses (re-authenticate)
```

### Form Submission Patterns
```
POST /api/[entity] with FormData (for files)
PUT /api/[entity]/[id] for updates
DELETE /api/[entity]/[id] for deletion
Include error handling and loading states
```

### Image Upload Patterns
```
1. Select image file
2. Upload to /api/upload?filename=x
3. Receive URL back
4. Include URL in product/batch/location creation
```

---

## 12. PAGES NOT YET EXPLORED (But Exist)

- `/u/` (user-specific routes)
- `/website/` (public e-commerce)
- `/redirect-test/` (internal testing)
- `/admin/[adminName]/` (personalized admin)

---

## 13. KEY METRICS & KPIs

**Dashboard displays**:
- Total Products
- Total Brands
- Total Categories
- Total Sizes
- Pending Purchase Orders
- Sales Orders Count
- Low Stock Items (< 10 units)
- Monthly Sales (current month total)

---

## SUMMARY FOR MOBILE PORT

### Must-Have Features
1. ✅ Authentication (JWT)
2. ✅ Dashboard with KPIs
3. ✅ Inventory management (view, add stock)
4. ✅ Purchase/Sales orders
5. ✅ Product catalog with search
6. ✅ Notifications
7. ✅ Image uploads
8. ✅ Batch management (quantities, prices, dates)

### Nice-to-Have Features
1. Excel export (might be challenging on mobile)
2. Advanced filtering UI
3. Responsive tables (convert to mobile cards)
4. Location management
5. User management (admin only)

### Architectural Decisions for Mobile
- Use same API endpoints (REST is platform-agnostic)
- Adapt UI components to React Native (cards instead of tables)
- Implement local caching for frequently accessed data
- Handle file uploads with native mobile file pickers
- Session management with AsyncStorage (not cookies)
- Navigation with React Navigation (not Next.js routing)
- State management (Redux, Context, or Zustand)

---

**END OF ANALYSIS**
