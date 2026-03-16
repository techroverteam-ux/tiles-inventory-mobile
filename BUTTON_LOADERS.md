# Button Loader Components

## Base Loading Button Component

```typescript
// src/components/common/LoadingButton.tsx
import React from 'react'
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle
} from 'react-native'
import { colors } from '../../theme/colors'

interface LoadingButtonProps {
  title: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  size?: 'small' | 'medium' | 'large'
  style?: ViewStyle
  textStyle?: TextStyle
  loadingColor?: string
  icon?: React.ReactNode
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  loadingColor,
  icon
}) => {
  const isDisabled = disabled || loading

  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    isDisabled && styles.disabled,
    style
  ]

  const textStyleCombined = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    isDisabled && styles.disabledText,
    textStyle
  ]

  const spinnerColor = loadingColor || getSpinnerColor(variant)

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size={getSpinnerSize(size)}
          color={spinnerColor}
        />
      ) : (
        <>
          {icon}
          <Text style={textStyleCombined}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  )
}

const getSpinnerColor = (variant: string): string => {
  switch (variant) {
    case 'primary':
    case 'danger':
      return colors.white
    case 'secondary':
    case 'outline':
      return colors.primary
    default:
      return colors.white
  }
}

const getSpinnerSize = (size: string): 'small' | 'large' => {
  return size === 'small' ? 'small' : 'small'
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44
  },
  // Variants
  primary: {
    backgroundColor: colors.primary
  },
  secondary: {
    backgroundColor: colors.secondary
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary
  },
  danger: {
    backgroundColor: colors.danger
  },
  // Sizes
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 52
  },
  // States
  disabled: {
    opacity: 0.6
  },
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center'
  },
  primaryText: {
    color: colors.white
  },
  secondaryText: {
    color: colors.white
  },
  outlineText: {
    color: colors.primary
  },
  dangerText: {
    color: colors.white
  },
  smallText: {
    fontSize: 14
  },
  mediumText: {
    fontSize: 16
  },
  largeText: {
    fontSize: 18
  },
  disabledText: {
    opacity: 0.7
  }
})
```

## Form Action Buttons

```typescript
// src/components/forms/FormActionButtons.tsx
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { LoadingButton } from '../common/LoadingButton'

interface FormActionButtonsProps {
  onSave: () => void
  onCancel: () => void
  onDelete?: () => void
  saving?: boolean
  deleting?: boolean
  saveTitle?: string
  cancelTitle?: string
  deleteTitle?: string
  showDelete?: boolean
  disabled?: boolean
}

export const FormActionButtons: React.FC<FormActionButtonsProps> = ({
  onSave,
  onCancel,
  onDelete,
  saving = false,
  deleting = false,
  saveTitle = 'Save',
  cancelTitle = 'Cancel',
  deleteTitle = 'Delete',
  showDelete = false,
  disabled = false
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.primaryActions}>
        <LoadingButton
          title={cancelTitle}
          onPress={onCancel}
          variant="outline"
          style={styles.cancelButton}
          disabled={saving || deleting}
        />
        <LoadingButton
          title={saveTitle}
          onPress={onSave}
          variant="primary"
          loading={saving}
          disabled={disabled}
          style={styles.saveButton}
        />
      </View>
      
      {showDelete && onDelete && (
        <LoadingButton
          title={deleteTitle}
          onPress={onDelete}
          variant="danger"
          loading={deleting}
          disabled={saving}
          style={styles.deleteButton}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12
  },
  primaryActions: {
    flexDirection: 'row',
    gap: 12
  },
  cancelButton: {
    flex: 1
  },
  saveButton: {
    flex: 1
  },
  deleteButton: {
    alignSelf: 'stretch'
  }
})
```

## Login Button Component

```typescript
// src/components/auth/LoginButton.tsx
import React from 'react'
import { StyleSheet } from 'react-native'
import { LoadingButton } from '../common/LoadingButton'
import { colors } from '../../theme/colors'

interface LoginButtonProps {
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  title?: string
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  onPress,
  loading = false,
  disabled = false,
  title = 'Sign In'
}) => {
  return (
    <LoadingButton
      title={title}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      variant="primary"
      size="large"
      style={styles.loginButton}
      textStyle={styles.loginButtonText}
    />
  )
}

const styles = StyleSheet.create({
  loginButton: {
    width: '100%',
    marginTop: 24,
    backgroundColor: colors.primary,
    borderRadius: 12
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600'
  }
})
```

## Quick Action Buttons

