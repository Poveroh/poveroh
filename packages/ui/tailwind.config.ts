import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const config = {
    darkMode: ['class'],
    content: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', '../../packages/ui/src/components/**/*.{ts,tsx}'],
    theme: {
        extend: {
            fontSize: {
                base: ['var(--size-p-default)', 'normal'],
                h1: ['var(--size-headings-h1)', 'normal'],
                h2: ['var(--size-headings-h2)', 'normal'],
                h3: ['var(--size-headings-h3)', 'normal'],
                h4: ['var(--size-headings-h4)', 'normal'],
                h5: ['var(--size-headings-h5)', 'normal']
            },
            colors: {
                border: {
                    DEFAULT: 'var(--border-color)'
                },
                brand: 'var(--brand-color)',
                'brand-color-2': 'var(--brand-color-2)',
                input: 'var(--input-color)',
                hr: 'var(--hr-color)',
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
                },
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar-background))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    primary: 'hsl(var(--sidebar-primary))',
                    'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                    accent: 'hsl(var(--sidebar-accent))',
                    'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                    border: 'hsl(var(--sidebar-border))',
                    ring: 'hsl(var(--sidebar-ring))'
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
