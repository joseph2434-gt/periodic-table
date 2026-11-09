(function () {
  const Q = window.QUESTIONS;
  const ENDPOINT = (window.APP_CONFIG && window.APP_CONFIG.ENDPOINT) || "";
  const demoFields = ["age", "sex", "employment", "prior_exp"];
  const itemIds = [].concat(...[...Q.partII, ...Q.partIII].map(g => g.items.map(i => i.id)));
  const btn = document.getElementById("submitBtn");
  const statusEl = document.getElementById("status");
  const thanks = document.getElementById("thanks");

  const val = name => {
    const el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : "";
  };
  const setStatus = (msg, err) => { statusEl.textContent = msg; statusEl.className = "status" + (err ? " error" : ""); };

  function clearMarks() { document.querySelectorAll(".missing").forEach(e => e.classList.remove("missing")); }

  function validate() {
    clearMarks();
    let first = null;
    const mark = el => { el.classList.add("missing"); if (!first) first = el; };
    demoFields.forEach(n => { if (!val(n)) mark(document.querySelector('input[name="' + n + '"]').closest(".demo-field")); });
    itemIds.forEach(n => { if (!val(n)) mark(document.querySelector('input[name="' + n + '"]').closest("tr")); });
    if (!document.querySelector('input[name="consent"]').checked) mark(document.querySelector(".consent-box"));
    if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
    return !first;
  }

  function saveLocal(data) {
    try {
      const all = JSON.parse(localStorage.getItem("css_responses_local") || "[]");
      all.push(data);
      localStorage.setItem("css_responses_local", JSON.stringify(all));
    } catch (e) { /* storage unavailable */ }
  }

  btn.addEventListener("click", async () => {
    if (!validate()) { setStatus("Please answer every item (highlighted in red) and tick the consent box.", true); return; }
    const data = { submitted_at: new Date().toISOString() };
    demoFields.concat(itemIds).forEach(n => data[n] = val(n));
    data.comments = document.getElementById("comments").value.trim();
    btn.disabled = true; setStatus("Submitting...");
    saveLocal(data); // local backup copy
    if (!ENDPOINT) {
      setStatus("Saved in this browser only (no ENDPOINT set in config.js).");
      btn.disabled = false; thanks.classList.add("show"); return;
    }
    try {
      // text/plain avoids a CORS preflight; Apps Script reads the raw body.
      await fetch(ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(data) });
      setStatus(""); thanks.classList.add("show");
    } catch (e) {
      setStatus("Could not send. Check your internet connection and press Submit again.", true);
    }
    btn.disabled = false;
  });

  document.getElementById("again").addEventListener("click", () => {
    document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(i => i.checked = false);
    document.getElementById("comments").value = "";
    clearMarks(); setStatus(""); thanks.classList.remove("show");
    window.scrollTo({ top: 0 });
  });
})();
