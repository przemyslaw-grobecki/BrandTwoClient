export const deviceTypeToString = (deviceType: number) => {
    const deviceTypes: Record<number, string> = {
        0: "Trigger",
        1: "PMT",
        2: "Converter",
        7: "Ethernet"
    }

    return deviceTypes[deviceType] || "Unknown";
}
