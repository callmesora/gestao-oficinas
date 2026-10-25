import { expect, test } from "@playwright/test";

// Literal actions from WIN_WIN_Teclado.wdw:55–1441, not the target dispatch map.
const alphaKeys = [
  ["BTN_0", "0"], ["BTN_1", "1"], ["BTN_2", "2"], ["BTN_3", "3"], ["BTN_4", "4"],
  ["BTN_5", "5"], ["BTN_6", "6"], ["BTN_7", "7"], ["BTN_8", "8"], ["BTN_9", "9"],
  ["BTN_a", "a"], ["BTN_b", "b"], ["BTN_c", "c"], ["BTN_d", "d"], ["BTN_e", "e"], ["BTN_f", "f"],
  ["BTN_g", "g"], ["BTN_h", "h"], ["BTN_i", "i"], ["BTN_j", "j"], ["BTN_k", "k"], ["BTN_l", "l"],
  ["BTN_m", "m"], ["BTN_n", "n"], ["BTN_o", "o"], ["BTN_p", "p"], ["BTN_q", "q"], ["BTN_r", "r"],
  ["BTN_s", "s"], ["BTN_t", "t"], ["BTN_u", "u"], ["BTN_v", "v"], ["BTN_w", "w"], ["BTN_x", "x"], ["BTN_y", "y"], ["BTN_z", "z"],
  ["BTN_c_cedilha", "ç"], ["BTN_espaco", " "], ["BTN_asterisco", "*"], ["BTN_mais", "+"],
  ["BTN_menos", "-"], ["BTN_under_score", "_"], ["BTN_barra_esquerda", "\\"], ["BTN_barra_direita", "/"],
  ["BTN_ponto", "."], ["BTN_virgula", ","], ["BTN_ponto_virgula", ";"], ["BTN_dois_pontos", ":"],
  ["BTN_parentesis_esquerda", "("], ["BTN_parentesis_direita", ")"], ["BTN_arroba", "@"], ["BTN_euro", "€"],
  ["BTN_percentagem", "%"], ["BTN_ponto_interrogacao", "?"], ["BTN_a_cima", "ª"], ["BTN_o_cima", "º"],
  ["BTN_i_comercial", "&"], ["BTN_aspas", '"'], ["BTN_igual", "="], ["BTN_cardinal", "#"], ["BTN_Caption", "7"],
] as const;

test("WIN_Teclado_Alfa actual source character buttons append their literal and return focus to manual input", async ({ page }) => {
  await page.goto("/?workflow=touch-keyboards&kind=alpha&value=");
  await page.getByTestId("touch-keyboard-open").click();
  const keyboard = page.getByTestId("WIN_Teclado_Alfa"), manual = keyboard.getByTestId("EDT_input_manual");
  await expect(manual).toBeFocused();
  for (const [button, literal] of alphaKeys) {
    await keyboard.getByTestId("BTN_apagar_tudo").click();
    await keyboard.getByTestId(button).click();
    await expect(keyboard.getByTestId("EDT_Texto"), button).toHaveValue(literal);
    if (button !== "BTN_Caption") await expect(manual, button).toBeFocused();
  }
  await keyboard.getByTestId("BTN_confirmar").click();
  await expect(page.getByTestId("touch-keyboard-returned")).toHaveText("7");
});

