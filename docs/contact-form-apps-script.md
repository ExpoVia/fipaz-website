# Formulario de contacto con Google Sheets + Apps Script

Cada mensaje de «Hablemos de tu próxima feria» se guarda como una fila en una hoja de cálculo de Google y, además, llega un aviso por correo. La página lo envía a una aplicación web de Apps Script (sin servidor propio y sin claves).

## 1. Crear la hoja y el script

1. En Google Drive: **Nuevo → Hojas de cálculo de Google**. Ponle el nombre «Fexpo · Contacto».
2. En la hoja: **Extensiones → Apps Script**.
3. Borra lo que haya y pega este código:

```js
// Solo si el script se creó desde script.google.com y no desde la hoja (Extensiones → Apps Script): pega aquí el ID de
// la hoja, la parte larga de https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
const SPREADSHEET_ID = "";
const SHEET_NAME = "Mensajes";
const NOTIFY_EMAIL = "quispevargasomar@gmail.com";
const HEADERS = ["Fecha", "Nombre", "Correo", "Empresa", "Soy", "Mensaje"];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const name = text(data.name, 80);
    const email = text(data.email, 120);
    const organization = text(data.organization, 120);
    const role = text(data.role, 30);
    const message = text(data.message, 4000);

    if (!name || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return reply({ ok: false, error: "Datos incompletos" });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = getSheet();
      sheet.appendRow([new Date(), safe(name), safe(email), safe(organization), safe(role), safe(message)]);
    } finally {
      lock.releaseLock();
    }

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: "Contacto desde la landing de Fexpo — " + name,
      body: "Nombre: " + name + "\nCorreo: " + email + "\nEmpresa: " + (organization || "—") +
        "\nSoy: " + (role || "No indicado") + "\n\n" + message,
    });

    return reply({ ok: true });
  } catch (error) {
    return reply({ ok: false, error: String(error) });
  }
}

function getSheet() {
  const book = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActive();
  if (!book) throw new Error("El script no está vinculado a una hoja: define SPREADSHEET_ID");
  let sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function text(value, max) {
  return String(value == null ? "" : value).trim().slice(0, max);
}

// Un valor que empieza por = + - @ se interpretaría como fórmula en la hoja.
function safe(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
```

## 2. Publicarlo

1. **Implementar → Nueva implementación → Tipo: Aplicación web**.
2. *Ejecutar como*: **Yo**. *Quién tiene acceso*: **Cualquier persona**.
3. **Implementar** y acepta los permisos (la hoja y el envío de correo). Google avisará que la app «no está verificada»: es tu propio script, **Avanzado → Ir a … (no seguro)**.
4. Copia la **URL de la aplicación web** (termina en `/exec`).

## 3. Conectarlo a la web

La URL `/exec` está escrita como valor por defecto en `src/components/landing/ContactSection.tsx` (`SCRIPT_ENDPOINT`), así que **no hace falta configurar nada en el hosting**. Es pública por naturaleza: la llama el navegador del visitante, y el script solo agrega filas.

Si algún día cambia la URL (por ejemplo, una implementación nueva), actualiza esa constante o define `NEXT_PUBLIC_CONTACT_ENDPOINT` en `.env.local` / en el hosting, que tiene prioridad. Cambiar la variable exige reiniciar `npm run dev` o volver a desplegar.

## Notas

- **Error «Cannot read properties of null (reading 'getSheetByName')»:** el script no está dentro de la hoja. Define `SPREADSHEET_ID` (arriba) o créalo desde la hoja con *Extensiones → Apps Script*.
- **Cambios en el script:** cada vez que lo modifiques hay que hacer **Implementar → Administrar implementaciones → Editar → Nueva versión**; si no, la URL sigue ejecutando la versión anterior.
- **Límite de correo:** una cuenta de Gmail normal puede enviar unos 100 correos diarios desde Apps Script. Las filas de la hoja no tienen ese límite.
- **Antispam:** el campo oculto `_honey` descarta bots en el navegador. El script valida los campos y recorta su longitud.
- **Respuesta:** el script contesta `{ "ok": true }`; la página solo muestra «Mensaje enviado.» si recibe eso.
