import { Component } from '@angular/core';
import { DialogRef } from './confirm-dialog-ref';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  constructor(private dialogRef: DialogRef<boolean>) {}

  close(result: boolean) {
    this.dialogRef.close(result);
  }
}