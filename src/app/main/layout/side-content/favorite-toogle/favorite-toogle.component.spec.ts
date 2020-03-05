import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteToogleComponent } from './favorite-toogle.component';

describe('FavoriteToogleComponent', () => {
  let component: FavoriteToogleComponent;
  let fixture: ComponentFixture<FavoriteToogleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FavoriteToogleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FavoriteToogleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
