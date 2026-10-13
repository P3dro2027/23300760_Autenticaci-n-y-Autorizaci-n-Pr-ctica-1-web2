import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService, Perfil } from '../../core/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private router = inject(Router);
  private temporizador?: ReturnType<typeof setTimeout>;

  perfil = signal<Perfil | null>(null);
  cargando = signal(true);
  error = signal('');

  titulo = computed(() =>
    this.perfil()?.rol === 'admin' ? 'Bienvenido administrador' : 'Bienvenido cliente'
  );

  ngOnInit(): void {
    // La sesión expira a la hora de haberse generado el token (RQNF2)
    this.temporizador = setTimeout(() => this.cerrarSesion(), this.auth.msRestantes());

    this.auth.obtenerPerfil().subscribe({
      next: (perfil) => {
        this.perfil.set(perfil);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        // Con 401 el interceptor ya cerró la sesión y redirigió al login
        if (err.status !== 401) {
          this.error.set('No se pudieron cargar tus datos. Verifica que la API esté en ejecución.');
        }
      },
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.temporizador);
  }

  cerrarSesion(): void {
    this.auth.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
