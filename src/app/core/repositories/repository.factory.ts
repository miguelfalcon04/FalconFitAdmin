import { FactoryProvider, InjectionToken } from "@angular/core";
import { Machine } from "../models/machine.model";
import { AUTH_MAPPING_TOKEN, AUTH_ME_API_URL_TOKEN, AUTH_SIGN_IN_API_URL_TOKEN, AUTH_SIGN_UP_API_URL_TOKEN, BACKEND_TOKEN, MACHINE_API_URL_TOKEN, MACHINE_REPOSITORY_MAPPING_TOKEN, MACHINE_REPOSITORY_TOKEN, MACHINE_RESOURCE_NAME_TOKEN, USERFF_API_URL_TOKEN, USERFF_REPOSITORY_MAPPING_TOKEN, USERFF_REPOSITORY_TOKEN, USERFF_RESOURCE_NAME_TOKEN } from "./repository.tokens";
import { IAuthMapping } from "../services/interfaces/auth-mapping.interface";
import { HttpClient } from "@angular/common/http";
import { Model } from "../models/base.model";
import { IBaseMapping } from "./interfaces/base-mapping.interface";
import { IBaseRepository } from "./interfaces/base-repository.interface";
import { MachineMappingStrapi } from "./impl/machine-mapping-strapi.service";
import { BaseRepositoryLocalStorageService } from "./impl/base-repository-local-storage.service";
import { IStrapiAuthentication } from "../services/interfaces/strapi-authentication.interface";
import { StrapiRepositoryService } from "./impl/strapi-repository.service";
import { MachineLocalStorageMapping } from "./impl/machine-mapping-local-storage.service";
import { BaseAuthenticationService } from "../services/impl/base-authentication.service";
import { StrapiAuthenticationService } from "../services/impl/strapi-authentication.service";
import { StrapiAuthMappingService } from "../services/impl/strapi-auth-mapping.service";
import { Userff } from "../models/userff.model";
import { UserffMappingStrapi } from "./impl/userff-mapping-strapi.service";

export function createBaseRepositoryFactory<T extends Model>(
  token: InjectionToken<IBaseRepository<T>>,
  dependencies:any[]): FactoryProvider {
  return {
    provide: token,
    useFactory: (backend: string, http: HttpClient, auth:IStrapiAuthentication, apiURL: string, resource: string, mapping: IBaseMapping<T>) => {
      switch (backend) {
        // case 'http':
        //   return new BaseRepositoryHttpService<T>(http, auth, apiURL, resource, mapping);
        case 'local-storage':
          return new BaseRepositoryLocalStorageService<T>(resource, mapping);
        case 'strapi':
          return new StrapiRepositoryService<T>(http, auth, apiURL, resource, mapping);
        default:
          throw new Error("BACKEND NOT IMPLEMENTED");
      }
    },
    deps: dependencies
  };
};

export function createBaseMappingFactory<T extends Model>(
  token: InjectionToken<IBaseMapping<T>>,
  dependencies: any[],
  modelType: 'machine' | 'userff'
): FactoryProvider {
  return {
    provide: token,
    useFactory: (backend: string) => {
      switch (backend) {
        case 'local-storage':
          return modelType === 'machine'
            ? new MachineLocalStorageMapping()
            : null;
        case 'strapi':
          return modelType === 'machine'
            ? new MachineMappingStrapi()
            : new UserffMappingStrapi();
        default:
          throw new Error("BACKEND NOT IMPLEMENTED");
      }
    },
    deps: dependencies
  };
};

export function createBaseAuthMappingFactory(token: InjectionToken<IAuthMapping>, dependencies:any[]): FactoryProvider {
  return {
    provide: token,
    useFactory: (backend: string) => {
      switch (backend) {
        case 'http':
          throw new Error("BACKEND NOT IMPLEMENTED");
        case 'local-storage':
          throw new Error("BACKEND NOT IMPLEMENTED");
        case 'json-server':
          throw new Error("BACKEND NOT IMPLEMENTED");
        case 'strapi':
          return new StrapiAuthMappingService();
        default:
          throw new Error("BACKEND NOT IMPLEMENTED");
      }
    },
    deps: dependencies
  };
};

export const MachineMappingFactory = createBaseMappingFactory<Machine>(
  MACHINE_REPOSITORY_MAPPING_TOKEN,
  [BACKEND_TOKEN],
  'machine'
);

export const UserffMappingFactory = createBaseMappingFactory<Userff>(
  USERFF_REPOSITORY_MAPPING_TOKEN,
  [BACKEND_TOKEN],
  'userff'
);


export const AuthenticationServiceFactory:FactoryProvider = {
  provide: BaseAuthenticationService,
  useFactory: (backend:string, signIn:string, signUp:string, meUrl:string, mapping:IAuthMapping, http:HttpClient) => {
    switch(backend){
      case 'http':
        throw new Error("BACKEND NOT IMPLEMENTED");
      case 'local-storage':
        throw new Error("BACKEND NOT IMPLEMENTED");
      case 'json-server':
        throw new Error("BACKEND NOT IMPLEMENTED");
      case 'strapi':
        return new StrapiAuthenticationService(signIn, signUp, meUrl, mapping, http);
      default:
        throw new Error("BACKEND NOT IMPLEMENTED");
    }

  },
  deps: [BACKEND_TOKEN, AUTH_SIGN_IN_API_URL_TOKEN, AUTH_SIGN_UP_API_URL_TOKEN, AUTH_ME_API_URL_TOKEN, AUTH_MAPPING_TOKEN, HttpClient]
};

export const AuthMappingFactory: FactoryProvider = createBaseAuthMappingFactory(AUTH_MAPPING_TOKEN, [BACKEND_TOKEN]);

export const MachineRepositoryFactory: FactoryProvider = createBaseRepositoryFactory<Machine>(MACHINE_REPOSITORY_TOKEN,
  [BACKEND_TOKEN, HttpClient, BaseAuthenticationService, MACHINE_API_URL_TOKEN, MACHINE_RESOURCE_NAME_TOKEN, MACHINE_REPOSITORY_MAPPING_TOKEN]
);

export const UserffRepositoryFactory: FactoryProvider = createBaseRepositoryFactory<Userff>(USERFF_REPOSITORY_TOKEN,
  [BACKEND_TOKEN, HttpClient, BaseAuthenticationService, USERFF_API_URL_TOKEN, USERFF_RESOURCE_NAME_TOKEN, USERFF_REPOSITORY_MAPPING_TOKEN]
);
