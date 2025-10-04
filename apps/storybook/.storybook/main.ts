import type { StorybookConfig } from '@storybook/react-vite'
import { join, dirname } from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): string {
    return dirname(require.resolve(join(value, 'package.json')))
}

const config: StorybookConfig = {
    stories: ['../src/stories/**/*.mdx', '../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    addons: [
        getAbsolutePath('@storybook/addon-onboarding'),
        getAbsolutePath('@storybook/addon-essentials'),
        getAbsolutePath('@chromatic-com/storybook'),
        getAbsolutePath('@storybook/addon-interactions')
        // Temporarily disabled the experimental Next.js preset because it depends on
        // internal Next.js files that our current Next version doesn't provide.
        // getAbsolutePath('@storybook/experimental-nextjs-vite')
    ],
    framework: {
        name: '@storybook/react-vite',
        options: {}
    },
    staticDirs: ['../public'],
    docs: { autodocs: true },
    viteFinal: async config => {
        config.optimizeDeps = { ...(config.optimizeDeps ?? {}), exclude: ['next'] }
        return config
    }
}

export default config
