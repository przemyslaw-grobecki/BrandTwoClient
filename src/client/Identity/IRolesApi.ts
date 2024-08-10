import { Role } from "./Role";

export interface IRolesApi {
    GetUserRoles : (userId: string) => Promise<Role[]> 
}
