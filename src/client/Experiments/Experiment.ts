export type Experiment = {
    id: string,
    deviceIds: string[],
    acquisitionMode: string,
    acquisitionConfigurationId?: string | undefined,
    createdAt: Date,
    startedAt: Date | undefined,
    endedAt: Date | undefined,
    archivedAt: Date | undefined
};
