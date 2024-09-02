import axios, { AxiosInstance } from "axios";
import { HasAccessToResourceResponse } from "./HasAccessToResourceResponse";
import { IAuthorizedResourcesApi } from "./IAuthorizedResourcesApi";
import { BrandClientTokenInfo } from "client/BrandClientConnectionInfo";

export class AuthorizedResourcesApi implements IAuthorizedResourcesApi {
    authorizedResourcesAxiosClient: AxiosInstance;

    constructor(basePath: string, brandClientTokenInfo: BrandClientTokenInfo){
        this.authorizedResourcesAxiosClient = axios.create({
            baseURL: basePath + '/AuthorizedResources',
            headers: {
                'Authorization': `Bearer ${brandClientTokenInfo.token}`
            }
        });
    }

    GetAuthorizedResourcesForUser: (userId: string) => Promise<string[]> = async (userId: string) => {
        const response = await this.authorizedResourcesAxiosClient.get('/GetAuthorizedResourcesForUser/' + userId);
        return response.data;
    };

    SetAuthorizedResourcesForUser: (userId: string, resourceIds: string[]) => Promise<string[]> = async (userId: string, resourceIds: string[]) => {
        const response = await this.authorizedResourcesAxiosClient.post('/SetAuthorizedResourcesForUser/' + userId, resourceIds);
        return response.data;
    };

    HasAccess: (authorizedResourceId: string) => Promise<HasAccessToResourceResponse> = async (authorizedResourceId: string) => {
        var response = await this.authorizedResourcesAxiosClient.post(`/HasAccess/${authorizedResourceId}`);
        return response.data;
    };
}