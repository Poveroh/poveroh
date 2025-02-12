import type { Preview } from '@storybook/react'

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
            values: [
                { name: 'light', value: '#ffffff' },
                { name: 'dark', value: '#1c1c1c' }
            ]
        }
    }
}

export default preview
