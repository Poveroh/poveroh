import { connection } from 'next/server'
import { getPublicRuntimeEnv, serializePublicRuntimeEnv } from '@/lib/runtime-env'

/**
 * Injects the public runtime env into the page before hydration, reading it per request so it is never baked into a static build.
 * @returns The inline script assigning `window.__ENV`.
 */
export async function PublicEnvScript() {
    await connection()

    return <script dangerouslySetInnerHTML={{ __html: serializePublicRuntimeEnv(getPublicRuntimeEnv()) }} />
}
