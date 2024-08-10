import axios, { AxiosInstance } from "axios";
import { IUsersApi } from "./IUsersApi";
import { User } from "./User";
import { BrandClientTokenInfo } from "client/BrandClientConnectionInfo";

export class UsersApi implements IUsersApi {
    usersAxiosClient: AxiosInstance;

    constructor(basePath: string, brandClientTokenInfo: BrandClientTokenInfo){
        this.usersAxiosClient = axios.create({
            baseURL: basePath + '/users',
            headers: {
                'Authorization': `Bearer ${brandClientTokenInfo.token}`
            }
        });
    }

    GetUsers: () => Promise<User[]> = async () => {
        var response = await this.usersAxiosClient.get('');
        return response.data;
    };
}
