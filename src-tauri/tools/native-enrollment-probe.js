// Test-only: verify the real launcher pipe reaches the actual native enrollment UI.
(async () => {
  const invoke = window.__TAURI_INTERNALS__.invoke;
  const wait = async predicate => { const deadline = Date.now() + 40_000; while (Date.now() < deadline) { const result = predicate(); if (result) return result; await new Promise(resolve => setTimeout(resolve, 50)); } throw new Error("timeout"); };
  try {
    const form = await wait(() => document.querySelector('[data-testid="authentication-enrollment"]'));
    await wait(() => form.querySelector('[aria-label="Nova palavra-passe"]'));
    const token = await invoke("local_setup_token");
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) throw new Error("handoff unavailable");
    await wait(() => !form.querySelector('[aria-label="Código de configuração"]'));
    const password = form.querySelector('[aria-label="Nova palavra-passe"]');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(password, "Native42");
    password.dispatchEvent(new Event("input", { bubbles: true }));
    const confirm = await wait(() => { const button = form.querySelector('[data-testid="enrollment-confirm"]'); return button && !button.disabled && button; });
    confirm.click(); await wait(() => document.querySelector('[data-testid="WIN_MENU"]'));
    const [info, args] = await Promise.all([invoke("native_info"), invoke("read_startup_arguments")]);
    await invoke("plugin:event|emit", {event:"native-probe-result", payload:{info,arguments:args,enrollment:{automatic:true,enrolled:true}}});
    await invoke("terminate_application");
  } catch { await invoke("plugin:event|emit", {event:"native-probe-failure",payload:"enrollment"}); }
})();
