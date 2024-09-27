export type AcquisitionConfigurationPatch = {
    name: string | undefined;
    maxOutputFileSize: number | undefined;
    outputDirectory: string | undefined;
    outputMode: number | undefined;
    windWidth: number | undefined;
    windOffset: number | undefined;
    windExtSearchMarg: number | undefined;
    windRejMarg: number | undefined;
    windWidth2: number | undefined;
    windOffset2: number | undefined;
    windExtSearchMarg2: number | undefined;
    windRejMarg2: number | undefined;
    almostFullLevel: number | undefined;
    irqWait: number | undefined;
    eveAlignMode: boolean | undefined;
    period: number | undefined;
    timeDelay: number | undefined;
    opticalBridgeTriggerControl: boolean | undefined;
    flipperPeriod: number | undefined;
    twoDC: boolean | undefined;
    threeDC: boolean | undefined;
}
