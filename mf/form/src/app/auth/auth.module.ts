import { NgModule } from '@angular/core';
import { AuthModule as OidcAuthModule, StsConfigLoader, StsConfigStaticLoader } from 'angular-auth-oidc-client';
import { authConfig } from './auth.config';

export function authFactory(): StsConfigLoader {
  return new StsConfigStaticLoader(authConfig);
}

@NgModule({
  imports: [
    OidcAuthModule.forRoot({
      loader: {
        provide: StsConfigLoader,
        useFactory: authFactory
      }
    })
  ],
  exports: [OidcAuthModule]
})
export class AuthConfigModule { } 