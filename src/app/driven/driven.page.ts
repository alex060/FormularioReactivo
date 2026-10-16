import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
  layersOutline,
  swapHorizontalOutline,
} from 'ionicons/icons';
import jsPDF from 'jspdf';
import { cifrarContrasenaSHA256, RegistroUsuario } from '../registro/registro.page';

export interface UsuarioDriven {
  nombre: string;
  email: string;
  password: string;
  fechaNacimiento: string;
}

@Component({
  selector: 'app-driven',
  templateUrl: './driven.page.html',
  styleUrls: ['./driven.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
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
export class DrivenPage implements OnInit {
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  // Modelo de datos bidireccional mediante ngModel (Template-Driven)
  public usuario: UsuarioDriven = {
    nombre: '',
    email: '',
    password: '',
    fechaNacimiento: '',
  };

  public isSubmitting = signal<boolean>(false);
  public ultimoRegistro = signal<RegistroUsuario | null>(null);
  public isDarkMode = signal<boolean>(false);

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
      layersOutline,
      swapHorizontalOutline,
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

  public esFechaFutura(fechaStr: string): boolean {
    if (!fechaStr) return false;
    const fecha = new Date(fechaStr);
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);
    return fecha > hoy;
  }

  public getFechaDrivenErrorText(ctrl: NgModel): string {
    if (!ctrl || !ctrl.touched) return '';
    if (ctrl.errors?.['required']) {
      return 'La fecha de nacimiento es obligatoria.';
    }
    if (this.esFechaFutura(this.usuario.fechaNacimiento)) {
      return 'La fecha de nacimiento no puede ser posterior a hoy.';
    }
    return '';
  }

  public async onSubmit(form: NgForm): Promise<void> {
    if (form.invalid || this.esFechaFutura(this.usuario.fechaNacimiento)) {
      return;
    }

    this.isSubmitting.set(true);

    try {
      // Cifrado criptográfico de la contraseña antes de loguear en consola
      const passwordHash = await cifrarContrasenaSHA256(this.usuario.password);

      const payloadSeguro = {
        nombre: this.usuario.nombre,
        email: this.usuario.email,
        password: `[SHA-256:${passwordHash}]`,
        fechaNacimiento: this.usuario.fechaNacimiento,
        paradigma: 'Template-Driven Form ([(ngModel)])',
      };

      console.log('Payload seguro Template-Driven a enviar:', payloadSeguro);
      console.log('Hash criptográfico generado:', passwordHash);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const nuevoRegistro: RegistroUsuario = {
        nombre: this.usuario.nombre,
        email: this.usuario.email,
        fechaNacimiento: this.usuario.fechaNacimiento,
        fechaEnvio: new Date().toLocaleString('es-ES'),
        idReferencia:
          'DRV-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      };

      this.ultimoRegistro.set(nuevoRegistro);

      // 1. Alerta informativa
      const alert = await this.alertController.create({
        header: '¡Formulario Template-Driven Enviado!',
        subHeader: 'Procesado mediante directivas ngModel',
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

      // 2. Toast de éxito
      const toast = await this.toastController.create({
        message: '¡Formulario Template-Driven validado y enviado correctamente!',
        duration: 3500,
        color: 'secondary',
        position: 'top',
        icon: 'checkmark-circle-outline',
      });
      await toast.present();

      form.resetForm();
    } catch (error) {
      console.error('Error al persistir formulario template-driven', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  public async descargarPdf(): Promise<void> {
    const registro = this.ultimoRegistro();
    if (!registro) return;

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();

      // Cabecera color verde esmeralda para diferenciar Template-Driven
      doc.setFillColor(13, 148, 136); // Teal #0d9488
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('COMPROBANTE FORMULARIO TEMPLATE-DRIVEN', 14, 13);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.text(
        'Desarrollo de Interfaces (2º DAM) — Modelo Declarativo [(ngModel)]',
        14,
        20
      );

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(9);
      doc.text(`Fecha de emisión: ${registro.fechaEnvio}`, 14, 38);
      doc.text(
        `Nº Referencia: ${registro.idReferencia}`,
        pageWidth - 14,
        38,
        { align: 'right' }
      );

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
      doc.text('Datos Registrados (Paradigma Template-Driven)', 22, 60);

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

      // Caja de Verificación
      doc.setFillColor(240, 253, 250);
      doc.setDrawColor(13, 148, 136);
      doc.roundedRect(14, 134, pageWidth - 28, 26, 3, 3, 'FD');

      doc.setTextColor(17, 94, 89);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('ESTADO: VALIDACIÓN DECLARATIVA SUPERADA', 22, 144);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(15, 118, 110);
      doc.text(
        'Validación síncrona mediante directivas HTML nativas y enlace bidireccional [(ngModel)].',
        22,
        152
      );

      // Pie de página
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 275, pageWidth - 14, 275);

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'FormularioReactivo vs Driven — Proyecto Académico Multiplataforma',
        14,
        282
      );
      doc.text('Alumno: Alejandro', pageWidth - 14, 282, { align: 'right' });

      doc.save(`comprobante_driven_${registro.idReferencia}.pdf`);
    } catch (err) {
      console.error('Error generando PDF Driven:', err);
    }
  }
}
