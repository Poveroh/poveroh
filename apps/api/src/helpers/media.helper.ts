import config from '@/utils/environment'
import { getUploadClient, isLocalStorageMode } from '@/utils/storage'
import path from 'path/win32'

export class MediaHelper {
    /**
     * Uploads a file to the configured storage provider and returns the stored URL or path.
     */
    static async handleUpload(file: Express.Multer.File, filePath: string): Promise<string> {
        const fullPath = path.join(filePath, file.originalname)
        const uploadClient = getUploadClient()

        await uploadClient.uploadFile(fullPath, file.buffer)

        if (isLocalStorageMode) {
            const baseCdnUrl = config.CDN_URL || 'http://cdn.poveroh.local'
            return new URL(fullPath, baseCdnUrl).toString()
        }

        return fullPath
    }
}
