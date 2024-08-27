export type Experiment = {
    Id: string,
    DeviceIds: string[],
    AcquisitionMode: string,
    CreatedAt: Date,
    StartedAt: Date | undefined,
    EndedAt: Date | undefined,
    ArchivedAt: Date | undefined
};
