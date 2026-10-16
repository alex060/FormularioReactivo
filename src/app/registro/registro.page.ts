import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  IonButtons,
  IonIcon,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  AlertController,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  moon,
  sunny,
  checkmarkCircleOutline,
  downloadOutline,
  personOutline,
  mailOutline,
  lockClosedOutline,
  calendarOutline,
  documentTextOutline,
  shieldCheckmarkOutline,
  swapHorizontalOutline,
} from 'ionicons/icons';
import jsPDF from 'jspdf';

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
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    IonButtons,
    IonIcon,
    IonSpinner,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
  ],
})
export class RegistroPage implements OnInit {
  private fb = inject(FormBuilder);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  public registroForm: FormGroup;
  public isSubmitting = signal<boolean>(false);
  public ultimoRegistro = signal<RegistroUsuario | null>(null);
  public isDarkMode = signal<boolean>(false);

  // Fecha máxima permitida (hoy en formato YYYY-MM-DD para el datepicker)
  public maxDate: string = new Date().toISOString().split('T')[0];

  constructor() {
    addIcons({
      moon,
      sunny,
      checkmarkCircleOutline,
      downloadOutline,
      personOutline,
      mailOutline,
      lockClosedOutline,
      calendarOutline,
      documentTextOutline,
      shieldCheckmarkOutline,
      swapHorizontalOutline,
    });

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

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme-dark');
    if (savedTheme !== null) {
      this.setDarkMode(savedTheme === 'true');
    } else {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      this.setDarkMode(prefersDark);
    }
  }

  public toggleDarkMode(): void {
    this.setDarkMode(!this.isDarkMode());
  }

  private setDarkMode(dark: boolean): void {
    this.isDarkMode.set(dark);
    document.documentElement.classList.toggle('ion-palette-dark', dark);
    document.body.classList.toggle('dark', dark);
    localStorage.setItem('theme-dark', dark.toString());
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
        idReferencia:
          'REG-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
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
            text: 'Descargar PDF',
            handler: () => {
              this.descargarPdf();
            },
          },
          {
            text: 'Aceptar',
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

  /**
   * Genera y descarga un documento PDF con los datos del usuario registrado.
   */
  public async descargarPdf(): Promise<void> {
    const registro = this.ultimoRegistro();
    if (!registro) {
      const toastWarn = await this.toastController.create({
        message: 'Debe rellenar y enviar el formulario antes de descargar el PDF.',
        duration: 3000,
        color: 'warning',
        position: 'top',
      });
      await toastWarn.present();
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();

      // Cabecera con banda de color
      doc.setFillColor(30, 58, 138); // Azul institucional
      doc.rect(0, 0, pageWidth, 28, 'F');

      // Título en cabecera
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('COMPROBANTE DE REGISTRO DE USUARIO', 14, 13);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.text(
        'Desarrollo de Interfaces (2º DAM) — FormularioReactivo Ionic Angular',
        14,
        20
      );

      // Metadatos
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(9);
      doc.text(`Fecha de emisión: ${registro.fechaEnvio}`, 14, 38);
      doc.text(
        `Nº Referencia: ${registro.idReferencia}`,
        pageWidth - 14,
        38,
        { align: 'right' }
      );

      // Línea divisoria
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, 42, pageWidth - 14, 42);

      // Caja de Datos
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(14, 48, pageWidth - 28, 76, 3, 3, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Datos Personales Registrados', 22, 60);

      const filas = [
        { label: 'Nombre Completo:', valor: registro.nombre },
        { label: 'Correo Electrónico:', valor: registro.email },
        { label: 'Fecha de Nacimiento:', valor: registro.fechaNacimiento },
        { label: 'Fecha y Hora de Envío:', valor: registro.fechaEnvio },
      ];

      let yPos = 72;
      filas.forEach((fila) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.text(fila.label, 22, yPos);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.text(fila.valor, 78, yPos);

        doc.setDrawColor(241, 245, 249);
        doc.line(22, yPos + 3, pageWidth - 22, yPos + 3);
        yPos += 12;
      });

      // Caja de Verificación / Validación
      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(16, 185, 129);
      doc.roundedRect(14, 134, pageWidth - 28, 26, 3, 3, 'FD');

      doc.setTextColor(6, 95, 70);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('ESTADO: VALIDADO Y REGISTRADO CORRECTAMENTE', 22, 144);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(4, 120, 87);
      doc.text(
        'Todos los campos han superado las validaciones síncronas y reglas de negocio del formulario.',
        22,
        152
      );

      // Pie de página
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 275, pageWidth - 14, 275);

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'FormularioReactivo — Proyecto Académico Multiplataforma Ionic & Angular',
        14,
        282
      );
      doc.text('Alumno: Alejandro', pageWidth - 14, 282, { align: 'right' });

      doc.save(`comprobante_registro_${registro.idReferencia}.pdf`);

      const toastSuccess = await this.toastController.create({
        message: '¡Comprobante en PDF descargado correctamente!',
        duration: 3000,
        color: 'success',
        position: 'bottom',
        icon: 'download-outline',
      });
      await toastSuccess.present();
    } catch (err) {
      console.error('Error generando PDF:', err);
      const toastErr = await this.toastController.create({
        message: 'Error al generar el archivo PDF.',
        duration: 3000,
        color: 'danger',
        position: 'top',
      });
      await toastErr.present();
    }
  }
}
