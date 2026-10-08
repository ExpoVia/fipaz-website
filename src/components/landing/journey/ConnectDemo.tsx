"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { BookmarkCheck, Bookmark, CalendarCheck, Handshake, Mail, MapPin } from "lucide-react";
import type { DemoCompany } from "./journey-data";
import styles from "./ConnectDemo.module.css";

type ConnectDemoProps = { reduced: boolean; company: DemoCompany; saved: boolean; onSave: () => void };
type Message = { id: number; from: "them" | "me"; text: string };

const CONTACT = { name: "María López", role: "Business Development", initials: "ML" };
const QUICK = [
  { id: "info", text: "Quiero más información", reply: "¡Claro! Te comparto nuestro portafolio y una demo corta." },
  { id: "meet", text: "Agendemos una reunión", reply: "Perfecto. ¿Qué horario te acomoda mejor?" },
  { id: "catalog", text: "Envíame el catálogo", reply: "Listo, te lo envío a tu perfil de Fexpo en unos minutos." },
] as const;
const SLOTS = ["Mañana 10:00", "Mañana 15:30"];
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export function ConnectDemo({ reduced, company, saved, onSave }: ConnectDemoProps) {
  const greeting = `¡Hola! Soy María de ${company.name}. Gracias por pasar por el stand ${company.stand}.`;
  const nextId = useRef(1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const list = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>(reduced ? [{ id: 0, from: "them", text: greeting }] : []);
  const [typing, setTyping] = useState(!reduced);
  const [used, setUsed] = useState<string[]>([]);
  const [slotsOpen, setSlotsOpen] = useState(false);
  const [meeting, setMeeting] = useState<string | null>(null);
  const [contactVisible, setContactVisible] = useState(false);

  const later = (callback: () => void, delay: number) => { timers.current.push(setTimeout(callback, reduced ? 0 : delay)); };
  const push = (from: Message["from"], text: string) => setMessages(current => [...current, { id: nextId.current++, from, text }]);

  // The contact greets first, after a moment of "typing".
  useEffect(() => {
    if (reduced) return;
    const timer = setTimeout(() => {
      setTyping(false);
      setMessages(current => [...current, { id: nextId.current++, from: "them", text: greeting }]);
    }, 1100);
    return () => clearTimeout(timer);
  }, [reduced, greeting]);

  // Keep the newest message in view and animate it in.
  useLayoutEffect(() => {
    const element = list.current;
    if (!element) return;
    element.scrollTo({ top: element.scrollHeight, behavior: reduced ? "auto" : "smooth" });
    const last = element.querySelector<HTMLElement>("[data-bubble]:last-of-type");
    if (reduced || !last) return;
    const tween = gsap.fromTo(last, { y: 10, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "power2.out", clearProps: "transform,opacity" });
    return () => { tween.kill(); };
  }, [messages.length, typing, reduced]);

  // Saving pops the bookmark.
  const bookmark = useRef<HTMLSpanElement>(null);
  const firstRender = useRef(true);
  useLayoutEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (reduced || !bookmark.current) return;
    const tween = gsap.fromTo(bookmark.current, { scale: 0.5, rotation: -20 }, { scale: 1, rotation: 0, duration: 0.45, ease: "back.out(3)" });
    return () => { tween.kill(); };
  }, [saved, reduced]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const send = (text: string, reply: string, after?: () => void) => {
    push("me", text);
    setTyping(true);
    later(() => { setTyping(false); push("them", reply); after?.(); }, 1000);
  };
  const choose = (option: (typeof QUICK)[number]) => {
    if (typing) return;
    setUsed(current => [...current, option.id]);
    send(option.text, option.reply, option.id === "meet" ? () => setSlotsOpen(true) : undefined);
  };
  const book = (slot: string) => {
    if (typing) return;
    setSlotsOpen(false);
    send(`${slot} está bien`, "¡Agendado! Te llegará un recordatorio antes de la reunión.", () => setMeeting(slot));
  };

  const options = slotsOpen ? [] : QUICK.filter(option => !used.includes(option.id));
  const email = `maria@${company.id}.example`;
  const tags = (company.tags as readonly string[]).slice(0, 3);

  return <div className={styles.root} style={{ "--tint": company.tint, "--ink": company.ink } as CSSProperties}>
    <div className={styles.grid}>
      <section className={styles.profile} aria-label={`Perfil de ${company.name}`}>
        <div className={styles.cover}>
          <span className={styles.logo}>{company.initials}</span>
          <div className={styles.name}><h4>{company.name}</h4><p>{company.category}</p></div>
          <span className={styles.connected}><Handshake size={13} aria-hidden="true" /> Conectando</span>
        </div>
        <div className={styles.meta}>
          <span className={styles.stand}><MapPin size={12} aria-hidden="true" /> Stand {company.stand}</span>
          {meeting
            ? <span className={styles.meeting}><CalendarCheck size={12} aria-hidden="true" /> {meeting}</span>
            : tags.map(tag => <span className={styles.tag} key={tag}>{capitalize(tag)}</span>)}
        </div>
        <div className={styles.contact}>
          <span className={styles.person}>{CONTACT.initials}<i aria-hidden="true" /></span>
          <span className={styles.contactText}>
            <strong>{CONTACT.name}</strong>
            <small>{contactVisible ? <><Mail size={11} aria-hidden="true" /> {email}</> : CONTACT.role}</small>
          </span>
          <span className={styles.sample}>Ejemplo</span>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.save} onClick={onSave} aria-pressed={saved}>
            <span ref={bookmark} className={styles.bookmark}>{saved ? <BookmarkCheck size={15} aria-hidden="true" /> : <Bookmark size={15} aria-hidden="true" />}</span>
            {saved ? "Empresa guardada" : "Guardar empresa"}
          </button>
          <button type="button" className={styles.ghost} aria-expanded={contactVisible} onClick={() => setContactVisible(value => !value)}>{contactVisible ? "Ocultar" : "Ver contacto"}</button>
        </div>
      </section>

      <section className={styles.chat} aria-label="Conversación de ejemplo">
        <header className={styles.chatHead}>
          <span className={styles.person}>{CONTACT.initials}<i aria-hidden="true" /></span>
          <span className={styles.chatTitle}><strong>{CONTACT.name}</strong><small>{typing ? "escribiendo…" : "en línea"}</small></span>
        </header>
        <div ref={list} className={styles.messages} role="log" aria-live="polite">
          {messages.map(message => <p key={message.id} className={styles.bubble} data-bubble data-from={message.from}>{message.text}</p>)}
          {typing && <p className={styles.bubble} data-bubble data-from="them" data-typing aria-label="María está escribiendo"><span className={styles.dots} aria-hidden="true"><i /><i /><i /></span></p>}
        </div>
        <div className={styles.quick}>
          {options.map(option => <button type="button" className={styles.chip} key={option.id} onClick={() => choose(option)} disabled={typing}>{option.text}</button>)}
          {slotsOpen && SLOTS.map(slot => <button type="button" className={styles.chip} data-slot key={slot} onClick={() => book(slot)} disabled={typing}><CalendarCheck size={12} aria-hidden="true" /> {slot}</button>)}
          {!options.length && !slotsOpen && <span className={styles.done}>{saved ? "Guardada en esta demo. Podrás consultarla desde tu perfil." : "Guarda la empresa para continuar la conversación."}</span>}
        </div>
      </section>
    </div>
  </div>;
}
