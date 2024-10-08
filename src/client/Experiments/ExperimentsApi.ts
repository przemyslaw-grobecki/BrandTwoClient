import axios, { AxiosInstance } from "axios";
import { Experiment } from "./Experiment";
import { IExperimentsApi } from "./IExperimentsApi";
import { BrandClientTokenInfo } from "client/BrandClientConnectionInfo";

export class ExperimentsApi implements IExperimentsApi {
    experimentsAxiosClient: AxiosInstance;

    constructor(basePath: string, brandClientTokenInfo: BrandClientTokenInfo){
        this.experimentsAxiosClient = axios.create({
            baseURL: basePath + '/experiments',
            headers: {
                'Authorization': `Bearer ${brandClientTokenInfo.token}`
            }
        });
    }
    
    GetRelevantExperiments: () => Promise<Experiment[]> = async () => {
        const response = await this.experimentsAxiosClient.get('');
        return response.data;
    };
    
    GetArchivedExperiments: () => Promise<Experiment[]> = async () => {
        const response = await this.experimentsAxiosClient.get('/archived');
        return response.data;
    };
    
    CreateExperiment: (deviceIds: string[], acquisitionMode: string | undefined, acquisitionConfigurationId: string | undefined) => Promise<Experiment> = async (deviceIds: string[], acquisitionMode: string | undefined, acquisitionConfigurationId: string | undefined) => {
        const response = await this.experimentsAxiosClient.post('', {
            deviceIds: deviceIds,
            acquisitionMode: acquisitionMode,
            acquisitionConfigurationId: acquisitionConfigurationId
        });
        const experiment = response.data;
        return experiment;
    };

    DeleteExperiment: (experimentId: string) => Promise<void> = async (experimentId: string) => {
        await this.experimentsAxiosClient.delete(experimentId);
    };

    ArchiveExperiment: (experimentId: string) => Promise<Experiment> = async (experimentId: string) => {
        var response = await this.experimentsAxiosClient.post(experimentId + '/Archive');
        return response.data;
    };

    StartExperiment: (experimentId: string, duration?: number | undefined) => Promise<Experiment> = async (experimentId: string, duration?: number | undefined) => {
        var response = await this.experimentsAxiosClient.post(experimentId + '/Start', {
            duration: duration
        });
        return response.data;
    };

    StopExperiment: (experimentId: string) => Promise<Experiment> = async (experimentId: string) => {
        var response = await this.experimentsAxiosClient.post(experimentId + '/Stop');
        return response.data;
    };
    
}