import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'color-spinner',
  templateUrl: './color-spinner.component.html',
  styleUrls: ['./color-spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColorSpinnerComponent implements OnInit {

  @Input() size = 24;

  constructor() { }

  ngOnInit(): void {
  }

}
