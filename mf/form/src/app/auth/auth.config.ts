import { OpenIdConfiguration } from 'angular-auth-oidc-client';

export const authConfig: OpenIdConfiguration = {
  authority: 'https://uatidentity.openeasy.io',
  clientId: 'e5d6c213244e4c1a9987076b965978d9',
  redirectUrl: 'http://localhost:4200/invest/auth-callback',
  scope: 'openid platform profile api_gateway user_profile_api static_data_api invest_now_api auto_refica_api',
  responseType: 'code',
  silentRenew: false,
  useRefreshToken: false,
  postLoginRoute: '/invest',
  forbiddenRoute: '/forbidden',
  unauthorizedRoute: '/unauthorized',
  renewTimeBeforeTokenExpiresInSeconds: 30,
  maxIdTokenIatOffsetAllowedInSeconds: 3600
}; 