```typescript
// src/components/common/QuickActionButton.tsx
import React from 'react'
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native'
import { ActivityIndicator } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { colors } from '../../theme/colors'

interface QuickActionButtonProps {
  iconName: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  style?: ViewStyle
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  iconName,
  onPress,
  loading = false,
  disabled = false,
  size = 'medium',
  variant = 'primary',
  style
}) => {
  const isDisabled = disabled || loading
  
  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    isDisabled && styles.disabled,
    style
  ]

  const iconSize = getIconSize(size)
  const iconColor = getIconColor(variant)

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={iconColor}
        />
      ) : (
        <Icon
          name={iconName}
          size={iconSize}
          color={iconColor}
        />
      )}
    </TouchableOpacity>
  )
}

const getIconSize = (size: string): number => {
  switch (size) {
    case 'small': return 16
    case 'medium': return 20
    case 'large': return 24
    default: return 20
  }
}

const getIconColor = (variant: string): string => {
  switch (variant) {
    case 'primary': return colors.white
    case 'secondary': return colors.text
    case 'danger': return colors.white
    case 'success': return colors.white
    default: return colors.white
  }
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8
  },
  // Variants
  primary: {
    backgroundColor: colors.primary
  },
  secondary: {
    backgroundColor: colors.gray200
  },
  danger: {
    backgroundColor: colors.danger
  },
  success: {
    backgroundColor: colors.success
  },
  // Sizes
  small: {
    width: 32,
    height: 32
  },
  medium: {
    width: 40,
    height: 40
  },
  large: {
    width: 48,
    height: 48
  },
  // States
  disabled: {
    opacity: 0.6
  }
})
```

## Floating Action Button

```typescript
// src/components/common/FloatingActionButton.tsx
import React from 'react'
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native'
import { ActivityIndicator } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { colors } from '../../theme/colors'

interface FloatingActionButtonProps {
  iconName: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
  backgroundColor?: string
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  iconName,
  onPress,
  loading = false,
  disabled = false,
  style,
  backgroundColor = colors.primary
}) => {
  const isDisabled = disabled || loading

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        { backgroundColor },
        isDisabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={colors.white}
        />
      ) : (
        <Icon
          name={iconName}
          size={24}
          color={colors.white}
        />
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  disabled: {
    opacity: 0.6
  }
})
```

## List Item Action Buttons

```typescript
// src/components/common/ListItemActions.tsx
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { QuickActionButton } from './QuickActionButton'

interface ListItemActionsProps {
  onEdit?: () => void
  onDelete?: () => void
  onView?: () => void
  editLoading?: boolean
  deleteLoading?: boolean
  viewLoading?: boolean
  showEdit?: boolean
  showDelete?: boolean
  showView?: boolean
}

export const ListItemActions: React.FC<ListItemActionsProps> = ({
  onEdit,
  onDelete,
  onView,
  editLoading = false,
  deleteLoading = false,
  viewLoading = false,
  showEdit = true,
  showDelete = true,
  showView = false
}) => {
  return (
    <View style={styles.container}>
      {showView && onView && (
        <QuickActionButton
          iconName="visibility"
          onPress={onView}
          loading={viewLoading}
          variant="secondary"
          size="small"
        />
      )}
      
      {showEdit && onEdit && (
        <QuickActionButton
          iconName="edit"
          onPress={onEdit}
          loading={editLoading}
          variant="primary"
          size="small"
        />
      )}
      
      {showDelete && onDelete && (
        <QuickActionButton
          iconName="delete"
          onPress={onDelete}
          loading={deleteLoading}
          variant="danger"
          size="small"
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  }
})
```

## Refresh Button

```typescript
// src/components/common/RefreshButton.tsx
import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { ActivityIndicator } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { colors } from '../../theme/colors'

interface RefreshButtonProps {
  onPress: () => void
  loading?: boolean
  size?: number
  color?: string
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onPress,
  loading = false,
  size = 24,
  color = colors.primary
}) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={color}
        />
      ) : (
        <Icon
          name="refresh"
          size={size}
          color={color}
        />
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
```

## Usage Examples

```typescript
// In your screens and components

// Login Screen
const LoginScreen = () => {
  const [loading, setLoading] = useState(false)
  
  const handleLogin = async () => {
    setLoading(true)
    try {
      await authService.login(email, password)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <LoginButton
      onPress={handleLogin}
      loading={loading}
      title="Sign In"
    />
  )
}

// Product Form
const ProductForm = () => {
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  const handleSave = async () => {
    setSaving(true)
    try {
      await productService.save(formData)
    } finally {
      setSaving(false)
    }
  }
  
  const handleDelete = async () => {
    setDeleting(true)
    try {
      await productService.delete(productId)
    } finally {
      setDeleting(false)
    }
  }
  
  return (
    <FormActionButtons
      onSave={handleSave}
      onCancel={handleCancel}
      onDelete={handleDelete}
      saving={saving}
      deleting={deleting}
      showDelete={!!productId}
    />
  )
}

// Product List Item
const ProductListItem = ({ product }) => {
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  return (
    <View style={styles.listItem}>
      <Text>{product.name}</Text>
      <ListItemActions
        onEdit={() => handleEdit(product)}
        onDelete={() => handleDelete(product)}
        editLoading={editLoading}
        deleteLoading={deleteLoading}
      />
    </View>
  )
}
```

## Key Features

1. **Non-blocking UI**: Only the clicked button shows loading state
2. **Consistent Design**: Unified button styling across the app
3. **Accessibility**: Proper disabled states and touch feedback
4. **Customizable**: Multiple variants, sizes, and styling options
5. **Performance**: Optimized animations and state management
6. **Type Safe**: Full TypeScript support with proper interfaces