export interface JobMap {
    'snapshot.generate': {
        userId: string
        snapshotDate: string
    }
    'snapshot.generate-due': {
        date?: string
    }
    'import.process': {
        userId: string
        importId: string
    }
    'market.sync': {
        userId: string
        assetId: string
    }
    'bank-sync.sync-due': {
        date?: string
    }
    'bank-sync.sync-connection': {
        userId: string
        connectionId: string
        trigger: 'CRON' | 'MANUAL' | 'WEBHOOK' | 'INITIAL'
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
