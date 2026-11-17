# Nuestro Adviento

Calendario de Adviento romántico estático, creado con HTML, CSS y JavaScript vanilla y listo para desplegar en Vercel.

## Personalización

- En `index.html` puedes cambiar el título y los textos de bienvenida.
- En `style.css` están los colores, la tipografía y los estilos responsive.
- En `script.js`, cambia `DEBUG_MODE` a `false` para probar el bloqueo por fecha. Con el modo de depuración activo se pueden abrir todas las casillas.
- Cada carpeta `dias/dia-XX/` contiene una página independiente con sus propios HTML, CSS y JavaScript. Sustituye sus textos y coloca las fotos en `assets/images/`; cada página muestra una indicación si todavía no has añadido su foto.
- Los días 1–31 se desbloquean desde el día correspondiente de diciembre. Los días bonus 32–37 se desbloquean del 1 al 6 de enero.
- La portada guarda en `localStorage` los días visitados para marcarlos con un check en la próxima visita.
- `assets/audio/` y `assets/images/` son espacios para recursos compartidos.

Abre `index.html` directamente en un navegador para probar la aplicación. No necesita instalación ni proceso de build.
