import type { KeyboardEvent } from "react";

/** Explicit Tab loop for the accepted modal focus-containment contract (ADR-003). */
export function trapDialogTab(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.defaultPrevented || event.key !== "Tab" || event.ctrlKey || event.altKey || event.metaKey) return;
  const dialog = event.currentTarget;
  const controls = Array.from(dialog.querySelectorAll<HTMLElement>("button,input,textarea,select,a[href],[tabindex]")).filter(element =>
    element.tabIndex >= 0 && !element.matches(":disabled") && !element.closest("[inert]") && element.getClientRects().length > 0 && getComputedStyle(element).visibility === "visible");
  const first = controls[0], last = controls[controls.length - 1];
  if (!first) { event.preventDefault(); dialog.focus(); return; }
  if (!controls.includes(document.activeElement as HTMLElement) || document.activeElement === (event.shiftKey ? first : last)) {
    event.preventDefault(); (event.shiftKey ? last : first).focus();
  }
}
