"use client";

import { useState } from "react";
import { Bookmark, Check, Mail, MapPin, UserRound } from "lucide-react";
import type { DemoCompany } from "./journey-data";
import styles from "./JourneyDemos.module.css";

export { SearchDemo } from "./SearchDemo";
export { MapDemo } from "./MapDemo";
export { NFCDemo } from "./NFCDemo";
export { RewardDemo } from "./RewardDemo";
export { RouteDemo } from "./RouteDemo";

export function ConnectDemo({ company, saved, onSave }: { company: DemoCompany; saved: boolean; onSave: () => void }) {
  const [contactVisible, setContactVisible] = useState(false);
  return <div>
    <div className={styles.company}><span className={styles.companyLogo}>{company.initials}</span><div><h4>{company.name}</h4><p>{company.category}</p><span><MapPin size={12} aria-hidden="true" /> Stand {company.stand}</span></div></div>
    <div className={styles.contact}><UserRound size={22} aria-hidden="true" /><div><strong>María López</strong><span>Business Development</span></div><span className={styles.sampleBadge}>Ejemplo</span></div>
    <div className={styles.actions}><button type="button" className={styles.save} onClick={onSave} aria-pressed={saved}>{saved ? <Check size={15} aria-hidden="true" /> : <Bookmark size={15} aria-hidden="true" />}{saved ? "Empresa guardada" : "Guardar empresa"}</button><button type="button" className={styles.contactButton} aria-expanded={contactVisible} onClick={() => setContactVisible(!contactVisible)}>Ver contacto</button></div>
    {contactVisible && <p className={styles.contactDetail}><Mail size={14} aria-hidden="true" /> maria@{company.id}.example · Contacto de ejemplo</p>}
    <p className={styles.savedHint} role="status">{saved ? "Podrás consultarla después desde tu perfil. Guardada en esta demo." : "Guarda una empresa para continuar la conversación."}</p>
  </div>;
}
