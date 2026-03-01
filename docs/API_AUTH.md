# 🔐 Authentication hey-api + TanStack Query + better-auth

This guide explains how authenticated and unauthenticated API calls are configured in the project.

## 📋 Configuration

### 1. API Client ([lib/api-client.ts](apps/app/lib/api-client.ts))

The hey-api client is configured to automatically include better-auth session cookies:

```typescript
import { client } from '@/lib/api-client'

// The client is already configured with:
// - baseUrl: apiUrl + '/v1'
// - credentials: 'include' (sends cookies automatically)
// - Content-Type: 'application/json'
```

### 2. TanStack Query Provider ([providers/server-provider.tsx](apps/app/providers/server-provider.tsx))

The `QueryClientProvider` is already configured and automatically imports the configured client.

## 🚀 Usage

### AUTHENTICATED Calls (default)

**All calls are authenticated by default** - the session cookie is sent automatically:

```typescript
import { useQuery, useMutation } from '@tanstack/react-query'
import { getUserOptions, putUserMutation } from '../api/@tanstack/react-query.gen'

// ✅ Authenticated GET
export const useGetUser = () => {
    return useQuery(getUserOptions())
}

// ✅ Authenticated POST/PUT
export const useUpdateUser = () => {
    return useMutation(putUserMutation())
}

// Usage in component:
function UserProfile() {
    const { data: user, isLoading } = useGetUser()
    const updateUser = useUpdateUser()

    const handleUpdate = () => {
        updateUser.mutate({
            body: { firstName: 'Mario' }
        })
    }

    if (isLoading) return <div>Loading...</div>
    return <div>{user?.firstName}</div>
}
```

### UNAUTHENTICATED Calls (public)

For calls that **don't require authentication**, use `withoutAuth()`:

```typescript
import { useQuery } from '@tanstack/react-query'
import { getRootStatusOptions } from '../api/@tanstack/react-query.gen'
import { withoutAuth } from '@/lib/api-client'

// ✅ Public GET (without cookies)
export const usePublicStatus = () => {
    return useQuery(getRootStatusOptions(withoutAuth()))
}
```

### Direct Calls (without hooks)

You can also use SDK functions directly:

```typescript
import { getUser, getRootStatus } from '@/lib/api-client'
import { withoutAuth } from '@/lib/api-client'

// ✅ Authenticated call
const user = await getUser()

// ✅ Public call
const status = await getRootStatus(withoutAuth())
```

## 📚 Complete Examples

### 1. AUTHENTICATED Calls (default)

All calls are authenticated by default using better-auth cookies.

#### Example: GET with authentication

```typescript
import { useQuery } from '@tanstack/react-query'
import { getUserOptions } from '../api/@tanstack/react-query.gen'

export const useAuthenticatedUser = () => {
    return useQuery(getUserOptions())
    // Session cookie is sent automatically
}
```

#### Example: GET with parameters and authentication

```typescript
import { getTransactionsOptions } from '../api/@tanstack/react-query.gen'

export const useAuthenticatedTransactions = (filters?: { year?: number }) => {
    return useQuery(
        getTransactionsOptions({
            query: filters
        })
    )
    // Session cookie is sent automatically
}
```

#### Example: POST with authentication

```typescript
import { useMutation } from '@tanstack/react-query'
import { postTransactionsMutation } from '../api/@tanstack/react-query.gen'

export const useCreateTransaction = () => {
    return useMutation(postTransactionsMutation())
}

// Usage in component:
const createTx = useCreateTransaction()
createTx.mutate({
    body: {
        amount: 100,
        description: 'Payment'
    }
})
```

#### Example: PUT with authentication

```typescript
import { useMutation } from '@tanstack/react-query'
import { putUserMutation } from '../api/@tanstack/react-query.gen'

export const useUpdateUser = () => {
    return useMutation(putUserMutation())
}

// Usage in component:
const updateUser = useUpdateUser()
updateUser.mutate({
    body: {
        firstName: 'John',
        lastName: 'Doe'
    }
})
```

#### Example: DELETE with authentication and parameters

