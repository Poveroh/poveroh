import type { Preview } from '@storybook/react-vite'

import '../src/styles/globals.css'

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i
            }
        },
        backgrounds: {
            options: {
                light: { name: 'light', value: '#ffffff' },
                dark: { name: 'dark', value: '#1c1c1c' }
            }
        }
    },

    tags: ['autodocs']
}

export default preview
