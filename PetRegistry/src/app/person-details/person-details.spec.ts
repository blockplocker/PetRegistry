import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonDetails } from './person-details';

describe('PersonDetails', () => {
  let component: PersonDetails;
  let fixture: ComponentFixture<PersonDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
