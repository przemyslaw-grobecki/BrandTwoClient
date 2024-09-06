import { Experiment } from "./Experiment";

export interface IExperimentsApi {
    GetRelevantExperiments : () => Promise<Experiment[]>;
    GetArchivedExperiments : () => Promise<Experiment[]>;
    CreateExperiment : (deviceIds: string[], acquisitionMode: string | undefined, acquisitionConfigurationId: string | undefined) => Promise<Experiment>;
    DeleteExperiment : (experimentId: string) => Promise<void>;
    ArchiveExperiment : (experimentId: string) => Promise<Experiment>;
    StartExperiment : (experimentId: string, duration: number | undefined) => Promise<void>;
    StopExperiment : (experimentId: string) => Promise<void>;
}
