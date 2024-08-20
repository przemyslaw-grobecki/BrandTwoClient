import { Device } from "./Device";
import { DeviceOption } from "./DeviceOption";

export interface IDevicesApi {
    GetDevices : () => Promise<Device[]>;
    GetDevice : (deviceId: string) => Promise<Device>;
    GetDeviceOptions: (deviceId: string) => Promise<DeviceOption[]>;
    GetPmtModuleIdentification: (deviceId: string, cardIdentity: number, cardNumber: number) => Promise<string>;
}