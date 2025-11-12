import path from 'path'
import config from '../utils/environment'
import { isLocalStorageMode, uploadClient } from '../utils/storage'

export const MediaHelper = {
    async handleUpload(file: Express.Multer.File, filePath: string): Promise<string> {
        filePath = path.join(filePath, file.originalname)

        await uploadClient.uploadFile(filePath, file.buffer)

        if (isLocalStorageMode) {
            const baseCdnUrl = 'http://cdn.poveroh.local'
            return new URL(filePath, baseCdnUrl).toString()
        }

        return filePath
    }
}
