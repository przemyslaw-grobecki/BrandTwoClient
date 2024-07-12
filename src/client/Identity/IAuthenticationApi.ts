export interface IAuthenticationApi {
    Login: (email: string, password: string, useCookies: boolean | undefined) => Promise<void>;
    Register: (email: string, password: string) => Promise<void>;
}