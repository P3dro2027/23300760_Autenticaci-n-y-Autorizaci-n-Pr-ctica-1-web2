import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-sin-acceso',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sin-acceso.component.html',
  styleUrl: './sin-acceso.component.css',
})
export class SinAccesoComponent {
  private route = inject(ActivatedRoute);

  titulo =
    this.route.snapshot.queryParamMap.get('motivo') === 'permisos'
      ? 'Tu rol no tiene permiso para entrar'
      : 'Credenciales inválidas';

  detalle =
    this.route.snapshot.queryParamMap.get('motivo') === 'permisos'
      ? 'Inicia sesión con una cuenta que tenga acceso a esta página.'
      : 'El correo o la contraseña no coinciden con un usuario registrado.';
}
