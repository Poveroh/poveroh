import config from '@/utils/environment'
import { getUploadClient, isLocalStorageMode, toFileBuffer } from '@/utils/storage'
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
     * Reads back a file previously stored by `saveFile`, so work deferred to a background job can
     * re-read the upload that triggered it instead of depending on the request that carried it.
     * @param pathOrUrl The value stored alongside the entity, which is a CDN URL in local storage mode and a storage key otherwise.
     * @returns A promise that resolves to the file contents.
     */
    async readFile(pathOrUrl: string): Promise<Buffer> {
        const downloaded = await this.uploadClient.downloadFile(MediaService.toStorageKey(pathOrUrl))
        return toFileBuffer(downloaded)
    }

    /**
     * Turns whatever was stored for a file back into the key the storage client expects, since
     * local storage mode records a CDN URL while every other provider records the key itself.
     * @param pathOrUrl The stored file reference.
     * @returns The storage key to read the file with.
     */
    private static toStorageKey(pathOrUrl: string): string {
        if (!/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl

        return decodeURIComponent(new URL(pathOrUrl).pathname).replace(/^\/+/, '')
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
