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

    HasAccess: (authorizedResourceId: string) => Promise<HasAccessToResourceResponse> = async (authorizedResourceId: string) => {
        var response = await this.authorizedResourcesAxiosClient.post(`/HasAccess/${authorizedResourceId}`);
        return response.data;
    };
}