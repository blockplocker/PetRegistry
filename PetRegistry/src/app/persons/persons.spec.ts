import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Persons } from './persons';

describe('Persons', () => {
  let component: Persons;
  let fixture: ComponentFixture<Persons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Persons]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Persons);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
