import { Component } from '@angular/core';
import { SplashScreenService } from 'src/@core/services/splash-screen.service';
import { Router, NavigationEnd } from '@angular/router';

// declare gives Angular app access to ga function
declare let gtag: Function;

@Component({
  selector: 'app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'tw-masks-map';

  constructor(
    private splashScreenService: SplashScreenService,
    public router: Router
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        console.log(event.urlAfterRedirects);
        gtag('config', 'UA-160400807-1', { page_path: event.urlAfterRedirects });
      }
    });
  }
}
