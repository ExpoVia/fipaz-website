"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ArrowRight, Bookmark, Check, ChevronRight, Mail, MapPin, Nfc, RotateCcw, Search, Smartphone, Trophy, UserRound } from "lucide-react";
import { demoCompanies, type DemoCompany, type JourneyStepId } from "./journey-data";
import styles from "./JourneyDemos.module.css";

export { MapDemo } from "./MapDemo";
export { RouteDemo } from "./RouteDemo";

type DemoProps = { reduced: boolean; company: DemoCompany; onNext: (step: JourneyStepId) => void };

function ContinueButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button type="button" className={styles.continue} onClick={onClick}>{children}<ArrowRight size={15} aria-hidden="true" /></button>;
}

export function SearchDemo({ reduced, onSelect }: { reduced: boolean; onSelect: (company: DemoCompany) => void }) {
  const [query, setQuery] = useState(reduced ? "Tecnología" : "");
  const animation = useRef<gsap.core.Timeline | null>(null);
  useLayoutEffect(() => {
    if (reduced) return;
    const timeline = gsap.timeline({ delay: 0.25 });
    ["T", "Tec", "Tecnología"].forEach((text, index) => timeline.call(() => setQuery(text), [], index * 0.22));
    animation.current = timeline;
    return () => { timeline.kill(); animation.current = null; };
  }, [reduced]);
  const normalize = (text: string) => text.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const results = demoCompanies.filter(company => normalize(`${company.name} ${company.category} tecnología ${company.stand}`).includes(normalize(query)));
  return (
    <div>
      <label className={styles.searchField}><Search size={17} aria-hidden="true" /><span className={styles.srOnly}>Buscar empresas</span>
        <input value={query} placeholder="Buscar empresas..." autoComplete="off" onFocus={() => animation.current?.kill()} onChange={event => { animation.current?.kill(); setQuery(event.target.value); }} />
      </label>
      <div className={styles.resultMeta} aria-live="polite">{results.length} empresas de demostración</div>
      <ul className={styles.results}>
        {results.map(company => <li key={company.id}><button type="button" className={styles.result} onClick={() => onSelect(company)}>
          <span className={styles.avatar}>{company.initials}</span><span className={styles.resultCopy}><strong>{company.name}</strong><span>{company.category}</span></span><span className={styles.stand}>{company.stand}</span><ChevronRight size={16} aria-hidden="true" />
        </button></li>)}
      </ul>
      {!results.length && <p className={styles.empty}>No encontramos coincidencias. Prueba con “tecnología” o “Nova”.</p>}
    </div>
  );
}

export function NFCDemo({ reduced, company, onNext }: DemoProps) {
  const root = useRef<HTMLDivElement>(null);
  const [complete, setComplete] = useState(reduced);
  const [run, setRun] = useState(0);
  useLayoutEffect(() => {
    if (reduced) return;
    const context = gsap.context(() => {
      gsap.timeline({ delay: 0.2 })
        .fromTo("[data-phone]", { x: -22, rotate: -6 }, { x: 0, rotate: 0, duration: 0.6, ease: "power2.out" })
        .fromTo("[data-nfc-wave]", { opacity: 0, scale: 0.65 }, { opacity: 0.65, scale: 1, duration: 0.3, stagger: 0.12 }, 0.5)
        .to("[data-nfc-wave]", { opacity: 0, scale: 1.2, duration: 0.3, stagger: 0.12 }, 0.95)
        .call(() => setComplete(true), [], 1.1)
        .fromTo("[data-nfc-points]", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 }, 1.1);
    }, root);
    return () => context.revert();
  }, [reduced, run]);
  return <div ref={root}>
    <div className={styles.nfcStage} aria-hidden="true"><div data-phone className={styles.phone}><Smartphone size={64} strokeWidth={1.5} /><Check size={18} className={styles.phoneCheck} style={{ opacity: complete ? 1 : 0 }} /></div><div className={styles.nfcTarget}><Nfc size={28} />{[0, 1, 2].map(i => <span key={i} data-nfc-wave className={styles.nfcWave} style={{ inset: -8 - i * 8 }} />)}</div><span data-nfc-points className={styles.points}>+25 pts</span></div>
    <p className={styles.feedback} role="status">{complete ? <Check size={17} aria-hidden="true" /> : <Nfc size={17} aria-hidden="true" />}{complete ? "Check-in realizado" : "Acercando el teléfono…"}</p>
    <div className={styles.nfcInfo}><span>{company.name} · Stand {company.stand}</span><button type="button" className={styles.replay} aria-label="Repetir simulación NFC" onClick={() => { setComplete(reduced); setRun(run + 1); }}><RotateCcw size={15} /></button></div>
    <div className={styles.demoNote}>Simulación NFC · No registra una visita real.</div>
    <ContinueButton onClick={() => onNext("reward")}>Ver mi misión</ContinueButton>
  </div>;
}

export function RewardDemo({ reduced, onNext }: DemoProps) {
  const root = useRef<HTMLDivElement>(null);
  const [complete, setComplete] = useState(reduced);
  useLayoutEffect(() => {
    if (reduced) return;
    const context = gsap.context(() => {
      const total = root.current!.querySelector<HTMLElement>("[data-points-total]")!;
      const score = { value: 330 };
      gsap.timeline({ delay: 0.35 })
        .fromTo("[data-progress]", { scaleX: 2 / 3 }, { scaleX: 1, duration: 0.7, ease: "power2.out" })
        .call(() => setComplete(true))
        .to(score, { value: 430, duration: 0.7, ease: "power2.out", onUpdate: () => { total.textContent = String(Math.round(score.value)); } })
        .fromTo("[data-reward-points]", { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25 }, 0.75);
    }, root);
    return () => context.revert();
  }, [reduced]);
  return <div ref={root}>
    <div className={styles.missionLabel}><Trophy size={17} aria-hidden="true" /> MISIÓN DE EXPLORACIÓN</div>
    <h4 className={styles.missionTitle}>Visita 3 stands tecnológicos</h4>
    <div className={styles.progressLabel}><span>Tu recorrido</span><strong>{complete ? "3 / 3" : "2 / 3"}</strong></div>
    <div className={styles.progressTrack} role="progressbar" aria-label="Stands visitados" aria-valuemin={0} aria-valuemax={3} aria-valuenow={complete ? 3 : 2}><span data-progress /></div>
    <div className={styles.rewardStatus}><span role="status">{complete ? <><Check size={16} aria-hidden="true" /> Misión completada</> : "Una visita más para completar"}</span><strong data-reward-points>+100 pts</strong></div>
    <div className={styles.balance}><span>Tu saldo de ejemplo</span><strong><span data-points-total>{reduced ? 430 : 330}</span> <small>pts</small></strong></div>
    <ContinueButton onClick={() => onNext("connect")}>Conectar con la empresa</ContinueButton>
  </div>;
}

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
