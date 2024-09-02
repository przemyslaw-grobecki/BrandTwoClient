import { HasAccessToResourceResponse } from "./HasAccessToResourceResponse";

export interface IAuthorizedResourcesApi {
    HasAccess : (authorizedResourceId: string) => Promise<HasAccessToResourceResponse>;
    SetAuthorizedResourcesForUser : (userId: string, authorizedResourseIds: string[]) => Promise<string[]>;
    GetAuthorizedResourcesForUser : (userId: string) => Promise<string[]>;
}
