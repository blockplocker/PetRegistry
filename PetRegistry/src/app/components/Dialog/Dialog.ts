import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { Modal } from '../Modal/Modal';

export type InfoDialogData = {
  title?: string;
  message: string;
};

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, Modal],
  templateUrl: './dialog.html',
})
export class AppDialogComponent {
  constructor(public ref: DialogRef<void>, @Inject(DIALOG_DATA) public data: InfoDialogData) {}

  close() {
    this.ref.close();
  }
}
