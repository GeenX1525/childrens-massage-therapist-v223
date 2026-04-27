const SITE_CONTENT_SINGLETON_ID = 1;
const LEGAL_TEXTS_SINGLETON_ID = 1;

function qs(sel, root = document) {
  return root.querySelector(sel);
}

function show(el, on) {
  if (!el) return;
  el.hidden = !on;
}

function setText(el, value) {
  if (!el) return;
  el.textContent = value == null ? "" : String(value);
}

function getSupabase() {
  const url = window.SUPABASE_URL;
  const key = window.SUPABASE_ANON_KEY;
  if (!url || !key || !window.supabase?.createClient) return null;
  return window.supabase.createClient(url, key);
}

function prettyJson(obj) {
  return JSON.stringify(obj, null, 2);
}

function safeJsonParse(str) {
  try {
    return { ok: true, value: JSON.parse(str) };
  } catch (e) {
    return { ok: false, error: e };
  }
}

function formatDt(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("ru-RU");
  } catch {
    return String(iso);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const sb = getSupabase();
  const status = qs("#adminStatus");

  const loginCard = qs("#loginCard");
  const appGrid = qs("#appGrid");

  const loginForm = qs("#loginForm");
  const loginEmail = qs("#loginEmail");
  const loginPassword = qs("#loginPassword");
  const loginError = qs("#loginError");

  const logoutBtn = qs("#logoutBtn");

  const heroFile = qs("#heroFile");
  const uploadHeroBtn = qs("#uploadHeroBtn");
  const uploadHint = qs("#uploadHint");

  const reloadContentBtn = qs("#reloadContentBtn");
  const saveContentBtn = qs("#saveContentBtn");
  const contentJson = qs("#contentJson");
  const contentHint = qs("#contentHint");

  const reloadLegalBtn = qs("#reloadLegalBtn");
  const saveLegalBtn = qs("#saveLegalBtn");
  const legalShort = qs("#legalShort");
  const legalConsentTitle = qs("#legalConsentTitle");
  const legalConsentBody = qs("#legalConsentBody");
  const legalPolicyTitle = qs("#legalPolicyTitle");
  const legalPolicyBody = qs("#legalPolicyBody");
  const legalHint = qs("#legalHint");

  const reloadLeadsBtn = qs("#reloadLeadsBtn");
  const leadsTbody = qs("#leadsTbody");
  const leadsHint = qs("#leadsHint");

  if (!sb) {
    setText(status, "Supabase не настроен (нужен supabase-config.js)");
    show(loginCard, true);
    show(appGrid, false);
    return;
  }

  async function refreshSessionUi() {
    const { data } = await sb.auth.getSession();
    const email = data?.session?.user?.email || null;
    const ok = Boolean(email);

    show(loginCard, !ok);
    show(appGrid, ok);
    setText(status, ok ? `Вошли как: ${email}` : "Ожидание входа");
    return ok;
  }

  async function loadContent() {
    setText(contentHint, "");
    const { data, error } = await sb
      .from("site_content")
      .select("*")
      .eq("id", SITE_CONTENT_SINGLETON_ID)
      .maybeSingle();
    if (error) {
      setText(contentHint, `Ошибка загрузки: ${error.message}`);
      return;
    }
    const obj = data?.content_json || {};
    contentJson.value = prettyJson(obj);
    setText(contentHint, "Загружено.");
  }

  async function saveContent() {
    setText(contentHint, "");
    const parsed = safeJsonParse(contentJson.value);
    if (!parsed.ok) {
      setText(contentHint, `JSON невалидный: ${parsed.error?.message || "ошибка"}`);
      return;
    }

    const payload = {
      id: SITE_CONTENT_SINGLETON_ID,
      content_json: parsed.value,
      updated_at: new Date().toISOString(),
    };

    const { error } = await sb.from("site_content").upsert(payload, { onConflict: "id" });
    if (error) {
      setText(contentHint, `Ошибка сохранения: ${error.message}`);
      return;
    }
    setText(contentHint, "Сохранено.");
  }

  async function loadLegal() {
    setText(legalHint, "");
    const { data, error } = await sb
      .from("legal_texts")
      .select("*")
      .eq("id", LEGAL_TEXTS_SINGLETON_ID)
      .maybeSingle();
    if (error) {
      setText(legalHint, `Ошибка загрузки: ${error.message}`);
      return;
    }
    legalShort.value = data?.consent_short_text || "";
    legalConsentTitle.value = data?.consent_title || "";
    legalConsentBody.value = data?.consent_body_html || "";
    legalPolicyTitle.value = data?.policy_title || "";
    legalPolicyBody.value = data?.policy_body_html || "";
    setText(legalHint, "Загружено.");
  }

  async function saveLegal() {
    setText(legalHint, "");
    const payload = {
      id: LEGAL_TEXTS_SINGLETON_ID,
      version: String(Date.now()),
      consent_short_text: legalShort.value || "",
      consent_title: legalConsentTitle.value || "",
      consent_body_html: legalConsentBody.value || "",
      policy_title: legalPolicyTitle.value || "",
      policy_body_html: legalPolicyBody.value || "",
      consent_snapshot_for_logging: [
        legalConsentTitle.value || "",
        legalConsentBody.value || "",
        legalPolicyTitle.value || "",
        legalPolicyBody.value || "",
      ].join("\n\n"),
      updated_at: new Date().toISOString(),
    };

    const { error } = await sb.from("legal_texts").upsert(payload, { onConflict: "id" });
    if (error) {
      setText(legalHint, `Ошибка сохранения: ${error.message}`);
      return;
    }
    setText(legalHint, "Сохранено.");
  }

  async function uploadHero() {
    setText(uploadHint, "");
    const f = heroFile?.files?.[0];
    if (!f) {
      setText(uploadHint, "Выберите файл.");
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setText(uploadHint, "Файл больше 2 МБ. Уменьшите размер.");
      return;
    }

    const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
    const path = `hero/hero.${ext}`;

    const { error: upErr } = await sb.storage.from("site-assets").upload(path, f, {
      upsert: true,
      contentType: f.type || undefined,
      cacheControl: "3600",
    });
    if (upErr) {
      setText(uploadHint, `Ошибка загрузки: ${upErr.message}`);
      return;
    }

    const { data: pub } = sb.storage.from("site-assets").getPublicUrl(path);
    const url = pub?.publicUrl;
    if (!url) {
      setText(uploadHint, "Загрузили файл, но не получили ссылку.");
      return;
    }

    // Update content JSON with new hero image URL
    const parsed = safeJsonParse(contentJson.value || "{}");
    const obj = parsed.ok ? parsed.value : {};
    obj.hero_image_url = url;
    contentJson.value = prettyJson(obj);
    await saveContent();

    setText(uploadHint, "Фото обновлено.");
  }

  function buildStatusSelect(current) {
    const statuses = [
      { id: "new", label: "Новая" },
      { id: "in_progress", label: "В работе" },
      { id: "scheduled", label: "Записан(а)" },
      { id: "done", label: "Выполнено" },
      { id: "cancelled", label: "Отменено" },
    ];
    const sel = document.createElement("select");
    sel.className = "admin-select";
    statuses.forEach((s) => {
      const o = document.createElement("option");
      o.value = s.id;
      o.textContent = s.label;
      if (s.id === current) o.selected = true;
      sel.appendChild(o);
    });
    return sel;
  }

  async function loadLeads() {
    setText(leadsHint, "");
    leadsTbody.innerHTML = "";
    const { data, error } = await sb
      .from("leads")
      .select("id, created_at, service, name, phone, child_age, status, fulfilled_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      setText(leadsHint, `Ошибка загрузки: ${error.message}`);
      return;
    }

    const leads = Array.isArray(data) ? data : [];
    leads.forEach((l) => {
      const tr = document.createElement("tr");

      const tdCreated = document.createElement("td");
      tdCreated.textContent = formatDt(l.created_at);

      const tdService = document.createElement("td");
      tdService.textContent = l.service || "";

      const tdName = document.createElement("td");
      tdName.textContent = l.name || "";

      const tdPhone = document.createElement("td");
      tdPhone.textContent = l.phone || "";

      const tdAge = document.createElement("td");
      tdAge.textContent = l.child_age || "";

      const tdStatus = document.createElement("td");
      const sel = buildStatusSelect(l.status || "new");
      tdStatus.appendChild(sel);

      const tdFulfilled = document.createElement("td");
      tdFulfilled.textContent = formatDt(l.fulfilled_at);

      const tdAct = document.createElement("td");
      const saveBtn = document.createElement("button");
      saveBtn.type = "button";
      saveBtn.className = "btn btn--secondary";
      saveBtn.textContent = "Сохранить";
      tdAct.appendChild(saveBtn);

      saveBtn.addEventListener("click", async () => {
        const nextStatus = sel.value;
        const fulfilledAt =
          nextStatus === "done" && !l.fulfilled_at ? new Date().toISOString() : l.fulfilled_at;
        const { error: upErr } = await sb
          .from("leads")
          .update({
            status: nextStatus,
            fulfilled_at: fulfilledAt,
            status_updated_at: new Date().toISOString(),
          })
          .eq("id", l.id);
        if (upErr) {
          setText(leadsHint, `Не сохранилось: ${upErr.message}`);
          return;
        }
        l.status = nextStatus;
        l.fulfilled_at = fulfilledAt;
        tdFulfilled.textContent = formatDt(l.fulfilled_at);
        setText(leadsHint, "Статус сохранён.");
      });

      tr.appendChild(tdCreated);
      tr.appendChild(tdService);
      tr.appendChild(tdName);
      tr.appendChild(tdPhone);
      tr.appendChild(tdAge);
      tr.appendChild(tdStatus);
      tr.appendChild(tdFulfilled);
      tr.appendChild(tdAct);
      leadsTbody.appendChild(tr);
    });

    setText(leadsHint, leads.length ? `Заявок: ${leads.length}` : "Пока заявок нет.");
  }

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    setText(loginError, "");
    const email = String(loginEmail?.value || "").trim();
    const password = String(loginPassword?.value || "");
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      setText(loginError, `Ошибка входа: ${error.message}`);
      return;
    }
    await refreshSessionUi();
    await Promise.all([loadContent(), loadLegal(), loadLeads()]);
  });

  logoutBtn?.addEventListener("click", async () => {
    await sb.auth.signOut();
    await refreshSessionUi();
  });

  reloadContentBtn?.addEventListener("click", loadContent);
  saveContentBtn?.addEventListener("click", saveContent);

  reloadLegalBtn?.addEventListener("click", loadLegal);
  saveLegalBtn?.addEventListener("click", saveLegal);

  uploadHeroBtn?.addEventListener("click", uploadHero);

  reloadLeadsBtn?.addEventListener("click", loadLeads);

  const ok = await refreshSessionUi();
  if (ok) {
    await Promise.all([loadContent(), loadLegal(), loadLeads()]);
  }
});

