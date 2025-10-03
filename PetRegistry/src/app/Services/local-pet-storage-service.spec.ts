import { TestBed } from '@angular/core/testing';

import { LocalPetStorageService } from './local-pet-storage-service';

describe('LocalPetStorageService', () => {
  let service: LocalPetStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalPetStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
