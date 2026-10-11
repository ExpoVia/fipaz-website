"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ChevronRight, LoaderCircle, Search, SearchX, X } from "lucide-react";
import { demoCompanies, type DemoCompany } from "./journey-data";
import styles from "./SearchDemo.module.css";

const DEMO_QUERY = "Tecnología";
const SUGGESTIONS = ["Tecnología", "Hardware", "IA y Datos", "Gaming"];
// How long the query must rest before results refresh; in between the demo shows "Buscando…".
const SETTLE_MS = 220;

const fold = (text: string) => text.toLocaleLowerCase("es").normalize("NFD").replace(/[̀-ͯ]/g, "");

function matches(company: DemoCompany, query: string) {
  const needle = fold(query.trim());
  return !needle || fold(`${company.name} ${company.category} ${company.tags.join(" ")} ${company.stand}`).includes(needle);
}

/** Marks the first occurrence of the query. Matching ignores case and accents, so positions are mapped back to the original text. */
function Highlight({ text, query }: { text: string; query: string }) {
  const needle = fold(query.trim());
  const chars = Array.from(text);
  let folded = "";
  const origin: number[] = [];
  chars.forEach((char, index) => {
    const piece = fold(char);
    for (let step = 0; step < piece.length; step++) origin.push(index);
    folded += piece;
  });
  const at = needle ? folded.indexOf(needle) : -1;
  if (at < 0) return <>{text}</>;
  const start = origin[at];
  const end = origin[at + needle.length - 1] + 1;
  return <>{chars.slice(0, start).join("")}<mark>{chars.slice(start, end).join("")}</mark>{chars.slice(end).join("")}</>;
}

type TypeOptions = { speed?: number; delay?: number; pauseAfter?: number; pause?: number };

/** Types `term` one character at a time. `pauseAfter` (0-based) adds a beat after that character, like someone thinking. */
function typeInto(term: string, setQuery: (value: string) => void, setAuto: (value: boolean) => void, { speed = 0.1, delay = 0, pauseAfter = -1, pause = 0 }: TypeOptions = {}) {
  const chars = Array.from(term);
  const timeline = gsap.timeline({ delay });
  let time = 0;
  chars.forEach((_, index) => {
    timeline.call(() => setQuery(chars.slice(0, index + 1).join("")), [], time);
    time += speed + (index === pauseAfter ? pause : 0);
  });
  timeline.call(() => setAuto(false), [], time + 0.15);
  return timeline;
}

export function SearchDemo({ reduced, onSelect }: { reduced: boolean; onSelect: (company: DemoCompany) => void }) {
  const [query, setQuery] = useState(reduced ? DEMO_QUERY : "");
  const [settled, setSettled] = useState(reduced ? DEMO_QUERY : "");
  const [auto, setAuto] = useState(!reduced);
  const [focused, setFocused] = useState(false);
  const typing = useRef<gsap.core.Timeline | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const searching = query !== settled;
  const results = demoCompanies.filter(company => matches(company, settled));
  const stopTyping = () => { typing.current?.kill(); typing.current = null; setAuto(false); };

  // The demo types a search on its own, pausing mid-word, until the visitor takes over.
  useLayoutEffect(() => {
    if (reduced) return;
    typing.current = typeInto(DEMO_QUERY, setQuery, setAuto, { delay: 0.45, speed: 0.11, pauseAfter: 2, pause: 0.5 });
    return () => { typing.current?.kill(); typing.current = null; };
  }, [reduced]);

  // Results refresh once the query settles.
  useEffect(() => {
    if (query === settled) return;
    const timer = setTimeout(() => setSettled(query), reduced ? 0 : SETTLE_MS);
    return () => clearTimeout(timer);
  }, [query, settled, reduced]);

  // New results slide in one after another.
  useLayoutEffect(() => {
    if (reduced || !list.current) return;
    const tween = gsap.fromTo(list.current.children, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.32, stagger: 0.06, ease: "power2.out", clearProps: "transform,opacity" });
    return () => { tween.kill(); };
  }, [settled, reduced]);

  const suggest = (term: string) => {
    typing.current?.kill();
    setFocused(false);
    setQuery("");
    setAuto(true);
    typing.current = reduced ? null : typeInto(term, setQuery, setAuto, { speed: 0.05, delay: 0.08 });
    if (reduced) { setQuery(term); setAuto(false); }
  };
  const clear = () => { stopTyping(); setQuery(""); input.current?.focus(); };

  const count = results.length;
  const needle = settled.trim();

  return <div className={styles.root}>
    <label className={styles.field} data-typing={auto || focused} data-searching={searching}>
      <Search size={18} aria-hidden="true" />
      <span className={styles.srOnly}>Buscar empresas</span>
      <span className={styles.inputWrap}>
        <input ref={input} className={styles.input} value={query} placeholder="Busca empresas, rubros o stands…" autoComplete="off" spellCheck={false}
          onFocus={() => { stopTyping(); setFocused(true); }} onBlur={() => setFocused(false)}
          onChange={event => { stopTyping(); setQuery(event.target.value); }} />
        {auto && !focused && <span className={styles.ghost} aria-hidden="true"><span>{query}</span><i className={styles.caret} /></span>}
      </span>
      {searching ? <LoaderCircle className={styles.spin} size={17} aria-label="Buscando" role="img" /> : query && <button type="button" className={styles.clear} onClick={clear} aria-label="Borrar búsqueda"><X size={14} aria-hidden="true" /></button>}
      <span className={styles.bar} data-active={searching} aria-hidden="true" />
    </label>

    <div className={styles.chips} role="group" aria-label="Búsquedas sugeridas">
      {SUGGESTIONS.map(term => <button type="button" className={styles.chip} key={term} aria-pressed={fold(settled.trim()) === fold(term)} onClick={() => suggest(term)}>{term}</button>)}
    </div>

    <div className={styles.meta} aria-live="polite">
      {searching ? <span>Buscando<span className={styles.dots} aria-hidden="true" /></span>
        : needle ? <span><strong>{count}</strong> {count === 1 ? "resultado" : "resultados"} para “{needle}”</span>
        : <span><strong>{count}</strong> empresas destacadas</span>}
    </div>

    {count > 0 ? <ul ref={list} className={styles.list} data-searching={searching}>
      {results.map((company, index) => <li key={company.id}>
        <button type="button" className={styles.result} style={{ "--tint": company.tint, "--ink": company.ink } as CSSProperties} onClick={() => onSelect(company)}>
          <span className={styles.avatar}>{company.initials}</span>
          <span className={styles.copy}>
            <strong><span><Highlight text={company.name} query={settled} /></span>{index === 0 && needle && <em>Mejor resultado</em>}</strong>
            <span><Highlight text={company.category} query={settled} /></span>
          </span>
          <span className={styles.stand}><Highlight text={company.stand} query={settled} /></span>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </li>)}
    </ul> : <div className={styles.empty}><SearchX size={22} aria-hidden="true" /><p>Sin coincidencias para “{needle}”.<br />Prueba con “Tecnología” o “Nova”.</p></div>}
  </div>;
}
