# Quick Testing Guide - Phase 1 Features

## Test Scenarios

### 1. Global Search Feature

**Location**: Dashboard → Search (or drawer menu)

**Test Case 1.1: Basic Search**
1. Tap on Search icon/screen
2. Type "ceramic" (or any product name)
3. Wait 300ms for search to execute
4. Verify results show products, brands, or categories
5. Expected: Results list appears with proper icons

**Test Case 1.2: Search Navigation**
1. Perform a search
2. Tap on a Product result
3. Expected: Navigate to ProductDetailScreen
4. Go back and tap Brand result
5. Expected: Navigate to BrandDetailScreen

**Test Case 1.3: Recent Searches**
1. Search for "tile"
2. Search for "ceramic"
3. Search for "floor"
4. Clear search box (hit X)
5. Expected: See recent searches list with all 3 terms
6. Tap on "ceramic" from recent
7. Expected: Search re-executes and shows previous results

**Test Case 1.4: Empty Results**
1. Search for "xyzabc123" (non-existent term)
2. Expected: "No results found" message shows
3. Toast notification appears with "No results found"

**Test Case 1.5: Error Handling**
1. Turn off wifi/mobile data
2. Try to search
3. Expected: Toast shows "Search failed. Please try again."
4. Clear search, turn data back on
5. Search again - should work

---

### 2. Orders Screen (Unified)

**Location**: Dashboard → Orders (or drawer menu)

**Test Case 2.1: Tab Switching**
1. Open Orders screen
2. Default should show Purchase Orders tab (active)
3. Tap on Sales Orders tab
4. Expected: Switch to Sales Orders view
5. Tap back on Purchase Orders
6. Expected: Return to Purchase Orders with same filter

**Test Case 2.2: Purchase Orders List**
1. On Purchase Orders tab
2. Expected: See list of purchase orders with:
   - Order number
   - Supplier name
   - Order date
   - Status badge (color-coded)
   - Total amount
   - Item count
3. Scroll down to see more orders
4. Expected: Smooth FlatList scrolling

**Test Case 2.3: Sales Orders List**
1. Switch to Sales Orders tab
2. Expected: See list of sales orders with:
   - Order number
   - Customer name
   - Order date
   - Status badge
   - Total amount
   - Item count

**Test Case 2.4: Status Filtering**
1. On Purchase Orders tab
2. Tap "Pending" filter button
3. Expected: List filters to show only PENDING status orders
4. Tap "Confirmed" filter
5. Expected: List shows only CONFIRMED orders
6. Tap "All"
7. Expected: All orders return

**Test Case 2.5: Order Actions - Pending**
1. Find a PENDING order
2. Expected: See "Confirm" and "Cancel" buttons at bottom
3. Tap "Confirm"
4. Expected: Order status updates to CONFIRMED
5. Toast shows "Order status updated"
6. Order card reflects new status

**Test Case 2.6: Order Actions - Confirmed**
1. Find a CONFIRMED order
2. Expected: See "Mark Delivered" button
3. Tap button
4. Expected: Navigate to delivery screen (or update status)
5. Status updates to DELIVERED

**Test Case 2.7: Pull to Refresh**
1. On Orders screen
2. Pull down on the list
3. Expected: Refresh spinner appears
4. After 1-2 seconds: Orders list refreshes
5. Spinner disappears

**Test Case 2.8: Empty State**
1. Filter for a status with no orders (e.g., "Cancelled")
2. Expected: Shows empty state with icon
3. Message: "No cancelled orders"

**Test Case 2.9: Create New Order**
1. On Orders screen
2. Tap the floating action button (+ icon)
3. If on Purchase Orders tab:
   - Expected: Navigate to PurchaseOrderForm
4. If on Sales Orders tab:
   - Expected: Navigate to SalesOrderForm

**Test Case 2.10: Loading State**
1. Open Orders screen for first time
2. Expected: Skeleton loading cards appear
3. After 1-2 seconds: Real orders load
4. Skeletons disappear

---

### 3. Dark Mode Integration

**Test Case 3.1: Theme Toggle on Global Search**
1. Open Global Search screen
2. Tap theme toggle switch (top right)
3. Expected: Background, text, and card colors change
4. Search input maintains visibility
5. Tap toggle again
6. Expected: Light theme returns

**Test Case 3.2: Theme Toggle on Orders**
1. Open Orders screen
2. Tap theme toggle switch (top right)
3. Expected: All colors adapt to dark/light theme
4. Status badges remain properly colored
5. Text contrast maintained

---

### 4. Error Scenarios

**Test Case 4.1: API Failure - Network Error**
1. Enable flight mode (offline)
2. Try to search or load orders
3. Expected: Toast error message
4. Disable flight mode
5. Retry search/order load
6. Expected: Works again

**Test Case 4.2: Invalid Navigation**
1. Search for order result
2. Delete order from backend (if possible)
3. Tap result to navigate
4. Expected: Either detail screen shows "not found" or error toast

**Test Case 4.3: Concurrent Operations**
1. Start multiple searches rapidly
2. Expected: Latest search result is displayed
3. Previous results are cancelled

---

### 5. Performance Tests

**Test Case 5.1: Large Result Sets**
1. Search for a common term (e.g., "a")
2. If >100 results returned
3. Expected: Smooth scrolling (FlatList pagination)
4. No lag or jank

**Test Case 5.2: Order List with Many Items**
1. Load Orders screen
2. If 50+ orders, scroll fast
3. Expected: Smooth 60 FPS scrolling
4. Memory usage stays reasonable

---

## How to Run Tests

### Automated Testing (optional)
```bash
npm test -- --testNamePattern="GlobalSearch|OrderList"
```

### Manual Testing on Emulator
```bash
# Start emulator
emulator -avd Pixel_9a

# Start app
npx react-native run-android --no-packager

# Start Metro (in separate terminal)
npx react-native start

# Navigate to features via drawer menu
```

### Manual Testing on Device
```bash
# Build APK
npx react-native run-android --variant=release

# Install on connected device
adb install -r android/app/build/outputs/apk/release/app-release.apk

# Test on device with real data
```

---

## Known Issues / Edge Cases

1. **Search with special characters**: May need escaping
   - Example: Search "tile&floor" might not work
   - Workaround: Use plain alphanumeric searches

2. **Order status transitions**: Not all statuses are always allowed
   - e.g., Can't go from DELIVERED to PENDING
   - App should prevent invalid transitions

3. **Deleted orders**: If order is deleted by another user
   - Detail screen should show "Order not found"
   - List should auto-refresh

4. **Pagination**: Currently hardcoded to 20 items per page
   - Long lists may require scroll loading indicator

5. **Offline mode**: Not yet implemented
   - App will fail requests when offline
   - Future feature for Phase 3

---

## Success Criteria

✅ All test cases pass without errors  
✅ No console errors or warnings  
✅ Toast notifications display correctly  
✅ Navigation flows work as expected  
✅ Dark mode toggle works in all screens  
✅ Performance is smooth (60 FPS)  
✅ API calls use correct endpoints  
✅ Auth cookies persist across requests  

---

**Report any issues found to the development team with:**
- Test case number
- Steps to reproduce
- Expected vs. actual result
- Device/emulator details
- Screenshots if applicable
