import { Experiment } from "./Experiment";

export interface IExperimentsApi {
    CreateExperiment : (deviceIds: string[], acquisitionMode: string | undefined) => Promise<Experiment>;
    DeleteExperiment : (experimentId: string) => Promise<void>;
    ArchiveExperiment : (experimentId: string) => Promise<Experiment>;
    StartExperiment : (experimentId: string, duration: number | undefined) => Promise<void>;
    StopExperiment : (experimentId: string) => Promise<void>;
}
