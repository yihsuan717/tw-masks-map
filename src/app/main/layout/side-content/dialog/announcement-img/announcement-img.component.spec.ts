import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnouncementImgComponent } from './announcement-img.component';

describe('AnnouncementImgComponent', () => {
  let component: AnnouncementImgComponent;
  let fixture: ComponentFixture<AnnouncementImgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnouncementImgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnouncementImgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
