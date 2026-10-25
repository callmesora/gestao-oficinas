import type { ComponentProps, CSSProperties } from "react";
import { useAnchoredControl } from "./anchors";
import { controlBox, controlOf, type LegacyControl, type LegacyLayout } from "./layout";
import { WdButton, WdCheckbox, WdEdit, WdRadio } from "./wd";

/** Structure is metadata-driven; callers explicitly own field values, events and traversal order. */
export type WdRadBinding = { name: string } & (
  | { kind: "edit"; props: Omit<ComponentProps<typeof WdEdit>, "control"> }
  | { kind: "checkbox"; props: Omit<ComponentProps<typeof WdCheckbox>, "control"> }
  | { kind: "radio"; props: Omit<ComponentProps<typeof WdRadio>, "control"> }
  | { kind: "button"; props: Omit<ComponentProps<typeof WdButton>, "control"> }
  | { kind: "caption"; props?: never }
  | { kind: "shape"; props: { backgroundColor: CSSProperties["backgroundColor"] } }
);
const sourceKinds = { edit: "Edit control", checkbox: "Check Box", radio: "RadioButton", button: "Button", caption: "Caption", shape: "Shape" } as const;

export function resolveRadBindings(layout: LegacyLayout, bindings: readonly WdRadBinding[]) {
  const seen = new Set<string>();
  return bindings.map(binding => {
    const control = controlOf(layout, binding.name);
    if (seen.has(control.path)) throw new Error(`RAD control bound twice: ${control.path}`);
    seen.add(control.path);
    if (control.kind !== sourceKinds[binding.kind]) throw new Error(`RAD kind mismatch: ${control.path} (${control.kind}, ${binding.kind})`);
    return { binding, control };
  });
}

function RadStatic({ source, kind, backgroundColor }: { source: LegacyControl; kind: "caption" | "shape"; backgroundColor?: CSSProperties["backgroundColor"] }) {
  const control = useAnchoredControl(source);
  return <div className={`wd-rad-${kind}`} data-testid={control.name} data-control-path={control.path}
    hidden={control.visible === false} style={{ ...controlBox(control), backgroundColor }}>{kind === "caption" ? control.caption : null}</div>;
}

export function WdRadControls({ layout, bindings }: { layout: LegacyLayout; bindings: readonly WdRadBinding[] }) {
  return resolveRadBindings(layout, bindings).map(({ binding, control }) => {
    switch (binding.kind) {
      case "edit": return <WdEdit key={control.path} control={control} {...binding.props} />;
      case "checkbox": return <WdCheckbox key={control.path} control={control} {...binding.props} />;
      case "radio": return <WdRadio key={control.path} control={control} {...binding.props} />;
      case "button": return <WdButton key={control.path} control={control} {...binding.props} />;
      case "caption": return <RadStatic key={control.path} source={control} kind="caption" />;
      case "shape": return <RadStatic key={control.path} source={control} kind="shape" {...binding.props} />;
    }
  });
}
