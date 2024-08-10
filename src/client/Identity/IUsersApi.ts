import { User } from "./User";

export interface IUsersApi {
    GetUsers : () => Promise<User[]>;
}
