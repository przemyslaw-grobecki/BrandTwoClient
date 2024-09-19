export type StorageItem = {
    id: string;
    sessionId: string;
    name: string;
    value: string;
    type: string;
    timestamp: string;
    creatorId?: string | undefined
};
