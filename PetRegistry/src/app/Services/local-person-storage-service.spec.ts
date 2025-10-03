import { TestBed } from '@angular/core/testing';

import { LocalPersonStorageService } from './local-person-storage-service';

describe('LocalPersonStorageService', () => {
  let service: LocalPersonStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalPersonStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
