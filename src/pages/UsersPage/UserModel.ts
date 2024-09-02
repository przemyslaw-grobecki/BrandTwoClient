import { Role } from "client/Identity/Role";

export type UserModel = {
    id: string;
    userName: string;
    email: string;
    roles: Role[];
    authorizedResourcesIds: string[]
}
