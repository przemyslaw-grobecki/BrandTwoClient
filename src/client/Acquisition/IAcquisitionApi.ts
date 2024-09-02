import { AcquisitionConfiguration } from "./AcquisitionConfiguration";
import { AcquisitionConfigurationPatch } from "./AcquisitionConfigurationPatch";

export interface IAcquisitonApi {
    GetAcquisitionConfigurations : () => Promise<AcquisitionConfiguration[]>;
    AddAcquisitionConfiguration: (configurationName: string) => Promise<AcquisitionConfiguration>;
    EditAcquisitionConfiguration: (configurationId: string, patch: AcquisitionConfigurationPatch) => Promise<AcquisitionConfiguration>;
}