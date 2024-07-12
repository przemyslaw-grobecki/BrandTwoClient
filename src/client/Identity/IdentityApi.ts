import axios from "axios";
import { IAuthenticationApi } from "./IAuthenticationApi";

export class IdentityApi {
    route: string;
    
    constructor(basePath: string){
        this.route = basePath;
    }

    UseToken: (token: string) => Promise<void> = async (token: string) => {};

    UseTokenWithCookies: (token: string) => Promise<void> = async (token: string) => {};

}