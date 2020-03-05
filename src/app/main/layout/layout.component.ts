import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MediaMatcher, BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private mediaMatcher: MediaMatcher,
    private cd: ChangeDetectorRef,
  ) {

  }

  ngOnInit(): void {
    this.mobileQuery = this.mediaMatcher.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => this.cd.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }

  mylocation() {

  }

}
