import axios, { AxiosInstance } from "axios";
import { IDevicesApi } from "./IDevicesApi";
import { Device } from "./Device";
import { BrandClientTokenInfo } from "client/BrandClientConnectionInfo";
import { DeviceOption } from "./DeviceOption";
import { DeviceCommand } from "./DeviceCommand";
import { NewOptionValue } from "./NewOptionValue";

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

    RenameDevice: (deviceId: string, newDeviceName: string) => Promise<Device> = async (deviceId: string, newDeviceName: string) => {
        var response = await this.devicesAxiosClient.post(`/${deviceId}` + '/Rename', { newDeviceName: newDeviceName });
        return response.data
    };

    SetDeviceType: (deviceId: string, deviceType: number) => Promise<Device> = async (deviceId: string, deviceType: number) => {
        var response = await this.devicesAxiosClient.post(`/${deviceId}` + '/SetDeviceType', { DeviceType: deviceType });
        return response.data;
    };

    GetDevices: () => Promise<Device[]> = async () => {
        var response = await this.devicesAxiosClient.get('');
        var devices = response.data;
        return devices;
    };

    GetDevice: (deviceId: string) => Promise<Device> = async (deviceId: string) => {
        var response = await this.devicesAxiosClient.get(`/${deviceId}`);
        return response.data;
    };

    GetDeviceOptions: (deviceId: string) => Promise<DeviceOption[]> = async (deviceId: string) => {
        var response = await this.devicesAxiosClient.get(`/${deviceId}` + '/Options');
        return response.data.options;
    };
    
    GetDeviceCommands: (deviceId: string) => Promise<DeviceCommand[]> = async (deviceId: string) => {
        var response = await this.devicesAxiosClient.get(`/${deviceId}` + '/Commands');
        return response.data.commands;
    };
    
    RunDeviceCommand: (deviceId: string, commandId: string) => Promise<void> = async (deviceId: string, commandId: string) => {
        var _ = await this.devicesAxiosClient.post(`/${deviceId}/Commands/${commandId}/Run`);
    };

    RefreshDeviceOptions: (deviceId: string) => Promise<DeviceOption[]> = async (deviceId: string) => {
        var response = await this.devicesAxiosClient.post(`/${deviceId}/Options/Refresh`);
        return response.data.options;
    };
    
    EditDeviceOptions: (deviceId: string, newOptionValues: { [key: string]: string; }) => Promise<DeviceOption[]> = async (deviceId: string, newOptionsValues: { [key: string]: string; }) => {
        var response = await this.devicesAxiosClient.patch(`/${deviceId}/Options/Edit`, { newOptionsValues: newOptionsValues }, { headers: { 'Content-Type': 'application/json' } });
        return response.data.options;
    };
}
