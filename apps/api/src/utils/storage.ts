import { AwsConfig, AzureConfig, BeyCloud, ClientProvider, DigitalOceanConfig, GCSConfig, LocalConfig } from 'beycloud'

const storageMode = process.env.FILE_STORAGE_MODE as ClientProvider

export const isLocalStorageMode: boolean = storageMode == 'local'

function readConfig() {
    let config: LocalConfig | AwsConfig | GCSConfig | AzureConfig | DigitalOceanConfig

    switch (storageMode) {
        case 'local':
            config = {
                basePath: process.env.CDN_LOCAL_DATA_PATH as string
            }
            break
        case 'aws':
            config = {
                bucket: process.env.AWS_BUCKET as string,
                region: process.env.AWS_REGION as string,
                credentials: {
                    accessKeyId: process.env.AWS_CREDENTIALS_ACCESSKEYID as string,
                    secretAccessKey: process.env.AWS_CREDENTIALS_SECRETACCESSKEY as string
                }
            }
            break
        case 'gcloud':
            const keyBase64 = JSON.parse(Buffer.from(process.env.GCS_FILEACCOUNT as string, 'base64').toString('utf-8'))

            if (!keyBase64) {
                throw new Error('GOOGLE_CLOUD_KEY environment variable is not set')
            }

            config = {
                bucket: process.env.GCS_BUCKET as string,
                projectId: process.env.GCS_PROJECTID as string,
                credentials: keyBase64
            }
            break
        case 'azure':
            config = {
                connectionString: process.env.AZURE_CONNECTION_STRING as string,
                container: process.env.AZURE_CONTAINER as string
            }
            break
        case 'digitalocean':
            config = {
                bucket: process.env.DIGITALOCEAN_BUCKET as string,
                region: process.env.DIGITALOCEAN_REGION as string,
                endpoint: process.env.DIGITALOCEAN_ENDPOINT as string,
                forcePathStyle: false,
                credentials: {
                    accessKeyId: process.env.DIGITALOCEAN_CREDENTIALS_ACCESSKEYID as string,
                    secretAccessKey: process.env.DIGITALOCEAN_CREDENTIALS_SECRETACCESSKEY as string
                }
            }
            break
    }

    return config
}

let _uploadClient: BeyCloud | null = null

export function getUploadClient(): BeyCloud {
    if (!_uploadClient) {
        _uploadClient = new BeyCloud(storageMode, readConfig())
    }
    return _uploadClient
}

type DownloadedFile = Awaited<ReturnType<BeyCloud['downloadFile']>>

type ByteArrayBody = { transformToByteArray: () => Promise<Uint8Array> }

type StreamBody = { [Symbol.asyncIterator]: () => AsyncIterator<unknown> }

/**
 * Narrows an AWS SDK v3 body, which exposes the whole object as a byte array.
 * @param value The candidate body.
 * @returns Whether the body can be read through `transformToByteArray`.
 */
function isByteArrayBody(value: unknown): value is ByteArrayBody {
    return (
        typeof value === 'object' &&
        value !== null &&
        typeof (value as ByteArrayBody).transformToByteArray === 'function'
    )
}

/**
 * Narrows any async-iterable body, which covers Node readable streams.
 * @param value The candidate body.
 * @returns Whether the body can be consumed by iterating over its chunks.
 */
function isStreamBody(value: unknown): value is StreamBody {
    return typeof value === 'object' && value !== null && Symbol.asyncIterator in value
}

/**
 * Collapses whatever `downloadFile` returned into a Buffer, since each storage provider hands back
 * a different shape: a Buffer for local storage, a byte-array body on AWS, a readable stream on
 * Azure and GCS.
 * @param downloaded The value returned by the storage client.
 * @returns A promise that resolves to the file contents.
 */
export async function toFileBuffer(downloaded: DownloadedFile): Promise<Buffer> {
    if (Buffer.isBuffer(downloaded)) return downloaded

    const body: unknown =
        'Body' in downloaded
            ? downloaded.Body
            : 'readableStreamBody' in downloaded
              ? downloaded.readableStreamBody
              : undefined

    if (Buffer.isBuffer(body)) return body

    if (isByteArrayBody(body)) {
        return Buffer.from(await body.transformToByteArray())
    }

    if (isStreamBody(body)) {
        const chunks: Buffer[] = []
        for await (const chunk of body as AsyncIterable<Buffer | string>) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        }
        return Buffer.concat(chunks)
    }

    throw new Error('Unsupported download payload returned by the storage client')
}