test("WIN_Teclado_Alfa actual CapsLock colors, one-shot/persistent shift and every evidenced accent branch", async ({ page }) => {
  await page.goto("/?workflow=touch-keyboards&kind=alpha&value="); await page.getByTestId("touch-keyboard-open").click();
  const keyboard = page.getByTestId("WIN_Teclado_Alfa"), caps = keyboard.getByTestId("BTN_CapsLock");
  for (const [button, letters] of [
    ["BTN_acento_grave", [["BTN_a", "à"], ["BTN_e", "è"], ["BTN_i", "ì"], ["BTN_o", "o"]]],
    ["BTN_acento_agudo", [["BTN_a", "á"], ["BTN_e", "é"], ["BTN_i", "í"], ["BTN_u", "u"]]],
    ["BTN_acento_til", [["BTN_a", "ã"], ["BTN_o", "o"]]],
    ["BTN_acento_circunflexo", [["BTN_a", "â"], ["BTN_e", "ê"], ["BTN_i", "î"], ["BTN_u", "u"]]],
  ] as const) {
    for (const [letter, expected] of letters) {
      await keyboard.getByTestId("BTN_apagar_tudo").click(); await keyboard.getByTestId(button).click();
      await expect(keyboard.getByTestId("EDT_Texto")).toHaveValue("");
      await keyboard.getByTestId(letter).click(); await expect(keyboard.getByTestId("EDT_Texto")).toHaveValue(expected);
      await keyboard.getByTestId("BTN_a").click(); await expect(keyboard.getByTestId("EDT_Texto")).toHaveValue(expected + "a");
    }
  }
  await keyboard.getByTestId("BTN_apagar_tudo").click(); await caps.click(); await expect(caps).toHaveCSS("color", "rgb(0, 100, 0)");
  await keyboard.getByTestId("BTN_acento_agudo").click(); await keyboard.getByTestId("BTN_e").click();
  await expect(keyboard.getByTestId("EDT_Texto")).toHaveValue("É"); await expect(caps).toHaveCSS("color", "rgb(255, 255, 255)");
  await caps.click(); await caps.click(); await expect(caps).toHaveCSS("color", "rgb(144, 238, 144)");
  await keyboard.getByTestId("BTN_a").click(); await keyboard.getByTestId("BTN_b").click();
  await expect(keyboard.getByTestId("EDT_Texto")).toHaveValue("ÉAB");
  await caps.click(); await expect(caps).toHaveCSS("color", "rgb(255, 255, 255)");
  await keyboard.getByTestId("BTN_apagar_ultimo").click(); await expect(keyboard.getByTestId("EDT_Texto")).toHaveValue("ÉA");
  await keyboard.getByTestId("BTN_cancelar").click(); await expect(page.getByTestId("touch-keyboard-returned")).toHaveText("");
});

test("WIN_Teclado_Alfa physical source dispatch, Backspace, Enter and Escape preserve actual caller results", async ({ page }) => {
  await page.goto("/?workflow=touch-keyboards&kind=alpha&value=%20Original%20"); await page.getByTestId("touch-keyboard-open").click();
  const keyboard = page.getByTestId("WIN_Teclado_Alfa"); await keyboard.getByTestId("BTN_apagar_tudo").click();
  await page.keyboard.type("aZ019,+%?=#\"&@();:\\/ _*.-");
  await expect(keyboard.getByTestId("EDT_Texto")).toHaveValue("az019;+%?=#\"&@();:\\/ _*.-");
  await page.keyboard.press("Backspace"); await page.keyboard.press("Enter");
  await expect(page.getByTestId("touch-keyboard-returned")).toHaveText("az019;+%?=#\"&@();:\\/ _*.");
  await page.getByTestId("touch-keyboard-open").click(); await keyboard.getByTestId("BTN_apagar_tudo").click();
  await page.keyboard.press("Escape"); await expect(page.getByTestId("touch-keyboard-returned")).toHaveText("Original");
});

