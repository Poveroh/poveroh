import config from '@/utils/environment'
import { getUploadClient, isLocalStorageMode } from '@/utils/storage'
import path from 'path/win32'

/**
 * MediaService provides functionality for handling file uploads and managing media storage. It includes methods for uploading files to a specified location in the media storage, associating files with the current user and service location, and generating URLs for accessing the stored files. By leveraging the MediaHelper and storage utilities, MediaService abstracts away the complexities of file handling and storage management, allowing developers to easily integrate media functionality into their services while ensuring that files are organized and accessible based on user context and service-specific locations.
 */
export class MediaService {
    private readonly baseUrl: string
    private readonly baseCdnUrl = config.CDN_URL || 'http://cdn.poveroh.local'
    private readonly uploadClient = getUploadClient()
    /**
     * Constructs a new instance of the MediaService class, initializing it with a specific location identifier. This location can be used to organize files in the media storage based on the service or module that is using the MediaService. By providing a location, developers can ensure that files are stored in a structured manner, making it easier to manage and retrieve them later. The constructor does not perform any additional initialization beyond setting the location, as the actual file handling and storage management is handled by the methods within the MediaService class.
     * @param location An optional string parameter that specifies the location or category for organizing files in the media storage. This can be used to differentiate files based on the service or module that is handling them, allowing for better organization and easier retrieval of files associated with specific parts of the application. If no location is provided, it defaults to 'unknown', which can be useful for catching any files that are not properly categorized.
     */
    constructor(
        private readonly userId: string,
        private readonly location: string = 'unknown'
    ) {
        this.baseUrl = path.join(this.userId, this.location)
    }

    /**
     * Saves an uploaded file under the current user and service location so entity media stays grouped consistently.
     */
    async saveFile(entityId: string, file: Express.Multer.File): Promise<string> {
        return this.handleUpload(file, path.join(this.baseUrl, entityId))
    }

    /**
     * Handles the upload of a file to the media storage, constructing the file path based on the provided location and user context. This method uses the MediaHelper and storage utilities to manage the file upload process, ensuring that files are stored in an organized manner and can be accessed via generated URLs. The method takes care of constructing the appropriate file path, uploading the file to the storage system, and returning a URL or identifier for accessing the stored file. By abstracting away the details of file handling and storage management, this method allows developers to focus on implementing business logic while still providing robust media functionality.
     * @param file The file object received from an Express Multer upload, containing the file data and metadata. This object is used to access the file's original name and buffer for uploading to the media storage. The method relies on the file's original name to construct the file path, ensuring that files are stored with meaningful names that can be easily identified and retrieved later. The file buffer is used to perform the actual upload to the storage system, allowing for efficient handling of file data without needing to write it to disk first.
     * @param filePath The base file path to which the file should be uploaded, typically constructed based on the current user's ID, service location, and any relevant identifiers. This path is used to organize files in the media storage, making it easier to manage and retrieve them later. The method appends the original file name to this base path to create the full file path for uploading, ensuring that files are stored in a structured manner that reflects their association with specific users and services.
     * @returns A promise that resolves to the URL or identifier of the uploaded file in the media storage, which can be used for future retrieval or reference. The returned value is generated based on the storage system being used, with local storage returning a URL constructed from the base CDN URL and the file path, while other storage systems may return a different identifier or URL format. This allows for flexibility in how files are accessed and referenced within the application, depending on the underlying storage implementation.
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
