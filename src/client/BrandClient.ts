import { IDevicesApi } from 'client/Devices/IDevicesApi';
import { DevicesApi } from 'client/Devices/DevicesApi';
import { BrandClientTokenInfo } from 'client/BrandClientConnectionInfo';
import { IAuthenticationApi } from 'client/Identity/IAuthenticationApi';
import axios from "axios";

export class BrandClient implements IAuthenticationApi {
    private gatewayPath: string;
    private tokenInfo: BrandClientTokenInfo | undefined;
    constructor(gatewayPath: string){
        this.gatewayPath = gatewayPath;
    }


    ///
    /// Authentication
    ///
    Login: (email: string, password: string, useCookies: boolean | undefined) => Promise<void> =
        async (email: string, password: string, useCookies: boolean | undefined = false) => {
        var response = await axios.post(this.gatewayPath + '/login' + useCookies ? '/useCookies=true' : '', {
            email: email,
            password: password
        });
        return response.data;
    };

    Register: (email: string, password: string) => Promise<void> = async (email: string, password: string) => {
        var response = await axios.post(this.gatewayPath + '/register', {
            email: email,
            password: password
        });
        return response.data;
    };


    public getDevicesApi : () => IDevicesApi = () => {
        return new DevicesApi(this.gatewayPath);
    }



    // public getIdentityApi : () => IIdentityApi = () => {
    //     return new IdentityApi(this.gatewayPath);
    // }
}