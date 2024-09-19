import axios, { AxiosInstance } from "axios";
import { IAcquisitonApi } from "./IAcquisitionApi";
import { AcquisitionConfiguration } from "./AcquisitionConfiguration";
import { BrandClientTokenInfo } from "client/BrandClientConnectionInfo";
import { AcquisitionConfigurationPatch } from "./AcquisitionConfigurationPatch";
import { StorageItem } from "./StorageItem";

export class AcquisitionApi implements IAcquisitonApi {
    acquisitionAxiosClient: AxiosInstance;

    constructor(basePath: string, brandClientTokenInfo: BrandClientTokenInfo){
        this.acquisitionAxiosClient = axios.create({
            baseURL: basePath + '/acquisition',
            headers: {
                'Authorization': `Bearer ${brandClientTokenInfo.token}`
            }
        });
    }
    
    StartDeviceDataStoring: (experimentId: string, subscriptionTopic: string) => Promise<void> = async (experimentId: string, subscriptionTopic: string) => {
        var _ = await this.acquisitionAxiosClient.post('StartDeviceDataStoring', {
            experimentId: experimentId,
            subscriptionTopic: subscriptionTopic
        });
    };
    
    StopDeviceDataStoring: (configurationId: string, subscriptionTopic: string) => Promise<string> = async (configurationId: string, subscriptionTopic: string) => {
        var response = await this.acquisitionAxiosClient.post('StopDeviceDataStoring', {
            configurationId: configurationId,
            subscriptionTopic: subscriptionTopic
        });
        return response.data;
    };
    
    GetStoredDataForSession: (sessionId: string) => Promise<StorageItem[]> = async (sessionId: string) => {
        var response = await this.acquisitionAxiosClient.get(`storage/GetItemsStoredDuringSession/${sessionId}`);
        return response.data;
    };

    AddAcquisitionConfiguration: (configurationName: string) => Promise<AcquisitionConfiguration> = async (configurationName: string) => {
        var response = await this.acquisitionAxiosClient.post('configurations', { name: configurationName });
        return response.data;
    };

    EditAcquisitionConfiguration: (configurationId: string, patch: AcquisitionConfigurationPatch) => Promise<AcquisitionConfiguration> = async (configurationId: string, patch: AcquisitionConfigurationPatch) => {
        var response = await this.acquisitionAxiosClient.patch('configurations' + '/' + configurationId, patch);
        return response.data;
    };
    
    GetAcquisitionConfigurations: () => Promise<AcquisitionConfiguration[]> = async () => {
        var response = await this.acquisitionAxiosClient.get('configurations');
        return response.data;
    };
}
