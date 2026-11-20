"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";

type Tone = "success" | "warning" | "info";

type ToastItem = {
  id: number;
  text: string;
  tone: Tone;
};

function toneFor(text: string): Tone {
  const value = text.toLowerCase();
  if (/fail|could not|invalid|error/.test(value)) return "warning";
  if (/cancel/.test(value)) return "info";
  if (/generat|saved|copied|ready|email|confirm|updated|connected|✓|🎉/.test(value)) return "success";
  return "info";
}

function announce(text: string) {
  const doc = document as Document & { ariaNotify?: (message: string) => void };
  if (typeof doc.ariaNotify === "function") {
    doc.ariaNotify(text);
    return;
  }
  const region = document.getElementById("toast-announcements");
  if (region) region.textContent = text;
}

export function ToastPills({ message, onDone }: { message: string; onDone: () => void }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!message) return;
    const item = { id: nextId.current++, text: message, tone: toneFor(message) };
    setItems((current) => [...current, item]);
    announce(message);
    onDoneRef.current();
  }, [message]);

  function dismiss(id: number, returnFocus?: HTMLElement | null) {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      const next = current.filter((item) => item.id !== id);
      if (returnFocus && document.activeElement && returnFocus.contains(document.activeElement)) {
        const neighbor = next[index] ?? next[index - 1];
        queueMicrotask(() => {
          const button = neighbor
            ? document.getElementById(`toast-close-${neighbor.id}`)
            : null;
          button?.focus();
        });
      }
      return next;
    });
  }

  return (
    <>
      <p className="sr-only">Screen reader announcements</p>
      <div id="toast-announcements" aria-live="polite" className="sr-only" />
      {items.map((item, index) => (
        <ToastPill key={item.id} item={item} index={index} onDismiss={dismiss} />
      ))}
    </>
  );
}

function ToastPill({
  item,
  index,
  onDismiss,
}: {
  item: ToastItem;
  index: number;
  onDismiss: (id: number, returnFocus?: HTMLElement | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;
  const labelId = useId();
  const supportsPopover =
    typeof HTMLElement !== "undefined" && Object.hasOwn(HTMLElement.prototype, "popover");

  useEffect(() => {
    const el = ref.current;
    if (supportsPopover) el?.showPopover();

    let timer = 0;
    const delay = item.tone === "warning" ? 6500 : 4200;
    const closeIfIdle = () => {
      if (el?.contains(document.activeElement)) {
        timer = window.setTimeout(closeIfIdle, 1000);
        return;
      }
      onDismissRef.current(item.id);
    };
    timer = window.setTimeout(closeIfIdle, delay);
    return () => window.clearTimeout(timer);
  }, [item.id, item.tone, supportsPopover]);

  return (
    <div
      ref={ref}
      {...(supportsPopover ? { popover: "manual" as const } : {})}
      role="region"
      aria-label="Notifications"
      className={`toast-pill toast-${item.tone === "warning" ? "warning" : item.tone === "success" ? "success" : "info"}`}
      style={{ top: `calc(1rem + ${index} * 3.4rem)` }}
    >
      <p id={labelId}>{item.text}</p>
      <button
        id={`toast-close-${item.id}`}
        type="button"
        className="toast-pill-close"
        aria-label="Close"
        onClick={(event) => onDismiss(item.id, event.currentTarget.parentElement)}
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
