import { Role } from "./Role";

export interface IRolesApi {
    GetUserRoles : (userId: string) => Promise<Role[]>;
    EditUserRoles : (userId: string, newRoles: Role[]) => Promise<Role[]>;
}
