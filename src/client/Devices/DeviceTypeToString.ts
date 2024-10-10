export const deviceTypeToString = (deviceType: number) => {
    const deviceTypes: Record<number, string> = {
        0: "Trigger Tracking Sensor Module",
        1: "Pressure Sensor",
        2: "Mock Device",
        3: "Vacuum Sensor Module",
        7: "Ethernet",
        99: "Not yet selected"
    }

    return deviceTypes[deviceType] || "Unknown";
}
