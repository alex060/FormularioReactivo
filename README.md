# FormularioReactivo — Práctica de Formularios Reactivos con Ionic & Angular

**Módulo:** Desarrollo de Interfaces (Código: 0488)  
**Curso:** 2º DAM (Desarrollo de Aplicaciones Multiplataforma)  
**Alumno:** Alejandro  
**Tecnologías:** Ionic Framework, Angular Standalone, Reactive Forms, TypeScript, jsPDF  

---

## 📋 Descripción de la Actividad
Implementación completa de un formulario reactivo para registro de usuario aplicando buenas prácticas de accesibilidad, validaciones síncronas personalizadas, gestión reactiva de estado con Angular Signals, soporte de modo oscuro persistente y exportación directa de comprobantes en PDF.

### Requisitos Implementados:
1. **Proyecto Ionic Angular Standalone:** Arquitectura modular y moderna zoneless con `@ionic/angular/standalone`.
2. **Formulario Reactivo (`registroForm`):** Campos tipados con `FormGroup`, `FormControl` y validadores estrictos.
3. **Validaciones en Tiempo Real:** Mensajes accesibles mediante la propiedad `[errorText]` de componentes nativos Ionic.
4. **Campo Fecha de Nacimiento:** Con validador personalizado (`fechaNoFuturaValidator`) que impide fechas posteriores al día actual.
5. **Alerta y Notificación:** Notificación interactiva (`AlertController`) y confirmación (`ToastController`) tras el envío.
6. **Modo Oscuro (Dark Mode):** Botón selector en la barra superior con persistencia en `localStorage`.
7. **Descarga en PDF:** Generación en cliente del documento oficial de registro con `jsPDF`.
