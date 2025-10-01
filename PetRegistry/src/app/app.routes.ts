import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Persons } from './persons/persons';
import { Pets } from './pets/pets';
import { Search } from './search/search';
import { PersonDetails } from './person-details/person-details';
import { PetDetails } from './pet-details/pet-details';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Home - PetRegistry',
  },
  {
    path: 'persons',
    component: Persons,
    title: 'Add Person - PetRegistry',
  },
  {
    path: 'persons/:id',
    component: Persons,
    title: 'Edit Person - PetRegistry',
  },
  {
    path: 'pets/:id',
    component: Pets,
    title: 'Add Pet - PetRegistry',
  },
  {
    path: 'pets/edit/:id',
    component: Pets,
    title: 'Edit Pet - PetRegistry',
  },
  {
    path: 'search',
    component: Search,
    title: 'Search - PetRegistry',
  },
  {
    path: 'person-details/:id',
    component: PersonDetails,
    title: 'Person Details - PetRegistry',
  },
  {
    path: 'pet-details/:id',
    component: PetDetails,
    title: 'Pet Details - PetRegistry',
  },
];
