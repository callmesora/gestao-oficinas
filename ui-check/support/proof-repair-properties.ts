import { expect, type Locator } from "@playwright/test";
import sourceControls from "./proof-repair-controls";

type Unit = keyof typeof sourceControls;
type SourceControl = {name:string;path:string;kind:"Caption"|"Button";x:number;y:number;width:number;height:number;caption:string;id:string;visible?:boolean;anchoring?:string;h_align?:string;tab_order?:number|string;flags:Record<string,boolean>;state?:string;v_align?:string;image?:string;background_image?:string};
function words(value: string) { return new Set(value.toLowerCase().split(/[^a-z]+/)); }
function sourceBounds(control: SourceControl, dw: number, dh: number) {
  const anchor=words(control.anchoring??""), width=anchor.has("width"),height=anchor.has("height");
  return {x:control.x+(anchor.has("right")&&!width?dw:0),y:control.y+(anchor.has("bottom")&&!height?dh:0),width:control.width+(width?dw:0),height:control.height+(height?dh:0)};
}
export async function sourceSimpleControls(screen: Locator, unit: Unit, delta={width:0,height:0}) {
  for(const control of sourceControls[unit] as readonly SourceControl[]) {
    // Tab pages remain mounted; each page is explicitly exposed by the caller before its assertions.
    const field=screen.locator(`[data-control-path="${control.path}"]`).first();
    if(await field.count()===0) throw new Error(`Maintained ${unit}/${control.path} is absent`);
    const actual=await field.evaluate(element=>{const node=element as HTMLElement;return {tag:node.tagName,hidden:node.hidden,tab:node.tabIndex,left:parseFloat(node.style.left),top:parseFloat(node.style.top),width:parseFloat(node.style.width),height:parseFloat(node.style.height),text:node.textContent,align:getComputedStyle(node).textAlign,animation:getComputedStyle(node).animationName,vertical:getComputedStyle(node).alignItems,lineHeight:getComputedStyle(node).lineHeight,editable:node.isContentEditable};});
    const expected=sourceBounds(control,delta.width,delta.height);
    if(control.name==="RADTitle") expected.width=control.width+delta.width;
    expect({x:actual.left,y:actual.top,width:actual.width,height:actual.height},control.id).toEqual(expected);
    expect(actual.hidden,control.id).toBe(control.visible===false);
    expect(actual.editable,control.id).toBe(false);
    expect(actual.animation,control.id).toBe("none");
    if(control.kind==="Caption") {
      expect(actual.tag,control.id).toBe("DIV");expect(actual.text,control.id).toBe(control.caption);
      if(control.name==="RADTitle") expect(actual.lineHeight,control.id).toBe(`${control.height}px`);
      else expect(actual.vertical,control.id).toBe(control.v_align==="Center"?"center":control.v_align==="Bottom"?"end":"start");
      expect(actual.align,control.id).toBe("h_align" in control && control.h_align==="Right"?"right":"h_align" in control && control.h_align==="Center"?"center":"left");
      expect(await field.locator("input,textarea,button,a").count(),control.id).toBe(0);
      // Plain text captions cannot interpret rich text, transform their source mask0, or animate by default.
      expect(await field.locator("script,b,strong,i,em").count(),control.id).toBe(0);
    } else {
      expect(actual.tag,control.id).toBe("BUTTON");await expect(field,control.id).toHaveAttribute("type","button");
      if(control.state==="Active") await expect(field,control.id).toBeEnabled();
      expect(actual.text,control.id).toBe(control.caption.replace(/&(?=.)/g,""));
      const tab=(control.flags as Record<string,boolean>)["TAB Key"];
      expect(actual.tab,control.id).toBe(tab===false||String(control.tab_order)==="-1"?-1:0);
      if("image" in control) { await expect(field.locator(".wd-button-icon"),control.id).toHaveCount(1); expect(await field.evaluate(element=>getComputedStyle(element).getPropertyValue("--wd-icon-0")),control.id).toContain(control.image!.replace(/\.[^.]+$/, "")); }
      if("background_image" in control) expect(await field.evaluate(element=>getComputedStyle(element).getPropertyValue("--wd-background-0")),control.id).toContain(control.background_image!.replace(/\.[^.]+$/, ""));
    }
  }
}
export { sourceControls };