test("WIN_Teclado_numerico source digit/title buttons, clear, point, sign and entry focus reach actual result", async ({ page }) => {
  await page.goto("/?workflow=touch-keyboards&value=12.500"); await page.getByTestId("touch-keyboard-open").click();
  const keyboard = page.getByTestId("WIN_Teclado_numerico"), manual = keyboard.getByTestId("EDT_input_manual");
  await expect(manual).toBeFocused();
  for (const [button, digit] of [["BTN_zero", "0"], ["BTN_um", "1"], ["BTN_dois", "2"], ["BTN_tres", "3"], ["BTN_quatro", "4"], ["BTN_cinco", "5"], ["BTN_seis", "6"], ["BTN_sete", "7"], ["BTN_oito", "8"], ["BTN_nove", "9"], ["BTN_Caption", "7"]]) {
    await keyboard.getByTestId("BTN_limpar").click(); await keyboard.getByTestId(button).click();
    await expect(keyboard.getByTestId("EDT_Texto"), button).toHaveValue(`${digit}.`);
    if (button !== "BTN_Caption") await expect(manual).toBeFocused();
  }
  await keyboard.getByTestId("BTN_ponto").click(); await keyboard.getByTestId("BTN_um").click(); await keyboard.getByTestId("BTN_dois").click();
  await keyboard.getByTestId("BTN_menos").click(); await expect(keyboard.getByTestId("EDT_Texto")).toHaveValue("-7.12");
  await keyboard.getByTestId("BTN_menos").click(); await expect(keyboard.getByTestId("EDT_Texto")).toHaveValue("7.12");
  await keyboard.getByTestId("EDT_Texto").click(); await expect(manual).toBeFocused();
  await keyboard.getByTestId("BTN_confirmar").click(); await expect(page.getByTestId("touch-keyboard-returned")).toHaveText("7.12");
  await page.getByTestId("touch-keyboard-open").click(); await keyboard.getByTestId("BTN_um").click();
  await keyboard.getByTestId("BTN_cancelar").click(); await expect(page.getByTestId("touch-keyboard-returned")).toHaveText("12.500");
});

test("nullable keyboard callback distinguishes untouched confirmation, deliberate blank and cancelled edits", async ({ page }) => {
  await page.goto("/?workflow=touch-keyboards&kind=alpha&value=");
  const open = page.getByTestId("touch-keyboard-open"), result = page.getByTestId("touch-keyboard-returned");
  const keyboard = page.getByTestId("WIN_Teclado_Alfa");
  await open.click(); await keyboard.getByTestId("BTN_CapsLock").click();
  await keyboard.getByTestId("BTN_acento_agudo").click(); await page.keyboard.press("Enter");
  await expect(result).toHaveAttribute("data-confirmed", "true"); await expect(result).toHaveAttribute("data-edited", "false");
  await open.click(); await keyboard.getByTestId("BTN_a").click(); await keyboard.getByTestId("BTN_apagar_ultimo").click();
  await keyboard.getByTestId("BTN_confirmar").click();
  await expect(result).toHaveText(""); await expect(result).toHaveAttribute("data-confirmed", "true"); await expect(result).toHaveAttribute("data-edited", "true");
  await open.click(); await keyboard.getByTestId("BTN_a").click(); await page.keyboard.press("Escape");
  await expect(result).toHaveText(""); await expect(result).toHaveAttribute("data-confirmed", "false"); await expect(result).toHaveAttribute("data-edited", "true");
  await open.click(); await keyboard.getByTestId("BTN_apagar_tudo").click(); await keyboard.getByTestId("BTN_confirmar").click();
  await expect(result).toHaveAttribute("data-confirmed", "true"); await expect(result).toHaveAttribute("data-edited", "true");
  await page.goto("/?workflow=touch-keyboards&value=12.500"); await open.click();
  await page.keyboard.press("Enter"); await expect(result).toHaveText("12.5");
  await expect(result).toHaveAttribute("data-confirmed", "true"); await expect(result).toHaveAttribute("data-edited", "false");
  await open.click(); await page.getByTestId("WIN_Teclado_numerico").getByTestId("BTN_um").click();
  await page.getByTestId("WIN_Teclado_numerico").getByTestId("BTN_cancelar").click();
  await expect(result).toHaveText("12.500"); await expect(result).toHaveAttribute("data-confirmed", "false"); await expect(result).toHaveAttribute("data-edited", "true");
});
