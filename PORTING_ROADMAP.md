# Web to Mobile Porting Roadmap

**Last Updated**: April 24, 2026  
**Status**: Ready for Implementation  
**Priority**: Phase 1 > Phase 2 > Phase 3

---

## Executive Summary

Your React Native mobile app is **70% complete** and connected to the same API as your web version. The main gaps are:
1. Several stub screens need full implementation
2. Global Search needs real API connection (currently mock)
3. Management screens need completion
4. Advanced features (notifications, PDF export, etc.) need implementation

---

## Phase 1: CRITICAL - Complete Core Functionality (Week 1)

### Priority 1.1: Fix Global Search - CONNECT TO REAL API
**File**: `src/screens/search/SearchScreen.tsx`  
**Current State**: Uses mock data only  
**Task**: Connect to `GET /api/global-search?q=<query>` endpoint  
**Impact**: Enables users to search across all entities (Products, Orders, Customers, etc.)

```typescript
// Currently: hardcoded mock results
// Should: Call apiClient.get('/api/global-search', { params: { q: searchTerm } })
```

### Priority 1.2: Complete OrderListScreen - REPLACE PLACEHOLDER
**File**: `src/screens/orders/OrderListScreen.tsx`  
**Current State**: Skeleton/placeholder component  
**Task**: Implement full order list with:
- Tabs for Purchase Orders vs Sales Orders
- Filtering by status (PENDING, CONFIRMED, RECEIVED, DELIVERED)
- Search functionality
- Navigation to order details

### Priority 1.3: Complete Management Screens (50% → 100%)
**Location**: `src/screens/admin/settings/` (estimated 4 screens)

| Screen | Status | Task |
|--------|--------|------|
| BrandManagementScreen | 70% | Complete CRUD - test create/edit/delete operations |
| CategoryManagementScreen | 70% | Complete CRUD - test form validation |
| SizeManagementScreen | 70% | Complete CRUD - ensure proper field mapping |
| LocationManagementScreen | 70% | Complete CRUD - verify warehouse logic |
| CollectionManagementScreen | 50% | FINISH - currently minimal |

**API Endpoints to Connect**:
- `POST/PUT/DELETE /api/brands`
- `POST/PUT/DELETE /api/categories`
- `POST/PUT/DELETE /api/sizes`
- `POST/PUT/DELETE /api/locations`

### Priority 1.4: Password Reset / Forgot Password
**File**: `src/screens/auth/ForgotPasswordScreen.tsx`  
**Current State**: Appears to exist but no implementation  
**Task**: Implement flow:
1. User enters email
2. Call `POST /api/auth/forgot-password` with email
3. Show "Check your email" message
4. (Optional) Add token-based reset if web version supports

---

## Phase 2: IMPORTANT - Complete Secondary Features (Week 2-3)

### Priority 2.1: Complete Order Management
**Files**:
- `src/screens/orders/PurchaseOrderListScreen.tsx` (likely needs detail view)
- `src/screens/orders/SalesOrderListScreen.tsx` (likely needs detail view)

**Tasks**:
- Create OrderDetailScreen to show full order info
- Implement partial receipt tracking for purchase orders
- Add discount display for sales orders
- Status update functionality (mark as received/delivered)

### Priority 2.2: Notifications System - FUNCTIONAL
**File**: `src/screens/notifications/NotificationsScreen.tsx`  
**Current State**: UI skeleton only  
**Task**: 
- Connect to `GET /api/notifications` endpoint
- Implement notification list with:
  - Mark as read/unread
  - Delete functionality
  - Filter by type (alert, info, warning)
- (Later) Add real-time push notifications via Firebase

### Priority 2.3: Admin Panel - FULL IMPLEMENTATION
**Files**:
- `src/screens/admin/AdminPanelScreen.tsx`
- `src/screens/admin/AdminFunctionsScreen.tsx`

**Tasks**:
- Implement User Management (view/create/edit/delete users)
- Implement cleanup functions (soft-delete management)
- Add role-based access (Admin vs User)
- Connect to `GET/POST /api/admin/*` endpoints

### Priority 2.4: Advanced Reporting
**File**: `src/screens/reports/ReportsScreen.tsx`  
**Current State**: Design Stock Report by brand works  
**Tasks**:
1. Add Sales Analysis Report
   - Total sales by period
   - Top products
   - Sales trend chart
2. Add Inventory Analysis Report
   - Low stock alerts
   - Stock by location
   - Batch age tracking
3. Consider adding simple charts using `react-native-chart-kit` or `victory-native`

### Priority 2.5: Enquiry Management System
**Files**:
- `src/screens/enquiries/EnquiryListScreen.tsx`
- `src/screens/enquiries/EnquiryDetailScreen.tsx`

**Tasks**:
- List all customer enquiries from API
- Show enquiry details (product, quantity, customer info)
- Implement reply/follow-up functionality
- Mark as resolved

---

## Phase 3: ENHANCEMENTS - Polish & Advanced Features (Week 4+)

