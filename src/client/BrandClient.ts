import { IDevicesApi } from "client/Devices/IDevicesApi";
import { DevicesApi } from "client/Devices/DevicesApi";
import { BrandClientTokenInfo } from "client/BrandClientConnectionInfo";
import { IAuthenticationApi } from "client/Identity/IAuthenticationApi";
import axios, { AxiosRequestConfig } from "axios";
import moment from "moment";
import { AuthorizedResourcesApi } from "./AuthorizedResources/AuthorizedResourcesApi";
import { IAuthorizedResourcesApi } from "./AuthorizedResources/IAuthorizedResourcesApi";
import { IUsersApi } from "./Identity/IUsersApi";
import { UsersApi } from "./Identity/UsersApi";
import { IRolesApi } from "./Identity/IRolesApi";
import { RolesApi } from "./Identity/RolesApi";
import { ExperimentsApi } from "./Experiments/ExperimentsApi";
import { IExperimentsApi } from "./Experiments/IExperimentsApi";
import { IAcquisitonApi } from "./Acquisition/IAcquisitionApi";
import { AcquisitionApi } from "./Acquisition/AcquisitionApi";


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

  public getAuthorizedResourcesApi: (brandClientTokenInfo: BrandClientTokenInfo) => IAuthorizedResourcesApi = (brandClientTokenInfo: BrandClientTokenInfo) => {
    return new AuthorizedResourcesApi(this.gatewayPath, brandClientTokenInfo);
  };

  public getUsersApi: (brandClientTokenInfo: BrandClientTokenInfo) => IUsersApi = (brandClientTokenInfo: BrandClientTokenInfo) => {
    return new UsersApi(this.gatewayPath, brandClientTokenInfo);
  };

  public getRolesApi: (brandClientTokenInfo: BrandClientTokenInfo) => IRolesApi = (brandClientTokenInfo: BrandClientTokenInfo) => {
    return new RolesApi(this.gatewayPath, brandClientTokenInfo);
  };

  public getExperimentsApi: (brandClientTokenInfo: BrandClientTokenInfo) => IExperimentsApi = (brandClientTokenInfo: BrandClientTokenInfo) => {
    return new ExperimentsApi(this.gatewayPath, brandClientTokenInfo);
  };

  public getAcquisitionApi: (brandClientTokenInfo: BrandClientTokenInfo) => IAcquisitonApi = (brandClientTokenInfo: BrandClientTokenInfo) => {
    return new AcquisitionApi(this.gatewayPath, brandClientTokenInfo);
  };
}
