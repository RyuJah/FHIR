import { TestBed } from '@angular/core/testing';

import { HospitalDataService } from './hospital-data.service';

describe('HospitalDataService', () => {
  let service: HospitalDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HospitalDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
