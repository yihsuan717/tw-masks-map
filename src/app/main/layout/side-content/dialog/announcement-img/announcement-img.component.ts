import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  templateUrl: './announcement-img.component.html',
  styleUrls: ['./announcement-img.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AnnouncementImgComponent {

  constructor(
    public dialogRef: MatDialogRef<AnnouncementImgComponent>
  ) { }

}
