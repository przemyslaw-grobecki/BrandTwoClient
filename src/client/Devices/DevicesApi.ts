import axios from "axios";
import { IDevicesApi } from "./IDevicesApi";
import { Device } from "./Device";
import { DeviceConnectionInformation } from "./DeviceConnectionInformation";

export class DevicesApi implements IDevicesApi {
    route: string;
    
    constructor(basePath: string){
        this.route = basePath + '/devices';
    }

    GetDevices: () => Promise<Device[]> = async () => {
        var response = await axios.get(this.route);
        var devices = response.data;
        return devices;
    };

    GetDevice: (deviceId: string) => Promise<Device> = async (deviceId: string) => {
        var response = await axios.get(this.route + `/${deviceId}`);
        return response.data;
    };
    
    GetDeviceConnectionInformations: (deviceId: string) => Promise<DeviceConnectionInformation[]> = async (deviceId: string) => {
        var response = await axios.get(this.route + `/${deviceId}` + '/connection');
        return response.data;
    };

    GetPmtModuleIdentification: (deviceId: string, cardIdentity: number, cardNumber: number) => Promise<string> = async (deviceId: string, cardIdentity: number, cardNumber: number) => {
        var response = await axios.get(this.route + `/${deviceId}` + '/pmt/idn');
        return response.data;
    };
}