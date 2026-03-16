# Tiles Inventory Mobile - Project Structure

## Root Structure
```
tiles-inventory-mobile/
├── android/                    # Android native configuration (reused from elora-mobile)
├── ios/                       # iOS configuration (optional)
├── src/                       # Main source code
│   ├── components/            # Reusable UI components
│   │   ├── common/           # Common components (buttons, inputs, etc.)
│   │   ├── loading/          # Loading components (skeleton, button loaders)
│   │   ├── forms/            # Form components
│   │   └── navigation/       # Navigation components
│   ├── screens/              # Screen components organized by feature
│   │   ├── auth/            # Authentication screens
│   │   ├── dashboard/       # Dashboard screens
│   │   ├── inventory/       # Inventory management screens
│   │   ├── products/        # Product management screens
│   │   ├── orders/          # Order management screens
│   │   ├── customers/       # Customer management screens
│   │   ├── suppliers/       # Supplier management screens
│   │   ├── reports/         # Reports screens
│   │   └── settings/        # Settings screens
│   ├── navigation/           # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── TabNavigator.tsx
│   │   └── types.ts
│   ├── services/            # API services and business logic
│   │   ├── api/            # API service classes
│   │   ├── auth/           # Authentication services
│   │   ├── storage/        # Local storage services
│   │   └── session/        # Session management
│   ├── context/            # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── SessionContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── ToastContext.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useSession.ts
│   │   ├── useApi.ts
│   │   └── useLoading.ts
│   ├── utils/              # Utility functions
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── validation.ts
│   │   └── formatters.ts
│   ├── types/              # TypeScript type definitions
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── inventory.ts
│   │   └── navigation.ts
│   ├── theme/              # Theme configuration
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── spacing.ts
│   └── assets/             # Static assets
│       ├── images/
│       ├── icons/
│       └── fonts/
├── package.json            # Dependencies (extended from elora-mobile)
├── android/app/build.gradle # Android build config (reused)
└── tsconfig.json          # TypeScript configuration
```

## Feature Module Structure (Example: Inventory)
```
src/screens/inventory/
├── InventoryListScreen.tsx      # Main inventory list
├── InventoryDetailScreen.tsx    # Inventory item details
├── InventoryFormScreen.tsx      # Add/Edit inventory
├── components/                  # Inventory-specific components
│   ├── InventoryCard.tsx       # Inventory item card
│   ├── InventoryFilters.tsx    # Filter components
│   ├── InventorySearch.tsx     # Search component
│   └── InventorySkeleton.tsx   # Loading skeleton
├── hooks/                      # Inventory-specific hooks
│   ├── useInventory.ts         # Inventory data management
│   ├── useInventoryFilters.ts  # Filter logic
│   └── useInventoryForm.ts     # Form logic
└── types/                      # Inventory type definitions
    └── inventory.types.ts
```

## Component Organization
```
src/components/
├── common/                     # Reusable across all features
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── LoadingButton.tsx
│   │   └── Button.styles.ts
│   ├── Input/
│   │   ├── TextInput.tsx
│   │   ├── SearchInput.tsx
│   │   └── Input.styles.ts
│   ├── Card/
│   │   ├── Card.tsx
│   │   ├── InfoCard.tsx
│   │   └── Card.styles.ts
│   └── Modal/
│       ├── Modal.tsx
│       ├── ConfirmModal.tsx
│       └── Modal.styles.ts
├── loading/                    # Loading components
│   ├── SkeletonCard.tsx
│   ├── SkeletonList.tsx
│   ├── SkeletonTable.tsx
│   ├── ButtonLoader.tsx
│   └── PageLoader.tsx
├── forms/                      # Form components
│   ├── FormField.tsx
│   ├── FormSelect.tsx
│   ├── FormDatePicker.tsx
│   └── FormImagePicker.tsx
└── navigation/                 # Navigation components
    ├── TabBar.tsx
    ├── Header.tsx
    └── DrawerContent.tsx
```

## Key Architectural Principles

1. **Feature-Based Organization**: Each major feature (inventory, products, orders) has its own folder with screens, components, hooks, and types.

2. **Component Reusability**: Common components are shared across features, while feature-specific components are kept within their respective folders.

3. **Separation of Concerns**: Business logic is separated into services and hooks, keeping components focused on UI rendering.

4. **Type Safety**: Comprehensive TypeScript types for all data structures and API responses.

5. **Consistent Naming**: Clear, descriptive names following React Native conventions.

6. **Scalability**: Structure supports easy addition of new features without affecting existing code.