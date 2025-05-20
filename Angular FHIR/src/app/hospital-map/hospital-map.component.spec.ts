import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalMapComponent } from './hospital-map.component';

describe('HospitalMapComponent', () => {
  let component: HospitalMapComponent;
  let fixture: ComponentFixture<HospitalMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HospitalMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
