export type Experiment = {
    id: string,
    deviceIds: string[],
    acquisitionMode: string,
    createdAt: Date,
    startedAt: Date | undefined,
    endedAt: Date | undefined,
    archivedAt: Date | undefined
};
