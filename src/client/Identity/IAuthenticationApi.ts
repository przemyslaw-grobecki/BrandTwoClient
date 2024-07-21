import { BrandClientTokenInfo } from "client/BrandClientConnectionInfo";

export interface IAuthenticationApi {
    Login: (email: string, password: string, useCookies: boolean) => Promise<BrandClientTokenInfo | undefined>;
    Register: (email: string, password: string) => Promise<void>;
}