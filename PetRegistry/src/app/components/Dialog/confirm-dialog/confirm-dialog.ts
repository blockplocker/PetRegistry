import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { Modal } from '../../modal/modal';

export type ConfirmData = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
};

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, Modal, TranslateModule],
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialogComponent {
  constructor(public ref: DialogRef<boolean>, @Inject(DIALOG_DATA) public data: ConfirmData) {}

  confirm() {
    this.ref.close(true);
  }
  close() {
    this.ref.close(false);
  }
}
