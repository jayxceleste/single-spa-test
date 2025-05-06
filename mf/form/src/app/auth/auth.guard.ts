import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private oidcSecurityService: OidcSecurityService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.oidcSecurityService.isAuthenticated$.pipe(
      take(1),
      tap(({ isAuthenticated }) => {
        if (!isAuthenticated) {
          this.oidcSecurityService.authorize();

          console.log('access token', this.oidcSecurityService.getAccessToken() );
        }
        console.log('access token', this.oidcSecurityService.getAccessToken() );

      }),
      
      map(({ isAuthenticated }) => isAuthenticated

    )
    
    );
    
  }
} 