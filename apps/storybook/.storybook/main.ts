// This file has been automatically migrated to valid ESM format by Storybook.
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
    stories: ['../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

    addons: [
        getAbsolutePath('@storybook/addon-onboarding'),
        getAbsolutePath('@chromatic-com/storybook'),
        getAbsolutePath('@storybook/addon-docs')
    ],

    framework: {
        name: getAbsolutePath('@storybook/react-vite'),
        options: {}
    },

    staticDirs: ['../public'],

    viteFinal: async config => {
        // Handle Next.js optimizations
        config.optimizeDeps = {
            ...(config.optimizeDeps ?? {}),
            exclude: ['next']
        }

        // Handle client directives in build
        if (config.build) {
            config.build.rollupOptions = {
                ...config.build.rollupOptions,
                external: id => {
                    if (id.includes('@storybook/addon-docs/dist/mdx-react-shim.js')) {
                        return false
                    }
                    return false
                },
                onwarn: (warning, warn) => {
                    // Suppress "use client" directive warnings
                    if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                        return
                    }
                    warn(warning)
                }
            }
        }

        // Handle esbuild to ignore "use client" directives
        if (config.esbuild) {
            config.esbuild.legalComments = 'none'
        }

        return config
    }
}

export default config
