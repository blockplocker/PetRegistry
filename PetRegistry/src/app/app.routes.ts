import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Persons } from './persons/persons';
import { Pets } from './pets/pets';

export const routes: Routes = [
    {
    path: '',
    component: Home,
    // canActivate: [AuthGuard],
    title: 'Home - PetRegistry',
    },
    {
    path: 'persons',
    component: Persons,
    title: 'Persons - PetRegistry',
  },
    {
    path: 'pets',
    component: Pets,
    title: 'Pets - PetRegistry',
  },
];
