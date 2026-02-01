import DrawerContext from '@/context/drawer-context'
import { DrawerStore } from '@/types/drawer'
import { useContext } from 'react'

export function useDrawer<T>() {
    const context = useContext(DrawerContext)

    if (!context) {
        throw new Error('useDrawerContext must be used within a DrawerContextProvider')
    }

    return context as DrawerStore<T>
}