### Priority 3.1: PDF Export
**Location**: Likely in `src/services/exportService.ts`  
**Current State**: Only CSV export working  
**Task**: Use `react-native-pdf` or `rn-pdf-lib` to generate branded PDFs

### Priority 3.2: Real-Time Push Notifications
**Task**: Integrate Firebase Cloud Messaging
- Setup APNs for iOS, FCM for Android
- Store device tokens in database
- Implement notification handlers for order updates, low stock alerts

### Priority 3.3: Image Handling Enhancements
**Current State**: Basic image upload works  
**Tasks**:
- Add image compression before upload
- Implement image gallery/carousel for product images
- Add image editing (crop, rotate)

### Priority 3.4: Offline Support (Nice-to-Have)
**Task**: Use `@react-native-async-storage/async-storage` + Redux Persist for:
- Cache recently viewed items
- Queue orders/forms for offline submission
- Sync when connection restored

### Priority 3.5: Performance & Caching
**Tasks**:
- Implement pagination properly (currently limited to 20 items per page)
- Add request caching with React Query or SWR equivalent
- Optimize list rendering with FlatList virtualization

---

## Implementation Checklist

### Week 1 (Phase 1)
- [ ] Global Search connected to real API
- [ ] OrderListScreen fully implemented
- [ ] All 4-5 Management Screens complete
- [ ] Password reset flow working
- [ ] Test all above on Android emulator

### Week 2-3 (Phase 2)
- [ ] Order detail views and interactions
- [ ] Notifications fully functional
- [ ] Admin panel operational
- [ ] Advanced reporting with 2+ report types
- [ ] Enquiry system complete

### Week 4+ (Phase 3)
- [ ] PDF export working
- [ ] Push notifications set up
- [ ] Image handling enhanced
- [ ] Performance optimizations
- [ ] Production testing and deployment

---

## API Endpoints Summary

### Authentication
- `POST /api/auth/login` - Already implemented ✅
- `POST /api/auth/logout` - Already implemented ✅
- `POST /api/auth/forgot-password` - **TODO**

### Search
- `GET /api/global-search?q=<query>` - **TODO (connect to real API)**

### Master Data
- `GET/POST/PUT/DELETE /api/brands` - Partially done
- `GET/POST/PUT/DELETE /api/categories` - Partially done
- `GET/POST/PUT/DELETE /api/sizes` - Partially done
- `GET/POST/PUT/DELETE /api/locations` - Partially done

### Orders
- `GET /api/purchase-orders` - Implemented
- `GET /api/sales-orders` - Implemented
- `GET /api/purchase-orders/:id` - **TODO**
- `GET /api/sales-orders/:id` - **TODO**

### Notifications
- `GET /api/notifications` - **TODO**
- `PUT /api/notifications/:id` - **TODO**

### Admin
- `GET /api/admin/users` - **TODO**
- `POST/PUT/DELETE /api/admin/users` - **TODO**

### Reports
- `GET /api/reports/design-stock` - Already implemented ✅
- `GET /api/reports/sales-analysis` - **TODO**
- `GET /api/reports/inventory-analysis` - **TODO**

---

## Files to Focus On (In Priority Order)

1. `src/screens/search/SearchScreen.tsx` - Global Search
2. `src/screens/orders/OrderListScreen.tsx` - Order List
3. `src/screens/admin/settings/*.tsx` - Management screens (4-5 files)
4. `src/screens/auth/ForgotPasswordScreen.tsx` - Password reset
5. `src/screens/orders/OrderDetailScreen.tsx` - NEW, needs creation
6. `src/screens/notifications/NotificationsScreen.tsx` - Notifications
7. `src/screens/admin/AdminPanelScreen.tsx` - Admin features
8. `src/screens/reports/ReportsScreen.tsx` - Add advanced reports
9. `src/screens/enquiries/*.tsx` - Enquiry system (2 files)
10. `src/services/exportService.ts` - PDF export

---

## Notes

- All API endpoints use the same base URL: `https://tiles-inventory.vercel.app/api`
- Authentication is cookie-based (credentials: 'include' in API calls)
- Mobile app shares same data models as web version
- React Native patterns differ from Next.js but business logic is identical
- Test each feature on the Android emulator before moving to next

---

## Key Learnings from Web App

The web version has these important patterns you should replicate in mobile:

1. **Audit Trail**: All records have `createdById`, `updatedById`, `createdAt`, `updatedAt`
2. **Soft Delete**: Records aren't deleted; `isDeleted` flag marks them as deleted
3. **Pagination**: All list endpoints support `page` and `limit` query params
4. **Role-Based Access**: Check user role before allowing actions
5. **Session Timeout**: 20-minute idle timeout with warning (already in mobile ✅)
6. **Excel Export**: Include created/updated user names and timestamps
7. **Product Variants**: Products have multiple batches with different prices/locations
8. **Order Status Flow**: Purchase orders: PENDING→CONFIRMED→RECEIVED→DELIVERED
9. **Partial Receipts**: Track what's been received vs what's been ordered

---

**Ready to implement? Pick Phase 1.1 (Global Search) as the first task for maximum user impact!**
