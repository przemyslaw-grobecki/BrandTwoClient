import { IDevicesApi } from "client/Devices/IDevicesApi";
import { DevicesApi } from "client/Devices/DevicesApi";
import { BrandClientTokenInfo } from "client/BrandClientConnectionInfo";
import { IAuthenticationApi } from "client/Identity/IAuthenticationApi";
import axios, { AxiosRequestConfig } from "axios";
import moment from "moment";


export class BrandClient implements IAuthenticationApi {
  private gatewayPath: string;
  private tokenInfo: BrandClientTokenInfo | undefined;
  private clientConfig: AxiosRequestConfig = {
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      // "Access-Control-Allow-Origin": "*"
    },
  };
  constructor(gatewayPath: string) {
    this.gatewayPath = gatewayPath;
  }

  ///
  /// Authentication
  ///
  Login: (
    email: string,
    password: string,
    useCookies?: boolean
  ) => Promise<void> = async (
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
      this.tokenInfo = {
        type: response.data.type,
        token: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        expirationTime: moment().add(response.data.expiresIn, 'seconds').toISOString()
      };
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

  public getDevicesApi: () => IDevicesApi = () => {
    return new DevicesApi(this.gatewayPath);
  };

  // public getIdentityApi : () => IIdentityApi = () => {
  //     return new IdentityApi(this.gatewayPath);
  // }
}
