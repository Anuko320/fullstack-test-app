import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class DialogRef<T = any> {
  private result$ = new Subject<T | null>();

  close(value?: T) {
    this.result$.next(value ?? null);
    this.result$.complete();
  }

  afterClosed() {
    return this.result$.asObservable();
  }
}