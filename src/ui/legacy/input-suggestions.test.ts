import { describe, expect, it } from "vitest";
import { inputSuggestions, suggestionKey } from "./input-suggestions";

describe("file-assisted text input", () => {
  it("offers only nonempty exact values within the source entry limit and removes exact duplicates", () => {
    expect(inputSuggestions([null, undefined, "", "Alfa", "Alfa", "ALFA", "Alfazema", "Beta"], "al", 4)).toEqual(["Alfa", "ALFA"]);
    expect(inputSuggestions(["Alfa", "Alfazema"], "al", 0)).toEqual(["Alfa", "Alfazema"]);
  });

  it("requires a nonempty prefix and preserves free-text spaces/case and exact text keys", () => {
    expect(inputSuggestions(["Alfa"], "")).toEqual([]);
    expect(inputSuggestions(["Alfa"], "lf")).toEqual([]);
    expect(inputSuggestions([" Alfa", "ALFA", "Alfa "], "Al")).toEqual(["ALFA", "Alfa "]);
    expect(inputSuggestions(["001", "0 ", " 0"], "0")).toEqual(["001", "0 "]);
    expect(inputSuggestions(["free choice"], "new draft")).toEqual([]);
  });

  it("owns navigation and deliberate acceptance only while choices exist", () => {
    expect(suggestionKey("ArrowDown", 2, -1)).toEqual({ type: "move", index: 0 });
    expect(suggestionKey("ArrowDown", 2, 0)).toEqual({ type: "move", index: 1 });
    expect(suggestionKey("ArrowDown", 2, 1)).toEqual({ type: "move", index: 1 });
    expect(suggestionKey("ArrowUp", 2, -1)).toEqual({ type: "move", index: 1 });
    expect(suggestionKey("ArrowUp", 2, 0)).toEqual({ type: "move", index: 0 });
    expect(suggestionKey("Enter", 2, 1)).toEqual({ type: "accept", index: 1 });
    expect(suggestionKey("Escape", 2, -1)).toEqual({ type: "dismiss" });
    for (const key of ["ArrowDown", "ArrowUp", "Enter", "Escape"]) expect(suggestionKey(key, 0, -1)).toBeNull();
    expect(suggestionKey("Enter", 2, -1)).toBeNull();
    expect(suggestionKey("Tab", 2, 0)).toBeNull();
  });
});
