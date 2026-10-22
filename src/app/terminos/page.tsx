import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_CONTACT_EMAIL, LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Términos de servicio",
  description:
    "Condiciones de uso de la plataforma Fexpo para visitantes, expositores y organizadores de ferias y eventos.",
};

export default function TerminosPage() {
  return (
    <LegalPage
      title="Términos de servicio"
      updatedAt="22 de octubre de 2026"
      intro="Al acceder o usar Fexpo (fexpo.lat) aceptas estos términos. Si no estás de acuerdo con ellos, por favor no uses la plataforma."
      sections={[
        {
          title: "El servicio",
          body: (
            <p>
              Fexpo es una plataforma digital para ferias y eventos físicos que ofrece mapas, check-ins por QR o NFC, misiones, recompensas y herramientas de gestión para expositores y organizadores. Algunas funciones se ofrecen como demostración o en fase temprana y pueden cambiar o discontinuarse.
            </p>
          ),
        },
        {
          title: "Cuentas y acceso",
          body: (
            <ul>
              <li>Debes proporcionar información veraz y mantenerla actualizada.</li>
              <li>Eres responsable de la confidencialidad de tus credenciales y de la actividad realizada con tu cuenta.</li>
              <li>Debes avisarnos de inmediato si detectas un uso no autorizado de tu cuenta.</li>
            </ul>
          ),
        },
        {
          title: "Uso aceptable",
          body: (
            <>
              <p>Te comprometes a no:</p>
              <ul>
                <li>Usar la plataforma para fines ilícitos o fraudulentos, incluida la manipulación de puntos, misiones o recompensas.</li>
                <li>Intentar acceder sin autorización a cuentas, sistemas o datos de terceros.</li>
                <li>Interferir con el funcionamiento del servicio, o realizar ingeniería inversa o ataques automatizados.</li>
                <li>Publicar contenido ofensivo, engañoso o que infrinja derechos de terceros.</li>
              </ul>
            </>
          ),
        },
        {
          title: "Expositores y organizadores",
          body: (
            <p>
              Las empresas y organizadores son responsables de la veracidad de la información que registran (stands, actividades, inventario y recompensas) y de cumplir las recompensas y promociones que ofrezcan a los visitantes. Fexpo es una herramienta tecnológica y no es parte de la relación comercial entre expositores y visitantes.
            </p>
          ),
        },
        {
          title: "Propiedad intelectual",
          body: (
            <p>
              La plataforma, su diseño, marca y código pertenecen a Fexpo o a sus licenciantes. Se te concede un derecho limitado, revocable y no exclusivo para usarla conforme a estos términos. Conservas la titularidad del contenido que aportas y nos autorizas a alojarlo y mostrarlo para operar el servicio.
            </p>
          ),
        },
        {
          title: "Privacidad",
          body: (
            <p>
              El tratamiento de datos personales se describe en nuestra <Link href="/privacidad">política de privacidad</Link>.
            </p>
          ),
        },
        {
          title: "Disponibilidad y limitación de responsabilidad",
          body: (
            <p>
              El servicio se ofrece «tal cual» y según disponibilidad, sin garantías de funcionamiento ininterrumpido o libre de errores. En la medida permitida por la ley, Fexpo no será responsable por daños indirectos o pérdidas derivadas del uso o la imposibilidad de uso de la plataforma, ni por el incumplimiento de recompensas ofrecidas por terceros.
            </p>
          ),
        },
        {
          title: "Suspensión y terminación",
          body: (
            <p>
              Podemos suspender o cancelar el acceso a cuentas que incumplan estos términos o pongan en riesgo la seguridad del servicio. Puedes dejar de usar Fexpo y solicitar la eliminación de tu cuenta en cualquier momento.
            </p>
          ),
        },
        {
          title: "Cambios a los términos",
          body: (
            <p>
              Podemos modificar estos términos. La versión vigente estará siempre en esta página; el uso continuado de la plataforma tras un cambio implica su aceptación.
            </p>
          ),
        },
        {
          title: "Contacto",
          body: (
            <p>
              Si tienes preguntas sobre estos términos, escríbenos a{" "}
              <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
            </p>
          ),
        },
      ]}
    />
  );
}
