// Fixed synthetic UI scenario, compiled only into the separate native-probe executable.
(async () => {
  const invoke = window.__TAURI_INTERNALS__.invoke;
  let stage = "enrollment";
  const field = id => document.querySelector(`[data-testid="${id}"]`);
  const mark = async value => { stage = value; await invoke("plugin:event|emit", { event: "native-probe-stage", payload: stage }); };
  const wait = async predicate => {
    const deadline = Date.now() + 40_000;
    while (!predicate()) { if (Date.now() > deadline) throw new Error("probe_timeout"); await new Promise(resolve => setTimeout(resolve, 25)); }
    return predicate();
  };
  const input = (element, value) => {
    if (!element) throw new Error("probe_input_missing");
    element.focus(); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(element, value);
    element.dispatchEvent(new Event("input", { bubbles: true })); element.blur();
  };
  try {
    await invoke("plugin:event|emit", { event: "native-probe-stage", payload: "script" });
    const setup = await wait(() => field("authentication-enrollment"));
    const localToken = await invoke("local_setup_token");
    if (localToken === null) input(await wait(() => setup.querySelector('[aria-label="Código de configuração"]')), __SETUP_TOKEN_JSON__);
    else {
      if (localToken !== __SETUP_TOKEN_JSON__) throw new Error("native enrollment handoff mismatch");
      await wait(() => !setup.querySelector('[aria-label="Código de configuração"]'));
    }
    input(setup.querySelector('[aria-label="Nova palavra-passe"]'), "Native42");
    await wait(() => !field("enrollment-confirm").disabled); field("enrollment-confirm").click();
    await wait(() => field("WIN_MENU"));
    await mark("customer"); field("BTN_Clientes").click(); await wait(() => field("WIN_Table_Clientes"));
    await mark("customer-list");
    const list = field("WIN_Table_Clientes"), table = field("TABLE_Clientes");
    const renderedRows = () => table.querySelectorAll('tbody tr[aria-selected]');
    const bounded = count => { if (renderedRows().length < 1 || renderedRows().length >= 100 || table.querySelector("table").getAttribute("aria-rowcount") !== String(count + 1)) throw new Error("probe_large_customer_dom"); };
    await wait(() => table.querySelector('table[aria-rowcount="1002"]') && renderedRows().length > 0);
    bounded(1001);
    if (Array.from(renderedRows()).some(row => row.textContent.includes("Native virtual synthetic 1001"))) throw new Error("probe_last_customer_initially_rendered");
    const seek = async (code, description, count) => {
      field("COL_Codigo__search").click();
      const search = await wait(() => field("COL_Codigo").querySelector("input")); input(search, code);
      const selected = await wait(() => table.querySelector('tr[aria-selected="true"]')?.textContent.includes(description) && table.querySelector('tr[aria-selected="true"]'));
      search.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      await wait(() => !field("COL_Codigo").querySelector("input")); bounded(count);
      return selected;
    };
    const last = await seek("101000", "Native virtual synthetic 1001", 1001);
    if (last.getAttribute("aria-rowindex") !== "1002" || table.scrollTop <= 0 || list.querySelector('[data-testid="EDT_Observacao"]').value !== "Native virtual memo 1001") throw new Error("probe_last_customer_selection");
    const viewport = table.getBoundingClientRect(), selected = last.getBoundingClientRect(), header = table.querySelector("thead").getBoundingClientRect();
    if (selected.top < viewport.top + header.height || selected.bottom > viewport.bottom) throw new Error("probe_last_customer_not_visible");
    await wait(() => field("Btn_New") && !field("Btn_New").disabled); field("Btn_New").click();
    await wait(() => field("WIN_Form_Clientes"));
    await mark("customer-form");
    input(field("EDT_Codigo"), "771"); input(field("EDT_Descricao"), "Native synthetic customer");
    field("BTN_Validar").click(); await wait(() => !field("WIN_Form_Clientes"));
    await mark("customer-saved");
    await wait(() => table.querySelector('table[aria-rowcount="1003"]'));
    await seek("771", "Native synthetic customer", 1002);
    await mark("report-preview"); list.querySelector('[data-testid="BTN_Imprimir"]').click();
    const preview = await wait(() => document.querySelector("dialog.report-preview[open]"));
    const iframe = await wait(() => preview.querySelector('iframe[title="RPT_List_Clientes"]'));
    const bounds = iframe.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0 || !iframe.srcdoc.includes("Native synthetic customer") || !iframe.srcdoc.includes("data:font/woff2;base64,") || iframe.srcdoc.includes("<script")) throw new Error("probe_report_snapshot");
    if (field("report-save-pdf")?.disabled !== false || field("report-print-pdf")?.disabled !== false) throw new Error("probe_report_output_controls");
    Array.from(preview.querySelectorAll("button")).find(button => button.textContent === "Fechar").click();
    await wait(() => !document.querySelector("dialog.report-preview"));
    await mark("logout"); field("business-logout").click(); await wait(() => field("WIN_Acesso"));
    await wait(() => !field("WIN_Table_Clientes"));
    await mark("login"); field("BTN_NoName1").click();
    const row = await wait(() => Array.from(field("user-picker")?.querySelectorAll("tbody tr") ?? []).find(row => row.textContent.includes("Administrador")));
    row.click(); await new Promise(resolve => setTimeout(resolve, 0)); row.dispatchEvent(new MouseEvent("dblclick", { bubbles: true, button: 0 }));
    await wait(() => !field("user-picker") && field("EDT_utilizador").value === "Administrador");
    input(field("EDT_palavra_passe"), "native42"); field("BTN_Confirmar").click(); await wait(() => field("WIN_MENU"));
    field("business-logout").click(); await wait(() => field("WIN_Acesso"));
    stage = "metadata";
    const [info, args] = await Promise.all([invoke("native_info"), invoke("read_startup_arguments")]);
    await invoke("plugin:event|emit", { event: "native-probe-result", payload: { info, arguments: args, business: { enrolled: true, customerSaved: true, reportPreview: true, loggedOut: true, loggedInAgain: true } } });
    await invoke("terminate_application");
  } catch { await invoke("plugin:event|emit", { event: "native-probe-failure", payload: stage }); }
})();
