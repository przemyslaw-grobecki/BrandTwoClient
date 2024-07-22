import { IDevicesApi } from "client/Devices/IDevicesApi";
import { DevicesApi } from "client/Devices/DevicesApi";
import { BrandClientTokenInfo } from "client/BrandClientConnectionInfo";
import { IAuthenticationApi } from "client/Identity/IAuthenticationApi";
import axios, { AxiosRequestConfig } from "axios";
import moment from "moment";


export class BrandClient implements IAuthenticationApi {
  private readonly gatewayPath: string;
  private readonly clientConfig: AxiosRequestConfig = {
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      // "Access-Control-Allow-Origin": "*"
    },
  };
  constructor(gatewayPath: string) {
    this.gatewayPath = gatewayPath;
  }

  IsClientAuthenticated: (connectionInfo: BrandClientTokenInfo | undefined) => boolean = (connectionInfo: BrandClientTokenInfo | undefined) => {
    return connectionInfo?.token !== undefined;
  };

  ///
  /// Authentication
  ///
  Login: (
    email: string,
    password: string,
    useCookies?: boolean
  ) => Promise<BrandClientTokenInfo | undefined> = async (
    email: string,
    password: string,
    useCookies: boolean = false
  ) => {
    try {
      const url = this.gatewayPath + "/identity/login" + (useCookies ? "/useCookies=true" : "");
      var response = await axios.post(
        url,
        {
          email: email,
          password: password,
        },
        this.clientConfig
      );
      const tokenInfo = {
        tokenType: response.data.tokenType,
        token: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        expirationTime: moment().add(response.data.expiresIn, 'seconds').toISOString()
      } as BrandClientTokenInfo;
      return tokenInfo;
    } catch (error) {
      console.log(error);
    }
  };

  Register: (email: string, password: string) => Promise<void> = async (
    email: string,
    password: string
  ) => {
    var response = await axios.post(this.gatewayPath + "/register", {
      email: email,
      password: password,
    });
    console.log(response);
  };

  public getDevicesApi: (brandClientTokenInfo: BrandClientTokenInfo) => IDevicesApi = (brandClientTokenInfo: BrandClientTokenInfo) => {
    return new DevicesApi(this.gatewayPath, brandClientTokenInfo);
  };

  // public getIdentityApi : () => IIdentityApi = () => {
  //     return new IdentityApi(this.gatewayPath);
  // }
}
