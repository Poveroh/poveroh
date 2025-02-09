import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        '../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}',
        './src/stories/**/*.{js,ts,tsx,jsx}'
    ],
    theme: {
        extend: {
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)'
            }
        }
    },
    plugins: []
}
export default config
