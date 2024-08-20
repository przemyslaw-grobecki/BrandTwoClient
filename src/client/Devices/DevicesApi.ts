import axios, { AxiosInstance } from "axios";
import { IDevicesApi } from "./IDevicesApi";
import { Device } from "./Device";
import { BrandClientTokenInfo } from "client/BrandClientConnectionInfo";
import { DeviceOption } from "./DeviceOption";

export class DevicesApi implements IDevicesApi {
    devicesAxiosClient: AxiosInstance;

    constructor(basePath: string, brandClientTokenInfo: BrandClientTokenInfo){
        this.devicesAxiosClient = axios.create({
            baseURL: basePath + '/devices',
            headers: {
                'Authorization': `Bearer ${brandClientTokenInfo.token}`
            }
        });
    }

    GetDevices: () => Promise<Device[]> = async () => {
        var response = await this.devicesAxiosClient.get('');
        var devices = response.data;
        return devices;
    };

    GetDevice: (deviceId: string) => Promise<Device> = async (deviceId: string) => {
        var response = await this.devicesAxiosClient.get(`/${deviceId}`);
        return response.data;
    };

    GetPmtModuleIdentification: (deviceId: string, cardIdentity: number, cardNumber: number) => Promise<string> = async (deviceId: string, cardIdentity: number, cardNumber: number) => {
        var response = await this.devicesAxiosClient.get(`/${deviceId}` + '/pmt/idn');
        return response.data;
    };

    GetDeviceOptions: (deviceId: string) => Promise<DeviceOption[]> = async (deviceId: string) => {
        var response = await this.devicesAxiosClient.get(`/${deviceId}` + '/options');
        return response.data;
    }
}