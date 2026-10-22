import type { Metadata } from "next";
import { LEGAL_CONTACT_EMAIL, LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Cómo Fexpo recopila, usa y protege los datos personales de visitantes, expositores y organizadores.",
};

export default function PrivacidadPage() {
  return (
    <LegalPage
      current="privacidad"
      title="Política de privacidad"
      updatedAt="22 de octubre de 2026"
      intro="Esta política explica qué datos personales trata Fexpo (fexpo.lat) cuando usas la plataforma, para qué los usamos y qué derechos tienes sobre ellos."
      sections={[
        {
          title: "Datos que recopilamos",
          body: (
            <>
              <p>Según cómo uses Fexpo, podemos tratar:</p>
              <ul>
                <li>
                  <strong>Datos de cuenta:</strong> nombre, correo electrónico y foto de perfil cuando inicias sesión con tu cuenta de Google, o correo y contraseña en el caso de empresas y organizadores.
                </li>
                <li>
                  <strong>Datos de participación en eventos:</strong> check-ins en stands (QR o NFC), misiones completadas, recompensas y puntos obtenidos.
                </li>
                <li>
                  <strong>Datos de empresas expositoras:</strong> razón social, datos de contacto y la información que registres de tus stands, actividades e inventario.
                </li>
                <li>
                  <strong>Mensajes y comentarios:</strong> lo que nos envías mediante el formulario de contacto o el de feedback.
                </li>
                <li>
                  <strong>Datos técnicos:</strong> tipo de dispositivo, navegador y registros básicos de uso necesarios para el funcionamiento y la seguridad del servicio.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "Inicio de sesión con Google",
          body: (
            <p>
              Si eliges iniciar sesión con Google, solo accedemos a tu nombre, correo electrónico y foto de perfil para crear y mantener tu cuenta. No accedemos a tu correo, contactos, archivos ni a otros servicios de Google. El uso de la información recibida de las APIs de Google se ajusta a la{" "}
              <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
                Política de datos de usuario de los servicios API de Google
              </a>
              , incluidos los requisitos de uso limitado.
            </p>
          ),
        },
        {
          title: "Para qué usamos tus datos",
          body: (
            <ul>
              <li>Crear y gestionar tu cuenta y autenticarte.</li>
              <li>Operar las dinámicas del evento: check-ins, misiones y recompensas.</li>
              <li>Permitir a expositores y organizadores gestionar sus stands y ver métricas de participación.</li>
              <li>Responder consultas y mejorar la plataforma a partir del feedback.</li>
              <li>Mantener la seguridad del servicio y prevenir fraude o abuso.</li>
            </ul>
          ),
        },
        {
          title: "Con quién compartimos los datos",
          body: (
            <>
              <p>No vendemos tus datos personales. Los compartimos únicamente con:</p>
              <ul>
                <li>
                  <strong>Organizadores y expositores del evento</strong> en el que participas, en la medida necesaria para operar las dinámicas (por ejemplo, que un stand registre tu visita).
                </li>
                <li>
                  <strong>Proveedores de infraestructura</strong> que alojan y operan el servicio (hosting, base de datos y autenticación), bajo obligaciones de confidencialidad.
                </li>
                <li>
                  <strong>Autoridades</strong>, cuando una obligación legal así lo exija.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "Conservación y seguridad",
          body: (
            <p>
              Conservamos los datos mientras tu cuenta esté activa o sea necesario para los fines descritos, y los eliminamos o anonimizamos cuando dejan de serlo. Aplicamos medidas técnicas y organizativas razonables (cifrado en tránsito y control de acceso por roles), aunque ningún sistema es completamente infalible.
            </p>
          ),
        },
        {
          title: "Tus derechos",
          body: (
            <p>
              Puedes solicitar acceso, rectificación o eliminación de tus datos, así como oponerte a su tratamiento, escribiéndonos a{" "}
              <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>. También puedes revocar el acceso de Fexpo a tu cuenta de Google desde la configuración de seguridad de tu cuenta de Google.
            </p>
          ),
        },
        {
          title: "Menores de edad",
          body: (
            <p>
              Fexpo no está dirigido a menores de 13 años y no recopilamos intencionalmente sus datos. Si crees que un menor nos ha entregado información, contáctanos para eliminarla.
            </p>
          ),
        },
        {
          title: "Cambios a esta política",
          body: (
            <p>
              Podemos actualizar esta política. Publicaremos la versión vigente en esta página con su fecha de actualización; si los cambios son relevantes, lo comunicaremos por los canales de la plataforma.
            </p>
          ),
        },
        {
          title: "Contacto",
          body: (
            <p>
              Para cualquier consulta sobre privacidad escríbenos a{" "}
              <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
            </p>
          ),
        },
      ]}
    />
  );
}
