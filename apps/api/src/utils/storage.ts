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

export const uploadClient = new BeyCloud(storageMode, readConfig())
