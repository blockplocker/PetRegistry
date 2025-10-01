import { TestBed } from '@angular/core/testing';

import { RouteParamService } from './route-param-service';

describe('RouteParamService', () => {
  let service: RouteParamService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouteParamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