```typescript
import { useMutation } from '@tanstack/react-query'
import { deleteTransactionsByIdMutation } from '../api/@tanstack/react-query.gen'

export const useDeleteTransaction = () => {
    return useMutation(deleteTransactionsByIdMutation())
}

// Usage in component:
const deleteTx = useDeleteTransaction()
deleteTx.mutate({
    path: {
        id: 'transaction-id-123'
    }
})
```

### 2. UNAUTHENTICATED Calls (public)

Use `withoutAuth()` for calls that don't require authentication.

#### Example: Public GET (without authentication)

```typescript
import { useQuery } from '@tanstack/react-query'
import { getRootStatusOptions } from '../api/@tanstack/react-query.gen'
import { withoutAuth } from '@/lib/api-client'

export const usePublicStatus = () => {
    return useQuery(getRootStatusOptions(withoutAuth()))
    // Cookies are NOT sent
}
```

### 3. CONDITIONAL Authentication

You can dynamically decide whether to authenticate or not.

```typescript
export const useConditionalAuth = (requiresAuth: boolean) => {
    return useQuery(getRootStatusOptions(requiresAuth ? undefined : withoutAuth()))
}
```

### 4. DIRECT Usage (without hooks)

You can also use SDK functions directly.

#### Direct authenticated call

```typescript
import { getUser } from '@/lib/api-client'

export const fetchUserDirectly = async () => {
    const { data, error } = await getUser()

    if (error) {
        console.error('Error:', error)
        return null
    }

    return data
}
```

#### Direct unauthenticated call

```typescript
import { getRootStatus } from '@/lib/api-client'
import { withoutAuth } from '@/lib/api-client'

export const fetchStatusDirectly = async () => {
    const { data, error } = await getRootStatus(withoutAuth())

    if (error) {
        console.error('Error:', error)
        return null
    }

    return data
}
```

#### Direct update with authentication

```typescript
import { putUser } from '@/lib/api-client'

export const updateUserDirectly = async (userData: { firstName?: string }) => {
    const { data, error } = await putUser({
        body: userData
    })

    if (error) {
        console.error('Error:', error)
        return null
    }

    return data
}
```

### 5. AUTHENTICATION Error Handling

```typescript
import { useQuery } from '@tanstack/react-query'
import { getUserOptions } from '../api/@tanstack/react-query.gen'

export const useUserWithAuthCheck = () => {
    const query = useQuery(getUserOptions())

    // If user is not authenticated, better-auth will return a 401
    if (query.error) {
        // Handle redirect to login here if necessary
        console.log('User not authenticated')
    }

    return query
}
```

**Summary:**

- ✅ **DEFAULT**: All calls are authenticated → Use `getUserOptions()`
- ✅ **PUBLIC**: Use `withoutAuth()` to omit cookies → `getRootStatusOptions(withoutAuth())`
- ✅ **FLEXIBLE**: You can always override options for specific calls
- ✅ **AUTOMATIC**: The better-auth session cookie is handled automatically

## 🔑 How It Works

1. **better-auth** manages the session via HTTP-only cookies
2. The hey-api client is configured with `credentials: 'include'` to send cookies
3. Every API call automatically includes the session cookie
4. The backend verifies the cookie and authenticates the request
5. For public calls, use `withoutAuth()` to omit cookies

## ⚙️ Customization

You can always override options for specific calls:

```typescript
// Example: custom timeout for a call
useQuery(
    getUserOptions({
        // Custom options here
    })
)
```

## 📝 Summary

| Call Type                   | How To                                              | Cookies Sent? |
| --------------------------- | --------------------------------------------------- | ------------- |
| **Authenticated (default)** | `getUserOptions()`                                  | ✅ Yes        |
| **Public**                  | `getRootStatusOptions(withoutAuth())`               | ❌ No         |
| **Conditional**             | `getOptions(condition ? undefined : withoutAuth())` | 🔀 Depends    |

## 🎯 Main Files

- [lib/api-client.ts](apps/app/lib/api-client.ts) - Client configuration
- [services/user.service.ts](apps/app/services/user.service.ts) - Basic examples
- [providers/server-provider.tsx](apps/app/providers/server-provider.tsx) - TanStack Query provider

---

✨ **You don't need to do anything for authentication** - it works automatically with better-auth cookies!
