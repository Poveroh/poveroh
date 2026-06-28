export interface JobMap {
    'snapshot.generate': {
        userId: string
        snapshotDate: string
    }
    'snapshot.generate-due': {
        date?: string
    }
    'import.parse-csv': {
        userId: string
        importId: string
        fileIds: string[]
    }
    'market.sync': {
        userId: string
        assetId: string
    }
}

export type JobName = keyof JobMap

export type JobHandler<TJobName extends JobName> = (payload: JobMap[TJobName]) => Promise<void>

export type JobHandlers = {
    [TJobName in JobName]?: JobHandler<TJobName>
}

export type BackoffOptions = {
    type: 'fixed' | 'exponential'
    delay: number
}

export type DispatchOptions = {
    attempts?: number
    delay?: number
    backoff?: BackoffOptions
    deduplicationId?: string
    removeOnComplete?: boolean | number
    removeOnFail?: boolean | number
}

export interface JobDispatcher {
    dispatch<TJobName extends JobName>(
        jobName: TJobName,
        payload: JobMap[TJobName],
        options?: DispatchOptions
    ): Promise<void>
    schedule<TJobName extends JobName>(
        jobName: TJobName,
        payload: JobMap[TJobName],
        cronPattern: string,
        schedulerId?: string
    ): Promise<void>
}
