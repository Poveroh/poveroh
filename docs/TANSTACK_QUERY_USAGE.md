# TanStack Query Usage Guide

This project uses TanStack Query (React Query) for efficient server state management with automatic caching, automatic refetching, loading states, and error handling.

## Table of Contents

1. [Basic Concepts](#basic-concepts)
2. [Using Hooks](#using-hooks)
3. [Examples](#examples)
4. [Best Practices](#best-practices)

---

## Basic Concepts

### What is TanStack Query?

TanStack Query is a powerful library for managing server state in React applications. It provides:

- ✅ Automatic caching and background updates
- ✅ Loading and error states
- ✅ Automatic retry on failure
- ✅ Query invalidation and refetching
- ✅ Optimistic updates

### useQuery vs useMutation

- **useQuery**: For fetching data (GET requests)
- **useMutation**: For modifying data (POST, PUT, DELETE requests)

---

## Using Hooks

### Option 1: Direct Hook Usage (Recommended)

Use the generated hooks directly in your components:

```typescript
import { useGetUser, useUpdateUser } from '@/services/user.service'

function UserProfile() {
    // useQuery hook - automatically fetches and caches data
    const { data: user, isLoading, error } = useGetUser()

    // useMutation hook - for updating data
    const mutation = useUpdateUser()

    const handleSave = () => {
        mutation.mutate({ body: { name: 'New Name' } })
    }

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>

    return (
        <div>
            <h1>{user?.name}</h1>
            <button
                onClick={handleSave}
                disabled={mutation.isPending}
            >
                {mutation.isPending ? 'Saving...' : 'Save'}
            </button>
        </div>
    )
}
```

### Option 2: Custom Hook Wrapper

Use wrapped hooks like `useUser()` that expose TanStack Query states:

```typescript
import { useUser } from '@/hooks/use-user'

function UserSettings() {
    const { user, saveUser, isSaving, saveError, isSuccess } = useUser()

    const handleUpdate = async () => {
        const success = await saveUser({ name: 'Updated Name' })
        if (success) {
            console.log('User updated!')
        }
    }

    return (
        <div>
            <input
                defaultValue={user.name}
                disabled={isSaving}
            />
            <button
                onClick={handleUpdate}
                disabled={isSaving}
            >
                {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            {saveError && <p>Error: {saveError.message}</p>}
            {isSuccess && <p>Saved successfully!</p>}
        </div>
    )
}
```

---

## Examples

### Example 1: Fetching Data with Loading State

```typescript
import { useGetTransactions } from '@/api/@tanstack/react-query.gen'

function TransactionList() {
    const { data: transactions, isLoading, error, refetch } = useQuery(
        getTransactionsOptions()
    )

    if (isLoading) return <Spinner />
    if (error) return <ErrorMessage error={error} />

    return (
        <div>
            <button onClick={() => refetch()}>Refresh</button>
            {transactions?.map(tx => (
                <div key={tx.id}>{tx.description}</div>
            ))}
        </div>
    )
}
```

### Example 2: Creating Data with Mutation

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postTransactionsMutation } from '@/api/@tanstack/react-query.gen'

function AddTransaction() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        ...postTransactionsMutation(),
        onSuccess: () => {
            // Invalidate and refetch transactions list
            queryClient.invalidateQueries({ queryKey: ['getTransactions'] })
        }
    })

    const handleSubmit = (formData: FormData) => {
        mutation.mutate({ body: formData })
    }

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="description" />
            <button
                type="submit"
                disabled={mutation.isPending}
            >
                {mutation.isPending ? 'Adding...' : 'Add Transaction'}
            </button>
            {mutation.isError && <p>Error: {mutation.error.message}</p>}
            {mutation.isSuccess && <p>Transaction added!</p>}
        </form>
    )
}
```

### Example 3: Optimistic Updates

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { putTransactionsByIdMutation } from '@/api/@tanstack/react-query.gen'

function TransactionItem({ transaction }) {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        ...putTransactionsByIdMutation(),
        // Optimistically update UI before request completes
        onMutate: async (variables) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['getTransactions'] })

            // Snapshot current value
            const previous = queryClient.getQueryData(['getTransactions'])

            // Optimistically update
            queryClient.setQueryData(['getTransactions'], (old: any) => {
                return old.map((tx: any) =>
                    tx.id === transaction.id
                        ? { ...tx, ...variables.body }
                        : tx
                )
            })

            return { previous }
        },
        // Rollback on error
        onError: (_err, _variables, context) => {
            queryClient.setQueryData(['getTransactions'], context?.previous)
        },
        // Refetch after success or error
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['getTransactions'] })
        }
    })

    return (
        <div>
            <input
                value={transaction.description}
                onChange={(e) => {
                    mutation.mutate({
                        path: { id: transaction.id },
                        body: { description: e.target.value }
                    })
                }}
            />
        </div>
    )
}
```

