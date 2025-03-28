import type { StorybookConfig } from '@storybook/nextjs'
import { join, dirname } from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url) // Use `createRequire` for CommonJS module resolution

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
    ],
    framework: {
        name: getAbsolutePath('@storybook/nextjs'),
        options: {}
    },
    staticDirs: ['../public'],
    docs: {
        autodocs: true
    }
}

export default config
