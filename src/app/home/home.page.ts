import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonButton,
  IonSpinner,
  AlertController,
  ToastController,
} from '@ionic/angular';

/**
 * Modelo de datos del registro validado
 */
export interface RegistroUsuario {
  nombre: string;
  email: string;
  fechaNacimiento: string;
  fechaEnvio: string;
  idReferencia: string;
}

/**
 * Validador personalizado para asegurar que la fecha de nacimiento no es posterior al día de hoy.
 */
export function fechaNoFuturaValidator(
  control: AbstractControl
): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  const fecha = new Date(control.value);
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);

  if (isNaN(fecha.getTime())) {
    return { fechaInvalida: true };
  }

  if (fecha > hoy) {
    return { fechaFutura: true };
  }

  return null;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    IonSpinner,
  ],
})
export class HomePage {
  private fb = inject(FormBuilder);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  public registroForm: FormGroup;
  public isSubmitting = signal<boolean>(false);
  public ultimoRegistro = signal<RegistroUsuario | null>(null);

  // Fecha máxima permitida (hoy en formato YYYY-MM-DD para el datepicker)
  public maxDate: string = new Date().toISOString().split('T')[0];

  constructor() {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
        ],
      ],
      fechaNacimiento: ['', [Validators.required, fechaNoFuturaValidator]],
    });
  }

  get f() {
    return this.registroForm.controls;
  }

  public getFechaErrorText(): string {
    const control = this.registroForm.get('fechaNacimiento');
    if (!control || !control.errors) return '';
    if (control.errors['required']) return 'La fecha de nacimiento es obligatoria.';
    if (control.errors['fechaFutura']) {
      return 'La fecha de nacimiento no puede ser posterior a hoy.';
    }
    return 'Fecha de nacimiento no válida.';
  }

  public async onSubmit(): Promise<void> {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    try {
      const rawData = this.registroForm.value;
      console.log('Payload a enviar a la API REST:', rawData);

      // Simulación de latencia de red asíncrona (1 segundo)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const nuevoRegistro: RegistroUsuario = {
        nombre: rawData.nombre,
        email: rawData.email,
        fechaNacimiento: rawData.fechaNacimiento,
        fechaEnvio: new Date().toLocaleString('es-ES'),
        idReferencia: 'REG-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      };

      this.ultimoRegistro.set(nuevoRegistro);

      // 1. Mostrar Alerta interactiva con el resumen de datos enviados
      const alert = await this.alertController.create({
        header: '¡Formulario Enviado!',
        subHeader: 'Registro procesado correctamente',
        message: `
          <div style="font-size: 0.95rem; line-height: 1.5;">
            <p><strong>Usuario:</strong> ${nuevoRegistro.nombre}</p>
            <p><strong>Email:</strong> ${nuevoRegistro.email}</p>
            <p><strong>F. Nacimiento:</strong> ${nuevoRegistro.fechaNacimiento}</p>
            <p><strong>Nº Referencia:</strong> <code>${nuevoRegistro.idReferencia}</code></p>
          </div>
        `,
        buttons: [
          {
            text: 'Entendido',
            role: 'confirm',
          },
        ],
      });
      await alert.present();

      // 2. Mostrar Notificación Toast de éxito
      const toast = await this.toastController.create({
        message: '¡El formulario se ha enviado y validado correctamente!',
        duration: 3500,
        color: 'success',
        position: 'top',
        icon: 'checkmark-circle-outline',
      });
      await toast.present();

      this.registroForm.reset();
    } catch (error) {
      console.error('Error al persistir los datos', error);
      const toastError = await this.toastController.create({
        message: 'Hubo un error al procesar el envío. Inténtelo de nuevo.',
        duration: 3000,
        color: 'danger',
        position: 'top',
      });
      await toastError.present();
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
