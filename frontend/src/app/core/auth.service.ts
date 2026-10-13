import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export const API_URL = 'http://localhost:3000/api/auth';
const TOKEN_KEY = 'token';

export type Rol = 'admin' | 'cliente';

export interface Perfil {
  correo: string;
  nombre: string;
  rol: Rol;
}

export interface LoginResponse extends Perfil {
  token: string;
}

interface Payload {
  sub: string;
  nombre: string;
  rol: Rol;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  login(correo: string, contrasena: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${API_URL}/login`, { correo, contrasena })
      .pipe(tap((r) => localStorage.setItem(TOKEN_KEY, r.token)));
  }

  obtenerPerfil(): Observable<Perfil> {
    return this.http.get<Perfil>(`${API_URL}/me`);
  }

  cerrarSesion(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /** true si hay token y todavía no cumple su hora de vida */
  estaAutenticado(): boolean {
    const payload = this.leerPayload();
    if (!payload || payload.exp * 1000 <= Date.now()) {
      this.cerrarSesion();
      return false;
    }
    return true;
  }

  tieneRol(roles: Rol[]): boolean {
    const payload = this.leerPayload();
    return !!payload && roles.includes(payload.rol);
  }

  /** milisegundos que le quedan a la sesión */
  msRestantes(): number {
    const payload = this.leerPayload();
    return payload ? Math.max(0, payload.exp * 1000 - Date.now()) : 0;
  }

  private leerPayload(): Payload | null {
    const token = this.token;
    if (!token) return null;
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes)) as Payload;
    } catch {
      return null;
    }
  }
}
