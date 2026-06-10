import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment'; // поправь путь если нужно

export interface SupportRequest {
  name: string;
  email: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class SupportService {
  private readonly http = inject(HttpClient);

  sendSupportRequest(data: SupportRequest): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${environment.apiUrl}/support`, data)
    );
  }
}
