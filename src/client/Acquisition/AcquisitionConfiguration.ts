export type AcquisitionConfiguration = {
    id: string;
    name: string;
    outputDirectory: string;
    outputMode: number;
    windWidth: number;
    windOffset: number;
    windExtSearchMarg: number;
    windRejMarg: number;
    windWidth2: number;
    windOffset2: number;
    windExtSearchMarg2: number;
    windRejMarg2: number;
    almostFullLevel: number;
    irqWait: number;
    eveAlignMode: boolean;
    period: number;
    timeDelay: number;
    opticalBridgeTriggerControl: boolean;
    flipperPeriod: number;
    twoDC: boolean;
    threeDC: boolean;
}
