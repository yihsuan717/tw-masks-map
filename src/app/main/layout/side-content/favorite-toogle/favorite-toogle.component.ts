import { Component, OnInit, ChangeDetectionStrategy, Input, SimpleChanges, OnChanges, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'favorite-toogle',
  templateUrl: './favorite-toogle.component.html',
  styleUrls: ['./favorite-toogle.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class FavoriteToogleComponent implements OnInit, OnChanges {

  _favorited: boolean | any;
  @Input()
  set favorited(val) {
    this._favorited = val;
  }

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

}
