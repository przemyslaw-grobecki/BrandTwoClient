export const deviceTypeToString = (deviceType: number) => {
    const deviceTypes: Record<number, string> = {
        0: "Brand Device",
        1: "Pressure Sensor",
        2: "Mock Device",
        7: "Ethernet",
        99: "Not yet selected"
    }

    return deviceTypes[deviceType] || "Unknown";
}
