import { HasAccessToResourceResponse } from "./HasAccessToResourceResponse";

export interface IAuthorizedResourcesApi {
    HasAccess : (authorizedResourceId: string) => Promise<HasAccessToResourceResponse>;
}
