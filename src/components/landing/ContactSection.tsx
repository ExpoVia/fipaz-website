"use client";

import React, { useRef, useState } from "react";
import { gsap } from "gsap";
import { CheckCircle2, Loader2, Mail, Send, TriangleAlert } from "lucide-react";
import { pixelifyFont } from "./fonts";
import { UI_OUT, revealHeading, useScrollFx } from "./scroll-fx";
import fx from "./landing-fx.module.css";

const CONTACT_EMAIL = "quispevargasomar@gmail.com";
/**
 * Where the form goes. With NEXT_PUBLIC_CONTACT_ENDPOINT (the Google Apps Script web app in docs/contact-form-apps-script.md)
 * every message becomes a row in a Google Sheet plus an email. Without it, FormSubmit delivers straight to CONTACT_EMAIL;
 * its first submission asks the owner of the inbox to confirm once.
 */
const SCRIPT_ENDPOINT =
  process.env.NEXT_PUBLIC_CONTACT_ENDPOINT?.trim() ||
  // Public by design (the visitor's browser calls it) and it only appends rows, so it ships in the code: the hosting
  // account does not have to define the variable. Set NEXT_PUBLIC_CONTACT_ENDPOINT to override it.
  "https://script.google.com/macros/s/AKfycbwTEczsYU_WL-gvyYRrVtLNbTP_U38OWTiPy23aHKVJqMwhKbfEulpNsnBW99ss-CeY/exec";
const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;

const roles = ["Visitante", "Expositor", "Organizador", "Otro"] as const;

type Status = "idle" | "sending" | "sent" | "error";

const fieldClass =
  "w-full rounded-xl border-2 border-[var(--expo-navy)] bg-white px-4 py-3 text-[var(--expo-navy)] transition-[border-color,box-shadow] duration-150 placeholder:text-slate-400 hover:border-[var(--expo-blue)] focus:border-[var(--expo-blue)] focus:shadow-[3px_3px_0_var(--expo-blue)] focus:outline-none";

/** The intro lands first, then the plate rises into place; nothing here owns a hover. */
function playContact(root: HTMLElement) {
  const heading = root.querySelector<HTMLElement>("[data-fx-heading]");
  const stopHeading = heading ? revealHeading(heading) : undefined;

  gsap.from(root.querySelectorAll("[data-fx-intro]"), {
    y: 22,
    opacity: 0,
    duration: 0.7,
    ease: UI_OUT,
    stagger: 0.08,
    delay: 0.1,
    clearProps: "all",
    scrollTrigger: { trigger: root, start: "top 78%", once: true },
  });

  const plate = root.querySelector<HTMLElement>("[data-fx-plate]");
  if (plate) {
    gsap.from(plate, {
      y: 56,
      opacity: 0,
      duration: 0.9,
      ease: UI_OUT,
      clearProps: "all",
      scrollTrigger: { trigger: plate, start: "top 90%", once: true },
    });
  }

  return stopHeading;
}

