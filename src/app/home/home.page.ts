import { Component, signal } from '@angular/core';
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
} from '@ionic/angular';

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
  public registroForm: FormGroup;
  public isSubmitting = signal<boolean>(false);

  // Fecha máxima permitida (hoy en formato YYYY-MM-DD para el datepicker)
  public maxDate: string = new Date().toISOString().split('T')[0];

  constructor(private fb: FormBuilder) {
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
      const formData = this.registroForm.value;
      console.log('Payload a enviar a la API REST:', formData);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      this.registroForm.reset();
    } catch (error) {
      console.error('Error al persistir los datos', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
