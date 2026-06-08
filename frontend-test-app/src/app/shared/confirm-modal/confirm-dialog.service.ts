import { Injectable, inject } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialog, ConfirmDialogData } from '../../core/components/confirm-dialog/confirm-dialog';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly dialog = inject(Dialog);

  open(data?: Partial<ConfirmDialogData>): Observable<boolean | undefined> {
    return this.dialog.open<boolean, ConfirmDialogData>(ConfirmDialog, {
      data: {
        title: data?.title ?? 'confirm.logoutTitle',
        message: data?.message ?? 'confirm.logoutMessage',
        confirmText: data?.confirmText ?? 'confirm.confirm',
        cancelText: data?.cancelText ?? 'common.cancel',
      },
      panelClass: 'app-confirm-dialog-panel',
      backdropClass: 'app-confirm-dialog-backdrop',
      disableClose: true,
    }).closed;
  }
}