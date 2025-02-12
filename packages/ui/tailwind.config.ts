import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const config = {
    darkMode: ['class'],
    content: [
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        '../../packages/ui/src/components/**/*.{ts,tsx}'
    ],
    theme: {
        extend: {
            colors: {
                border: 'var(--border-color)',
                input: 'var(--input-color)',
                ring: 'var(--ring-color)',
                box: 'var(--box-color)',
                background: 'var(--body-color)',
                primary: {
                    DEFAULT: 'var(--primary-color)',
                    foreground: 'var(--primary-foreground-color)'
                },
                secondary: {
                    DEFAULT: 'var(--secondary-color)',
                    foreground: 'var(--secondary-foreground-color)'
                },
                danger: {
                    DEFAULT: 'var(--danger-color)',
                    foreground: 'var(---foreground-color)'
                },
                success: {
                    DEFAULT: 'var(--success-color)',
                    foreground: 'var(---foreground-color)'
                },
                warning: {
                    DEFAULT: 'var(--warning-color)',
                    foreground: 'var(---foreground-color)'
                },
                muted: {
                    DEFAULT: 'var(--muted-color)',
                    foreground: 'var(--muted-foreground-color)'
                },
                accent: {
                    DEFAULT: 'var(--accent-color)',
                    foreground: 'var(--accent-foreground-color)'
                },
                popover: {
                    DEFAULT: 'var(--popover-color)',
                    foreground: 'var(--popover-foreground-color)'
                },
                card: {
                    DEFAULT: 'var(--card-color)',
                    foreground: 'var(--card-foreground-color)'
                }
            },
            borderRadius: {
                lg: 'var(--radius-size)',
                md: 'calc(var(--radius-size) - 2px)',
                sm: 'calc(var(--radius-size) - 4px)'
            }
        }
    },
    plugins: [tailwindcssAnimate]
} satisfies Config

export default config
