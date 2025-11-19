import { defineConfig } from 'vite'

export default defineConfig({
    esbuild: {
        // Ignore "use client" directives during build
        legalComments: 'none'
    },
    build: {
        rollupOptions: {
            onwarn: (warning, warn) => {
                // Suppress "use client" directive warnings
                if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                    return
                }
                // Suppress external module resolution warnings
                if (warning.code === 'UNRESOLVED_IMPORT' && warning.source?.includes('mdx-react-shim')) {
                    return
                }
                warn(warning)
            }
        }
    }
})
