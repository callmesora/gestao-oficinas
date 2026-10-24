import { useId, type ButtonHTMLAttributes, type CSSProperties, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { buttonSkin, controlBox, controlOf, skinImage, type LegacyControl, type LegacyLayout } from "./layout";
import "./skin.css";
import { activateMnemonic, mnemonicCaption } from "./mnemonics";
import { FrameDeltaContext, useAnchoredControl } from "./anchors";

type ButtonProps = { control: LegacyControl; chrome?: boolean; interpretAmpersand?: boolean; style?: CSSProperties } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "type">;
export function WdButton({ control: source, chrome = false, interpretAmpersand = true, style, className = "", tabIndex, ...props }: ButtonProps) {
  const control = useAnchoredControl(source);
  const caption = mnemonicCaption(interpretAmpersand && !chrome ? control.caption ?? "" : "");
  return <button {...props} type="button" data-testid={control.name} data-control-path={control.path}
    data-wd-mnemonic={caption.letter ? caption.letter.toLocaleLowerCase("pt-PT") : undefined}
    aria-keyshortcuts={props["aria-keyshortcuts"] ?? (caption.letter ? `Alt+${caption.letter}` : undefined)}
    hidden={props.hidden ?? control.visible === false} tabIndex={String(control.tab_order) === "-1" ? -1 : tabIndex}
    className={`wd-button ${chrome ? "wd-chrome-button" : ""} ${className}`}
    style={{ ...controlBox(control), ...buttonSkin(control), ...style }}>
    {!chrome && <span>{!interpretAmpersand ? control.caption : <>{caption.before}{caption.letter && <u>{caption.letter}</u>}{caption.after}</>}</span>}
    {control.image && <span className="wd-button-icon" aria-hidden="true" />}
  </button>;
}

export function WdFrame({ layout, instance, children, width, height, onClose, onMinimize, onToggleMaximize }: {
  layout: LegacyLayout; instance: string; children: ReactNode; width?: number; height?: number;
  onClose: () => void; onMinimize: () => void; onToggleMaximize: () => void;
}) {
  const size = layout.window.size;
  if (!size || !layout.window.background_image) throw new Error(`Frame metadata unresolved: ${layout.window.name}`);
  const title = controlOf(layout, "RADTitle");
  const buttons = [
    { name: "BTN_SYST_MINIMIZE", label: "Minimizar", action: onMinimize },
    { name: "BTN_Syst_Maximize", label: "Maximizar/restaurar", action: onToggleMaximize },
    { name: "BTN_SYST_FERMER", label: "Fechar", action: onClose },
  ];
  const frameWidth = width ?? size.width;
  const frameHeight = height ?? size.height;
  const skin = { "--wd-frame": `url("${skinImage(layout.window.background_image)}")` } as CSSProperties;
  return <section data-testid={instance} data-layout={layout.window.name} aria-label={title.caption ?? layout.window.title ?? undefined}
    data-wd-keyboard-scope="" tabIndex={-1} onKeyDown={activateMnemonic}
    className="wd-frame" style={{ ...skin, width: frameWidth, height: frameHeight }}>
    <div className="wd-client">
      <div className="wd-title" data-testid={title.name} style={{ ...controlBox(title), width: (title.width ?? 0) + frameWidth - size.width }}>{title.caption}</div>
      {buttons.map(button => {
        const control = controlOf(layout, button.name);
        return <WdButton key={control.path} control={control} chrome aria-label={button.label} onClick={button.action}
          style={{ left: undefined, right: size.width - control.x - (control.width ?? 0) }} />;
      })}
      <FrameDeltaContext.Provider value={{ width: frameWidth - size.width, height: frameHeight - size.height }}>{children}</FrameDeltaContext.Provider>
    </div>
  </section>;
}

export function WdEdit({ control: source, ...props }: { control: LegacyControl } & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "style" | "className" | "id">) {
  const control = useAnchoredControl(source);
  const id = useId();
  const captionWidth = control.caption_width ?? 0;
  return <div className="wd-field" hidden={props.hidden ?? control.visible === false} data-control-path={control.path} style={controlBox(control)}>
    {captionWidth > 0 && <label htmlFor={id} style={{ width: captionWidth - 2 }}>{control.caption}</label>}
    <input {...props} id={id} type="text" data-testid={control.name} className="wd-edit"
      readOnly={props.readOnly ?? control.state === "Read-only"}
      aria-label={captionWidth ? undefined : props["aria-label"] ?? control.caption ?? control.name}
      style={{ left: captionWidth, width: (control.width ?? 0) - captionWidth, textAlign: control.h_align === "Right" ? "right" : "left" } as CSSProperties} />
  </div>;
}

export function WdMemo({ control: source, ...props }: { control: LegacyControl } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "style" | "className" | "id">) {
  const control = useAnchoredControl(source);
  const id = useId();
  const captionWidth = control.caption_width ?? 0;
  return <div className="wd-field wd-memo-field" hidden={props.hidden ?? control.visible === false} data-control-path={control.path} style={controlBox(control)}>
    {captionWidth > 0 && <label htmlFor={id} style={{ width: captionWidth - 2 }}>{control.caption}</label>}
    <textarea {...props} id={id} data-testid={control.name} className="wd-edit wd-memo"
      readOnly={props.readOnly ?? control.state === "Read-only"}
      aria-label={captionWidth ? undefined : props["aria-label"] ?? control.caption ?? control.name}
      style={{ left: captionWidth, width: (control.width ?? 0) - captionWidth }} />
  </div>;
}
