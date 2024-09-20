import { Device } from "./Device";
import { DeviceCommand } from "./DeviceCommand";
import { DeviceOption } from "./DeviceOption";
import { NewOptionValue } from "./NewOptionValue";

export interface IDevicesApi {
    GetDevices : () => Promise<Device[]>;
    GetDevice : (deviceId: string) => Promise<Device>;
    GetDeviceOptions: (deviceId: string) => Promise<DeviceOption[]>;
    GetDeviceCommands: (deviceId: string) => Promise<DeviceCommand[]>;
    SetDeviceType: (deviceId: string, deviceType: number) => Promise<Device>;
    RunDeviceCommand: (deviceId: string, commandId: string) => Promise<void>;
    RefreshDeviceOptions: (deviceId: string) => Promise<DeviceOption[]>;
    EditDeviceOptions: (deviceId: string, newOptionsValues: { [key: string]: string; }) => Promise<DeviceOption[]>;
}
