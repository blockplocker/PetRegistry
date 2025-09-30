import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetDetails } from './pet-details';

describe('PetDetails', () => {
  let component: PetDetails;
  let fixture: ComponentFixture<PetDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PetDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
