import config from '@/utils/environment'
import { getUploadClient, isLocalStorageMode } from '@/utils/storage'
import path from 'path/win32'

/**
 * MediaService provides functionality for handling file uploads and managing media storage.
 */
export class MediaService {
    private readonly baseUrl: string
    private readonly baseCdnUrl = config.CDN_URL || 'http://cdn.poveroh.local'
    private readonly uploadClient = getUploadClient()
    /**
     * Constructs a new instance of the MediaService class, initializing it with a specific location identifier.
     * @param location An optional string parameter that specifies the location or category for organizing files in the media storage.
     */
    constructor(
        private readonly userId: string,
        private readonly location: string = 'unknown'
    ) {
        this.baseUrl = path.join(this.userId, this.location)
    }

    /**
     * Saves an uploaded file under the current user and service location so entity media stays grouped consistently.
     * @param entityId The identifier of the entity to which the file belongs.
     * @param file The file object received from an Express Multer upload, containing the file data and metadata.
     * @returns A promise that resolves to the URL or identifier of the uploaded file in the media storage.
     */
    async saveFile(entityId: string, file: Express.Multer.File): Promise<string> {
        return this.handleUpload(file, path.join(this.baseUrl, entityId))
    }

    /**
     * Handles the upload of a file to the media storage, constructing the file path based on the provided location and user context.
     * @param file The file object received from an Express Multer upload, containing the file data and metadata.
     * @param filePath The base file path to which the file should be uploaded, typically constructed based on the current user's ID, service location, and any relevant identifiers.
     * @returns A promise that resolves to the URL or identifier of the uploaded file in the media storage.
     */
    private async handleUpload(file: Express.Multer.File, filePath: string): Promise<string> {
        filePath = path.join(filePath, file.originalname)

        await this.uploadClient.uploadFile(filePath, file.buffer)

        if (isLocalStorageMode) {
            return new URL(filePath, this.baseCdnUrl).toString()
        }

        return filePath
    }
}
