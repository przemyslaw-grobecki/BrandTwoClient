import { AcquisitionConfiguration } from "./AcquisitionConfiguration";
import { AcquisitionConfigurationPatch } from "./AcquisitionConfigurationPatch";
import { StorageItem } from "./StorageItem";

export interface IAcquisitonApi {
    GetAcquisitionConfigurations : () => Promise<AcquisitionConfiguration[]>;
    AddAcquisitionConfiguration: (configurationName: string) => Promise<AcquisitionConfiguration>;
    EditAcquisitionConfiguration: (configurationId: string, patch: AcquisitionConfigurationPatch) => Promise<AcquisitionConfiguration>;
    StartDeviceDataStoring: (experimentId: string, subscriptionTopic: string) => Promise<void>;
    StopDeviceDataStoring: (configurationId: string, subscriptionTopic: string) => Promise<string>;
    GetStoredDataForSession: (sessionId: string) => Promise<StorageItem[]>;
    DownloadStoredData: (experimentId: string, configurationId: string) => Promise<Blob>;
}