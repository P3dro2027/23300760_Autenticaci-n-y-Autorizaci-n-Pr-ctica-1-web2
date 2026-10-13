import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.pattern(EMAIL_REGEX)]],
    contrasena: ['', [Validators.required]],
  });

  cargando = signal(false);
  errorServidor = signal('');

  mostrarError(campo: 'correo' | 'contrasena'): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }

  iniciarSesion(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.errorServidor.set('');
    const { correo, contrasena } = this.form.getRawValue();

    this.auth.login(correo.trim(), contrasena).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        if (err.status === 401) {
          this.router.navigate(['/sin-acceso']);
        } else if (err.status === 0) {
          this.errorServidor.set(
            'No se pudo conectar con el servidor. Verifica que la API esté en ejecución.'
          );
        } else if (err.status === 400) {
          this.errorServidor.set(err.error?.mensaje ?? 'Los datos enviados no son válidos.');
        } else {
          this.errorServidor.set('El servidor tuvo un problema. Inténtalo de nuevo en unos minutos.');
        }
      },
    });
  }
}
