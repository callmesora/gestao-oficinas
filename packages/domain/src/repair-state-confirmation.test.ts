import { expect, it } from "vitest";
import { repairStateConfirmationPrompt, repairStatePrefixMatches } from "./repair-state-confirmation";

it("SRC-deff9a0792 preserves the exact dynamic prompt, quotes and untrimmed state", () => {
  expect(repairStateConfirmationPrompt("Em Reparação")).toBe("Mudar estado da reparação para 'Em Reparação'?");
  expect(repairStateConfirmationPrompt(" d'Água  ")).toBe("Mudar estado da reparação para ' d'Água  '?");
  expect(repairStateConfirmationPrompt("")).toBe("Mudar estado da reparação para ''?");
});

it("SRC-107f49bb66 matches a case-insensitive leading prefix without trim, membership or accent folding", () => {
  for (const [state, letter] of [["Em Reparação", "e"], ["em Reparação", "E"], ["Á espera", "á"], ["á espera", "Á"], [" Em Reparação", " "], ["d'Água", "D"], ["Em Reparação", "EM"]]) {
    expect(repairStatePrefixMatches(state, letter)).toBe(true);
  }
  for (const [state, letter] of [["Em Reparação", "r"], [" Em Reparação", "e"], ["Em Reparação", " "], ["Á espera", "a"], ["A espera", "á"], ["", "e"]]) {
    expect(repairStatePrefixMatches(state, letter)).toBe(false);
  }
});

it("RULE-W20AB1F-005 ADR-006 safe default refuses empty prefix and NULL state without claiming native equivalence", () => {
  for (const state of [null, "", "Em Reparação"]) expect(repairStatePrefixMatches(state, "")).toBe(false);
  expect(repairStatePrefixMatches(null, "e")).toBe(false);
  expect(repairStateConfirmationPrompt(null)).toBe("Mudar estado da reparação para ''?");
});
