import { BrandIcon } from '@/components/icon/brand-icon'

/**
 * Renders a small avatar for an asset, using its brand logo when available and falling back to the initial letter.
 * @param logo The logo URL to render, when present.
 * @param name The asset name used for the fallback initial.
 * @returns The avatar element.
 */
export function AssetAvatar({ logo, name }: { logo?: string | null; name: string }) {
    if (logo) {
        return <BrandIcon icon={logo} size='sm' circled />
    }

    return (
        <div className='flex items-center justify-center w-9 h-9 rounded-full bg-muted text-xs font-medium shrink-0'>
            {name.charAt(0).toUpperCase()}
        </div>
    )
}
