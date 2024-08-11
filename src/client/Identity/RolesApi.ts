import axios, { AxiosInstance } from "axios";
import { IRolesApi } from "./IRolesApi";
import { Role } from "./Role";
import { BrandClientTokenInfo } from "client/BrandClientConnectionInfo";

export class RolesApi implements IRolesApi {
    rolesAxiosClient: AxiosInstance;

    constructor(basePath: string, brandClientTokenInfo: BrandClientTokenInfo){
        this.rolesAxiosClient = axios.create({
            baseURL: basePath + '/roles',
            headers: {
                'Authorization': `Bearer ${brandClientTokenInfo.token}`
            }
        });
    }
    
    EditUserRoles: (userId: string, newRoles: Role[]) => Promise<Role[]> = async (userId: string, newRoles: Role[]) => {
        var response = await this.rolesAxiosClient.post(`/${userId}`, newRoles);
        return response.data;
    };

    GetUserRoles: (userId: string) => Promise<Role[]> = async (userId: string) => {
        var response = await this.rolesAxiosClient.get(`/${userId}`);
        return response.data;
    };
}
