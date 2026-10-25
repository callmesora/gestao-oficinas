// Fixed synthetic UI scenario, compiled only into the separate native-probe executable.
(async () => {
  const invoke = window.__TAURI_INTERNALS__.invoke;
  let stage = "enrollment";
  const field = id => document.querySelector(`[data-testid="${id}"]`);
  const mark = async value => { stage = value; await invoke("plugin:event|emit", { event: "native-probe-stage", payload: stage }); };
  const wait = async predicate => {
    const deadline = Date.now() + 12_000;
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
    input(setup.querySelector('[aria-label="Código de configuração"]'), __SETUP_TOKEN_JSON__);
    input(setup.querySelector('[aria-label="Nova palavra-passe"]'), "Native42");
    await wait(() => !field("enrollment-confirm").disabled); field("enrollment-confirm").click();
    await wait(() => field("WIN_MENU"));
    await mark("customer"); field("BTN_Clientes").click(); await wait(() => field("WIN_Table_Clientes"));
    await mark("customer-list");
    await wait(() => field("Btn_New") && !field("Btn_New").disabled); field("Btn_New").click();
    await wait(() => field("WIN_Form_Clientes"));
    await mark("customer-form");
    input(field("EDT_Codigo"), "771"); input(field("EDT_Descricao"), "Native synthetic customer");
    field("BTN_Validar").click(); await wait(() => !field("WIN_Form_Clientes"));
    await mark("customer-saved");
    await wait(() => field("WIN_Table_Clientes").textContent.includes("Native synthetic customer"));
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
    await invoke("plugin:event|emit", { event: "native-probe-result", payload: { info, arguments: args, business: { enrolled: true, customerSaved: true, loggedOut: true, loggedInAgain: true } } });
    await invoke("terminate_application");
  } catch { await invoke("plugin:event|emit", { event: "native-probe-failure", payload: stage }); }
})();
