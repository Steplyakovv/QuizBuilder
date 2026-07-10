import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api-url';
import { AuthRepository } from './auth-repository';

interface AuthStatusResponse {
  isAdmin: boolean;
}

@Injectable({ providedIn: 'root' })
export class HttpAuthRepository implements AuthRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/auth`;

  async login(username: string, password: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post<AuthStatusResponse>(
          `${this.baseUrl}/login`,
          { username, password },
          { withCredentials: true },
        ),
      );
      return true;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return false;
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    await firstValueFrom(
      this.http.post<void>(`${this.baseUrl}/logout`, {}, { withCredentials: true }),
    );
  }

  async me(): Promise<boolean> {
    const status = await firstValueFrom(
      this.http.get<AuthStatusResponse>(`${this.baseUrl}/me`, { withCredentials: true }),
    );
    return status.isAdmin;
  }
}
