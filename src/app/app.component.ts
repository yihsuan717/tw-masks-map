import { Component } from '@angular/core';
import { SplashScreenService } from 'src/@core/services/splash-screen.service';

@Component({
  selector: 'app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'tw-masks-map';

  constructor(
    private splashScreenService: SplashScreenService
  ) {
  }

}