### Example 4: Dependent Queries

```typescript
import { useQuery } from '@tanstack/react-query'
import { getUserOptions, getAccountsOptions } from '@/api/@tanstack/react-query.gen'

function UserAccounts() {
    // First query - get user
    const { data: user } = useQuery(getUserOptions())

    // Second query - only runs when user is available
    const { data: accounts } = useQuery({
        ...getAccountsOptions(),
        enabled: !!user  // Only run when user exists
    })

    return <div>{accounts?.length} accounts</div>
}
```

### Example 5: Manual Query Invalidation

```typescript
import { useQueryClient } from '@tanstack/react-query'

function RefreshButton() {
    const queryClient = useQueryClient()

    const refreshAll = () => {
        // Invalidate all queries
        queryClient.invalidateQueries()
    }

    const refreshUser = () => {
        // Invalidate specific query
        queryClient.invalidateQueries({ queryKey: ['getUser'] })
    }

    const refreshPattern = () => {
        // Invalidate queries matching pattern
        queryClient.invalidateQueries({ queryKey: ['getTransactions'] })
    }

    return (
        <div>
            <button onClick={refreshAll}>Refresh All</button>
            <button onClick={refreshUser}>Refresh User</button>
            <button onClick={refreshPattern}>Refresh Transactions</button>
        </div>
    )
}
```

---

## Best Practices

### 1. Use Query Keys Consistently

Query keys should match the operation name:

```typescript
// ✅ Good
queryClient.invalidateQueries({ queryKey: ['getUser'] })

// ❌ Bad
queryClient.invalidateQueries({ queryKey: ['user'] })
```

### 2. Handle Loading and Error States

Always handle loading and error states in your UI:

```typescript
if (isLoading) return <Spinner />
if (error) return <ErrorMessage error={error} />
```

### 3. Invalidate Queries After Mutations

Always invalidate related queries after successful mutations:

```typescript
onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['getTransactions'] })
}
```

### 4. Use Optimistic Updates for Better UX

For instant feedback, use optimistic updates:

```typescript
onMutate: async variables => {
    // Update UI immediately
}
```

### 5. Enable/Disable Queries Conditionally

Prevent unnecessary requests:

```typescript
useQuery({
    ...getDataOptions(),
    enabled: !!userId // Only fetch when userId exists
})
```

### 6. Configure Stale Time

Prevent unnecessary refetches:

```typescript
useQuery({
    ...getDataOptions(),
    staleTime: 5 * 60 * 1000 // Consider data fresh for 5 minutes
})
```

### 7. Use Mutation States in UI

Show feedback using mutation states:

```typescript
<button disabled={mutation.isPending}>
    {mutation.isPending ? 'Saving...' : 'Save'}
</button>
```

---

## Exposed States

### useQuery States

- `data`: The query result data
- `isLoading`: True while fetching for the first time
- `isFetching`: True while fetching (including background refetch)
- `error`: Error object if query failed
- `isError`: True if query has error
- `isSuccess`: True if query succeeded
- `refetch()`: Function to manually refetch

### useMutation States

- `isPending`: True while mutation is in progress
- `isError`: True if mutation failed
- `isSuccess`: True if mutation succeeded
- `error`: Error object if mutation failed
- `data`: The mutation result data
- `mutate()`: Function to trigger mutation
- `mutateAsync()`: Async version of mutate
- `reset()`: Reset mutation state

---

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Query Tutorial](https://tanstack.com/query/latest/docs/react/overview)
- [API Authentication Guide](./API_AUTH.md)
