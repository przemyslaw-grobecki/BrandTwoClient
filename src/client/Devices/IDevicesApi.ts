import { Device } from "./Device";
import { DeviceConnectionInformation } from "./DeviceConnectionInformation";

export interface IDevicesApi {
    GetDevices : () => Promise<Device[]>;
    GetDevice : (deviceId: string) => Promise<Device>;
    GetDeviceConnectionInformations: (deviceId: string) => Promise<DeviceConnectionInformation[]>;
    GetPmtModuleIdentification: (deviceId: string, cardIdentity: number, cardNumber: number) => Promise<string>;
}