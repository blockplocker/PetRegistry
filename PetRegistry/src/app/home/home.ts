import { Component } from '@angular/core';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { AppDialogComponent } from '../components/Dialog/Dialog';

@Component({
  selector: 'app-home',
  imports: [DialogModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  constructor(private dialog: Dialog) {}

  showSuccess() {
    this.dialog.open(AppDialogComponent, {
      data: {
        title: 'Klart!',
        message: 'Dina ändringar sparades.',
      },
    });
  }

  showError() {
    this.dialog.open(AppDialogComponent, {
      data: {
        title: 'Fel',
        message: 'Det gick inte att spara.',
      },
    });
  }
}
