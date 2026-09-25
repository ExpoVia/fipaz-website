"use client";

import { useSyncExternalStore } from "react";

import { MOCK_STORAGE_PREFIX, readSession, writeSession } from "./mock-storage";

const FAILURE_KEY = `${MOCK_STORAGE_PREFIX}simulate-failure`;

const listeners = new Set<() => void>();
let failureEnabled: boolean | null = null;

/** ¿Deben fallar las solicitudes simuladas? Permite demostrar los estados de error. */
export function isMockFailureEnabled(): boolean {
  if (failureEnabled === null) failureEnabled = readSession(FAILURE_KEY) === "1";
  return failureEnabled;
}

export function setMockFailureEnabled(value: boolean): void {
  failureEnabled = value;
  writeSession(FAILURE_KEY, value ? "1" : "0");
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useMockFailureEnabled(): boolean {
  return useSyncExternalStore(subscribe, isMockFailureEnabled, () => false);
}