export function ContactSection() {
  const root = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [failedBody, setFailedBody] = useState("");
  useScrollFx(root, playContact);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    // Honeypot: people never see this field, so anything in it is a bot.
    if (String(data.get("_honey") ?? "").trim()) return;

    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      organization: String(data.get("organization") ?? "").trim(),
      role: String(data.get("role") ?? "No indicado"),
      message: String(data.get("message") ?? "").trim(),
      _subject: `Contacto desde la landing de Fexpo — ${String(data.get("name") ?? "").trim()}`,
      _template: "table",
      _captcha: "false",
    };

    setStatus("sending");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      // Apps Script cannot answer a CORS preflight, so its request must stay "simple": text/plain, JSON in the body.
      const response = await fetch(SCRIPT_ENDPOINT || FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: SCRIPT_ENDPOINT
          ? { "Content-Type": "text/plain;charset=utf-8" }
          : { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const result = (await response.json().catch(() => ({}))) as { success?: boolean | string; ok?: boolean; message?: string; error?: string };
      const rejected = SCRIPT_ENDPOINT ? result.ok !== true : result.success === false || result.success === "false";
      if (!response.ok || rejected) throw new Error(result.message || result.error || `delivery failed (${response.status})`);
      form.reset();
      setStatus("sent");
    } catch (error) {
      // The visitor gets the generic message; the reason (e.g. the form still needs activating) goes to the console.
      console.warn("[contacto] No se pudo entregar el mensaje:", error);
      setFailedBody(
        `Nombre: ${payload.name}\nCorreo: ${payload.email}\nOrganización: ${payload.organization || "—"}\nSoy: ${payload.role}\n\n${payload.message}`,
      );
      setStatus("error");
    } finally {
      window.clearTimeout(timeout);
    }
  }

  const sending = status === "sending";

  return (
    <section
      ref={root}
      id="escribenos"
      className="relative scroll-mt-24 overflow-hidden border-t-2 border-[var(--expo-line)] bg-[var(--expo-bg)] py-20 md:py-28"
    >
      <div aria-hidden="true" className={`${fx.dots} absolute inset-0 opacity-70`} />

      <div className="relative mx-auto grid max-w-7xl items-start gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div className="lg:col-span-5 lg:pt-6">
          <h2
            data-fx-heading
            className={`${pixelifyFont.className} text-4xl leading-[1.15] font-bold tracking-tight text-balance text-[var(--expo-navy)] sm:text-5xl`}
          >
            Hablemos de tu próxima feria.
          </h2>

          <p data-fx-intro className="mt-6 max-w-md text-base font-medium text-slate-600 sm:text-lg">
            Cuéntanos quién eres y qué necesitas. Leemos cada mensaje y te respondemos por correo.
          </p>

          <a
            data-fx-intro
            href={`mailto:${CONTACT_EMAIL}`}
            className={`${fx.underline} mt-8 inline-flex items-center gap-2.5 text-[var(--expo-navy)] transition-colors duration-150 hover:text-[var(--expo-blue)]`}
          >
            <Mail aria-hidden="true" className="h-5 w-5 shrink-0" />
            <span className="text-sm font-black break-all sm:text-base">{CONTACT_EMAIL}</span>
          </a>
        </div>

        <div data-fx-plate className="lg:col-span-7">
          <div className="rounded-3xl border-3 border-[var(--expo-navy)] bg-white p-6 shadow-[9px_9px_0_var(--expo-navy)] sm:p-8">
            {status === "sent" ? (
              <div role="status" className="flex flex-col items-start gap-5 py-6">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-3 border-[var(--expo-navy)] bg-[var(--expo-mint)] shadow-[3px_3px_0_var(--expo-navy)]">
                  <CheckCircle2 aria-hidden="true" className="h-8 w-8 text-[var(--expo-navy)]" />
                </span>
                <div>
                  <p className={`${pixelifyFont.className} text-3xl font-bold text-[var(--expo-navy)]`}>Mensaje enviado.</p>
                  <p className="mt-2 max-w-md text-base font-medium text-slate-600">
                    Gracias por escribirnos. Te responderemos al correo que dejaste.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className={`${fx.slab} ${fx.press} inline-flex items-center border-2 border-[var(--expo-navy)] bg-white px-5 py-2.5 text-[var(--expo-navy)] [--slab-lift:2px] [--slab-offset:4px] hover:bg-[var(--expo-bg)]`}
                >
                  <span className="text-sm font-extrabold">Enviar otro mensaje</span>
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} aria-busy={sending} className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label htmlFor="contact-name" className="text-sm font-black text-[var(--expo-navy)]">
                      Nombre
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      maxLength={80}
                      placeholder="Tu nombre"
                      disabled={sending}
                      className={fieldClass}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="contact-email" className="text-sm font-black text-[var(--expo-navy)]">
                      Correo
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      maxLength={120}
                      placeholder="tu@correo.com"
                      disabled={sending}
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="contact-organization" className="text-sm font-black text-[var(--expo-navy)]">
                    Empresa u organización <span className="font-medium text-slate-500">(opcional)</span>
                  </label>
                  <input
                    id="contact-organization"
                    name="organization"
                    type="text"
                    autoComplete="organization"
                    maxLength={100}
                    placeholder="Nombre de tu empresa o feria"
                    disabled={sending}
                    className={fieldClass}
                  />
                </div>

                <fieldset className="grid gap-2" disabled={sending}>
                  <legend className="mb-2 text-sm font-black text-[var(--expo-navy)]">
                    Soy <span className="font-medium text-slate-500">(opcional)</span>
                  </legend>
                  <div className="flex flex-wrap gap-2.5">
                    {roles.map((role) => (
                      <label key={role} className="relative cursor-pointer">
                        <input type="radio" name="role" value={role} className="peer sr-only" />
                        <span className="block rounded-full border-2 border-[var(--expo-navy)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--expo-navy)] transition-[background-color,box-shadow] duration-150 peer-checked:bg-[var(--expo-yellow)] peer-checked:shadow-[2px_2px_0_var(--expo-navy)] peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--expo-blue)] hover:bg-[var(--expo-bg)]">
                          {role}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="grid gap-2">
                  <label htmlFor="contact-message" className="text-sm font-black text-[var(--expo-navy)]">
                    Mensaje
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    minLength={10}
                    maxLength={1500}
                    rows={5}
                    placeholder="¿En qué podemos ayudarte?"
                    disabled={sending}
                    className={`${fieldClass} resize-y`}
                  />
                </div>

                {/* Honeypot: hidden from people and assistive tech, bots fill it. */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label>
                    No completar
                    <input type="text" name="_honey" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>

                <div aria-live="polite" className="empty:hidden">
                  {status === "error" && (
                    <p
                      role="alert"
                      className="flex items-start gap-2.5 rounded-xl border-2 border-[var(--expo-coral)] bg-[var(--expo-coral)]/10 px-4 py-3 text-sm font-bold text-[var(--expo-navy)]"
                    >
                      <TriangleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--expo-coral)]" />
                      <span>
                        No pudimos enviar tu mensaje. Inténtalo de nuevo o{" "}
                        <a
                          href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Contacto desde la landing de Fexpo")}&body=${encodeURIComponent(failedBody)}`}
                          className="underline underline-offset-2 hover:text-[var(--expo-blue)]"
                        >
                          escríbenos desde tu correo
                        </a>
                        .
                      </span>
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
                  <button
                    type="submit"
                    disabled={sending}
                    className={`${fx.slab} ${fx.press} inline-flex items-center gap-3 border-3 border-[var(--expo-navy)] bg-[var(--expo-yellow)] px-7 py-3.5 text-[var(--expo-navy)] [--slab-offset:5px] hover:bg-[#FFE066] disabled:cursor-progress disabled:opacity-70`}
                  >
                    <span className="text-base font-black">{sending ? "Enviando…" : "Enviar mensaje"}</span>
                    {sending ? (
                      <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin motion-reduce:animate-none" />
                    ) : (
                      <Send aria-hidden="true" className="h-5 w-5 stroke-[2.5]" />
                    )}
                  </button>
                  <p className="text-xs font-medium text-slate-500">Solo usamos tus datos para responderte.</p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
