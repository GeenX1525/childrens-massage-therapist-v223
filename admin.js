const SITE_CONTENT_SINGLETON_ID = 1;
const LEGAL_TEXTS_SINGLETON_ID = 1;

const DIPLOMA_MAX_BYTES = 5 * 1024 * 1024;
const DIPLOMA_ACCEPT_ATTR =
  "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/svg+xml,application/pdf,.pdf,.svg";
const DIPLOMA_EXT_OK = new Set(["jpg", "jpeg", "png", "webp", "gif", "bmp", "svg", "pdf"]);

function fileExt(name) {
  const n = String(name || "");
  const i = n.lastIndexOf(".");
  return i >= 0 ? n.slice(i + 1).toLowerCase() : "";
}

function isAllowedDiplomaFile(file) {
  if (!file || !file.name) return false;
  const ext = fileExt(file.name);
  if (ext && DIPLOMA_EXT_OK.has(ext)) return true;
  const mt = String(file.type || "").toLowerCase();
  if (mt === "application/pdf") return true;
  if (mt.startsWith("image/")) return true;
  return false;
}

function diplomaKindFromFile(file) {
  const ext = fileExt(file.name);
  if (ext === "pdf" || String(file.type || "").toLowerCase() === "application/pdf") return "pdf";
  return "image";
}

function qs(sel, root = document) {
  return root.querySelector(sel);
}

function isFilledValue(v) {
  if (v == null) return false;
  return String(v).trim().length > 0;
}

function updateFilledUi(root = document) {
  Array.from(root.querySelectorAll(".field")).forEach((field) => {
    const input = field.querySelector("input, textarea, select");
    if (!input) return;
    if (input.tagName === "INPUT" && String(input.type).toLowerCase() === "file") return;
    const filled = isFilledValue(input.value);
    field.classList.toggle("field--filled", filled);
    field.classList.toggle("field--empty", !filled);
  });

  Array.from(root.querySelectorAll(".admin-item")).forEach((item) => {
    const fields = Array.from(item.querySelectorAll("input, textarea, select")).filter((el) => {
      if (el.tagName === "INPUT" && String(el.type).toLowerCase() === "file") return false;
      return true;
    });
    const filled = fields.some((el) => isFilledValue(el.value));
    item.classList.toggle("admin-item--filled", filled);
    item.classList.toggle("admin-item--empty", !filled);
  });
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

/** Имя Storage bucket (по умолчанию site-assets). Переопределение: window.SUPABASE_STORAGE_BUCKET в supabase-config.js */
function getStorageBucketId() {
  const b = window.SUPABASE_STORAGE_BUCKET;
  if (typeof b === "string" && b.trim().length) return b.trim();
  return "site-assets";
}

function storageErrorHint(message) {
  const m = String(message || "").toLowerCase();
  if (m.includes("bucket not found")) {
    const id = getStorageBucketId();
    return ` Создайте в Supabase → Storage публичный bucket «${id}» (см. SUPABASE_SETUP.md). Если bucket уже есть под другим именем — в supabase-config.js: window.SUPABASE_STORAGE_BUCKET = "имя-bucket";`;
  }
  return "";
}

function prettyJson(obj) {
  return JSON.stringify(obj, null, 2);
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if (k === "class") node.className = String(v);
    else if (k === "text") node.textContent = String(v);
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, String(v));
  });
  (children || []).forEach((c) => node.appendChild(c));
  return node;
}

function toText(elm) {
  return String(elm?.textContent ?? "").trim();
}

function toSrc(elm) {
  return String(elm?.getAttribute?.("src") ?? "").trim();
}

function getInputValue(input) {
  return String(input?.value ?? "").trim();
}

function mountTextList({ root, addBtn, getPlaceholder, multiline = false }) {
  function addItem(value = "") {
    const input = multiline
      ? el("textarea", { class: "admin-text", "data-field": "text", placeholder: getPlaceholder?.() || "" })
      : el("input", { type: "text", "data-field": "text", placeholder: getPlaceholder?.() || "" });
    input.value = value || "";

    const removeBtn = el("button", { type: "button", class: "btn btn--secondary admin-item__remove", text: "Удалить" });
    const row = el("div", { class: "admin-item__row" }, [input, removeBtn]);
    const item = el("div", { class: "admin-item", "data-kind": "text" }, [row]);
    removeBtn.addEventListener("click", () => item.remove());
    root.appendChild(item);
  }

  addBtn?.addEventListener("click", () => addItem(""));

  function setValues(values) {
    root.innerHTML = "";
    (Array.isArray(values) ? values : []).forEach((v) => addItem(v));
    if (!root.children.length) addItem("");
  }

  function getValues() {
    return Array.from(root.querySelectorAll(".admin-item"))
      .map((item) => {
        const input = item.querySelector('[data-field="text"]');
        return getInputValue(input);
      })
      .filter(Boolean);
  }

  return { setValues, getValues, addItem };
}

function mountAboutCardsList({ root, addBtn }) {
  function addItem(value = { h3: "", p: "" }) {
    const title = el("input", { type: "text", placeholder: "Заголовок", "data-field": "h3" });
    const body = el("textarea", { class: "admin-text", placeholder: "Текст", "data-field": "p" });
    title.value = value?.h3 || "";
    body.value = value?.p || "";

    const removeBtn = el("button", { type: "button", class: "btn btn--secondary admin-item__remove", text: "Удалить" });
    const headRow = el("div", { class: "admin-item__row" }, [
      el("div", {}, [el("div", { class: "muted small", text: "Карточка" }), title]),
      removeBtn,
    ]);
    const item = el("div", { class: "admin-item", "data-kind": "about_card" }, [headRow, body]);
    removeBtn.addEventListener("click", () => item.remove());
    root.appendChild(item);
  }

  addBtn?.addEventListener("click", () => addItem({ h3: "", p: "" }));

  function setValues(values) {
    root.innerHTML = "";
    (Array.isArray(values) ? values : []).forEach((v) => addItem(v));
    if (!root.children.length) addItem({ h3: "", p: "" });
  }

  function getValues() {
    return Array.from(root.querySelectorAll(".admin-item"))
      .map((item) => {
        const h3 = getInputValue(item.querySelector('[data-field="h3"]'));
        const p = getInputValue(item.querySelector('[data-field="p"]'));
        return { h3, p };
      })
      .filter((v) => v.h3 || v.p);
  }

  return { setValues, getValues, addItem };
}

function mountServicesList({ root, addBtn }) {
  function addItem(value = { h3: "", p: "", service_value: "" }) {
    const title = el("input", { type: "text", placeholder: "Название услуги", "data-field": "h3" });
    const body = el("textarea", { class: "admin-text", placeholder: "Описание", "data-field": "p" });
    const val = el("input", { type: "text", placeholder: "Значение для формы (например: Консультация)", "data-field": "service_value" });
    title.value = value?.h3 || "";
    body.value = value?.p || "";
    val.value = value?.service_value || "";

    const removeBtn = el("button", { type: "button", class: "btn btn--secondary admin-item__remove", text: "Удалить" });
    const headRow = el("div", { class: "admin-item__row" }, [
      el("div", {}, [el("div", { class: "muted small", text: "Услуга" }), title]),
      removeBtn,
    ]);
    const cols = el("div", { class: "admin-item__cols" }, [body, val]);
    const item = el("div", { class: "admin-item", "data-kind": "service" }, [headRow, cols]);
    removeBtn.addEventListener("click", () => item.remove());
    root.appendChild(item);
  }

  addBtn?.addEventListener("click", () => addItem({ h3: "", p: "", service_value: "" }));

  function setValues(values) {
    root.innerHTML = "";
    (Array.isArray(values) ? values : []).forEach((v) => addItem(v));
    if (!root.children.length) addItem({ h3: "", p: "", service_value: "" });
  }

  function getValues() {
    return Array.from(root.querySelectorAll(".admin-item"))
      .map((item) => {
        const h3 = getInputValue(item.querySelector('[data-field="h3"]'));
        const p = getInputValue(item.querySelector('[data-field="p"]'));
        const service_value = getInputValue(item.querySelector('[data-field="service_value"]'));
        return {
          h3,
          p,
          service_value: service_value || h3,
          button_label: "Записаться",
        };
      })
      .filter((v) => v.h3 || v.p);
  }

  return { setValues, getValues, addItem };
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

  const diplomasQuickRow = qs("#diplomasQuickRow");
  const diplomasQuickFile = qs("#diplomasQuickFile");
  const uploadDiplomaQuickBtn = qs("#uploadDiplomaQuickBtn");
  const diplomasQuickHint = qs("#diplomasQuickHint");

  const reloadContentBtn = qs("#reloadContentBtn");
  const pullFromSiteBtn = qs("#pullFromSiteBtn");
  const saveContentBtn = qs("#saveContentBtn");
  const saveContentFromFieldsBtn = qs("#saveContentFromFieldsBtn");
  const copyContentJsonBtn = qs("#copyContentJsonBtn");
  const contentJson = qs("#contentJson");
  const contentHint = qs("#contentHint");

  const storiesReloadBtn = qs("#storiesReloadBtn");
  const addStoryBtn = qs("#addStoryBtn");
  const storiesItems = qs("#storiesItems");
  const storiesH2 = qs("#storiesH2");
  const storiesInitialCount = qs("#storiesInitialCount");
  const storiesHint = qs("#storiesHint");

  // Visual editor fields
  const cHeroPill = qs("#c_hero_pill");
  const cHeroH1 = qs("#c_hero_h1");
  const cHeroLead = qs("#c_hero_lead");
  const cAboutH2 = qs("#c_about_h2");
  const cWhenH2 = qs("#c_when_h2");
  const cServicesH2 = qs("#c_services_h2");
  const cHowH2 = qs("#c_how_h2");
  const cResultH2 = qs("#c_result_h2");
  const cResultChildH3 = qs("#c_result_child_h3");
  const cResultParentH3 = qs("#c_result_parent_h3");
  const cDiplomasH2 = qs("#c_diplomas_h2");
  const cStoriesH2 = qs("#c_stories_h2");
  const cStoriesInitial = qs("#c_stories_initial");
  const cFormH2 = qs("#c_form_h2");
  const cFormLead = qs("#c_form_lead");
  const cFormGeo = qs("#c_form_geo");
  const cFormAge = qs("#c_form_age");

  const diplomasItemsRoot = qs("#diplomasItems");
  const addDiplomaItemBtn = qs("#addDiplomaItem");
  const diplomasHint = qs("#diplomasHint");

  const heroBullets = mountTextList({
    root: qs("#heroBullets"),
    addBtn: qs("#addHeroBullet"),
    getPlaceholder: () => "Текст пункта",
    multiline: false,
  });
  const aboutParagraphs = mountTextList({
    root: qs("#aboutParagraphs"),
    addBtn: qs("#addAboutParagraph"),
    getPlaceholder: () => "Абзац",
    multiline: true,
  });
  const aboutCards = mountAboutCardsList({
    root: qs("#aboutCards"),
    addBtn: qs("#addAboutCard"),
  });
  const whenItems = mountTextList({
    root: qs("#whenItems"),
    addBtn: qs("#addWhenItem"),
    getPlaceholder: () => "Пункт",
    multiline: false,
  });
  const servicesItems = mountServicesList({
    root: qs("#servicesItems"),
    addBtn: qs("#addService"),
  });
  const howItems = mountTextList({
    root: qs("#howItems"),
    addBtn: qs("#addHowItem"),
    getPlaceholder: () => "Пункт",
    multiline: false,
  });
  const resultChildItems = mountTextList({
    root: qs("#resultChildItems"),
    addBtn: qs("#addResultChildItem"),
    getPlaceholder: () => "Пункт",
    multiline: false,
  });
  const resultParentItems = mountTextList({
    root: qs("#resultParentItems"),
    addBtn: qs("#addResultParentItem"),
    getPlaceholder: () => "Пункт",
    multiline: false,
  });

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

  // Ensure JSON editor always contains valid JSON (prevents accidental empty value errors).
  if (contentJson && !String(contentJson.value || "").trim()) {
    contentJson.value = "{}";
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
    loadContentUiFromJson();
  }

  async function upsertContentJson(obj) {
    const { data } = await sb.auth.getSession();
    if (!data?.session) {
      const err = new Error("Вы не вошли в админку. Сначала авторизуйтесь (email+пароль).");
      err.code = "not_authenticated";
      throw err;
    }
    const payload = {
      id: SITE_CONTENT_SINGLETON_ID,
      content_json: obj || {},
      updated_at: new Date().toISOString(),
    };
    const { error } = await sb.from("site_content").upsert(payload, { onConflict: "id" });
    if (error) throw error;
  }

  async function saveContent() {
    setText(contentHint, "");
    const raw = String(contentJson.value || "").trim() || "{}";
    if (raw !== contentJson.value) contentJson.value = raw;
    const parsed = safeJsonParse(raw);
    if (!parsed.ok) {
      setText(contentHint, `JSON невалидный: ${parsed.error?.message || "ошибка"}`);
      return;
    }
    try {
      await upsertContentJson(parsed.value);
      setText(contentHint, "Сохранено.");
    } catch (e) {
      setText(contentHint, `Ошибка сохранения: ${e?.message || "ошибка"}${e?.status ? ` (status: ${e.status})` : ""}`);
    }
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
    const { data: authSess } = await sb.auth.getSession();
    if (!authSess?.session) {
      setText(uploadHint, "Сначала войдите в админку (форма «Вход» выше). Без входа загрузка в Storage недоступна.");
      return;
    }
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

    const { error: upErr } = await sb.storage.from(getStorageBucketId()).upload(path, f, {
      upsert: true,
      contentType: f.type || undefined,
      cacheControl: "3600",
    });
    if (upErr) {
      setText(uploadHint, `Ошибка загрузки: ${upErr.message}${storageErrorHint(upErr.message)}`);
      return;
    }

    const { data: pub } = sb.storage.from(getStorageBucketId()).getPublicUrl(path);
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
    mountDiplomasQuickZone();
  });

  logoutBtn?.addEventListener("click", async () => {
    await sb.auth.signOut();
    await refreshSessionUi();
  });

  reloadContentBtn?.addEventListener("click", loadContent);
  saveContentBtn?.addEventListener("click", saveContent);

  function loadContentUiFromJson() {
    const obj = getContentObj() || {};
    if (cHeroPill) cHeroPill.value = obj.hero_pill || "";
    if (cHeroH1) cHeroH1.value = obj.hero_h1 || "";
    if (cHeroLead) cHeroLead.value = obj.hero_lead || "";
    heroBullets.setValues(obj.hero_bullets || []);

    if (cAboutH2) cAboutH2.value = obj.about_h2 || "";
    aboutParagraphs.setValues(obj.about_wide_paragraphs || []);
    aboutCards.setValues(obj.about_cards || []);

    if (cWhenH2) cWhenH2.value = obj.when_h2 || "";
    whenItems.setValues(obj.when_cards || []);

    if (cServicesH2) cServicesH2.value = obj.services_h2 || "";
    servicesItems.setValues(obj.services || []);

    if (cHowH2) cHowH2.value = obj.how_h2 || "";
    howItems.setValues(obj.how_cards || []);

    if (cResultH2) cResultH2.value = obj.result_h2 || "";
    if (cResultChildH3) cResultChildH3.value = obj.result_child_h3 || "Для ребёнка";
    if (cResultParentH3) cResultParentH3.value = obj.result_parent_h3 || "Для родителей";
    resultChildItems.setValues(obj.result_child_cards || []);
    resultParentItems.setValues(obj.result_parent_cards || []);

    if (cDiplomasH2) cDiplomasH2.value = obj.diplomas_h2 || "Мои документы";
    rebuildDiplomasUiFromJson();

    if (cStoriesH2) cStoriesH2.value = obj.stories_h2 || "Истории из практики";
    if (cStoriesInitial) cStoriesInitial.value = String(Number(obj.stories_initial_count || 6) || 6);

    if (cFormH2) cFormH2.value = obj.form_h2 || "";
    if (cFormLead) cFormLead.value = obj.form_lead || "";
    if (cFormGeo) cFormGeo.value = obj.form_geo_value || "";
    if (cFormAge) cFormAge.value = obj.form_age_value || "";

    updateFilledUi(appGrid);
  }

  function buildContentFromFields() {
    const base = getContentObj() || {};
    const childCards = resultChildItems.getValues();
    const parentCards = resultParentItems.getValues();
    const diplomasItems = readDiplomasFromUi();
    return {
      ...base,
      hero_pill: cHeroPill?.value || "",
      hero_h1: cHeroH1?.value || "",
      hero_lead: cHeroLead?.value || "",
      hero_bullets: heroBullets.getValues(),

      about_h2: cAboutH2?.value || "",
      about_wide_paragraphs: aboutParagraphs.getValues(),
      about_cards: aboutCards.getValues(),

      when_h2: cWhenH2?.value || "",
      when_cards: whenItems.getValues(),

      services_h2: cServicesH2?.value || "",
      services: servicesItems.getValues(),

      how_h2: cHowH2?.value || "",
      how_cards: howItems.getValues(),

      result_h2: cResultH2?.value || "",
      result_child_h3: cResultChildH3?.value || "",
      result_child_cards: childCards,
      result_parent_h3: cResultParentH3?.value || "",
      result_parent_cards: parentCards,
      result_cards: [...childCards, ...parentCards].filter(Boolean),

      diplomas_h2: cDiplomasH2?.value || "Мои документы",
      diplomas_items: diplomasItems,

      stories_h2: cStoriesH2?.value || "",
      stories_initial_count: Math.max(1, Math.min(9, Number(cStoriesInitial?.value || 6) || 6)),

      form_h2: cFormH2?.value || "",
      form_lead: cFormLead?.value || "",
      form_geo_value: cFormGeo?.value || "",
      form_age_value: cFormAge?.value || "",
    };
  }

  async function saveContentFromFields() {
    setText(contentHint, "");
    const obj = buildContentFromFields();
    setContentObj(obj);
    loadContentUiFromJson();
    try {
      await upsertContentJson(obj);
      setText(contentHint, "Сохранено (визуально).");
      await loadContent();
    } catch (e) {
      setText(contentHint, `Ошибка сохранения (визуально): ${e?.message || "ошибка"}${e?.status ? ` (status: ${e.status})` : ""}`);
    }
  }

  saveContentFromFieldsBtn?.addEventListener("click", saveContentFromFields);

  copyContentJsonBtn?.addEventListener("click", async () => {
    const text = prettyJson(getContentObj() || {});
    try {
      await navigator.clipboard.writeText(text);
      setText(contentHint, "JSON скопирован в буфер обмена.");
    } catch {
      contentJson?.focus();
      contentJson?.select?.();
      setText(contentHint, "Не удалось скопировать автоматически. JSON выделен — скопируйте вручную (Ctrl+C).");
    }
  });

  appGrid?.addEventListener("input", () => updateFilledUi(appGrid), true);
  appGrid?.addEventListener("change", () => updateFilledUi(appGrid), true);

  function getContentObj() {
    const parsed = safeJsonParse(contentJson.value || "{}");
    return parsed.ok && parsed.value && typeof parsed.value === "object" ? parsed.value : null;
  }

  function setContentObj(obj) {
    contentJson.value = prettyJson(obj || {});
  }

  function ensureDiplomasDefaults(obj) {
    if (!obj || typeof obj !== "object") return obj;
    if (typeof obj.diplomas_h2 !== "string") obj.diplomas_h2 = "Мои документы";
    if (!Array.isArray(obj.diplomas_items)) obj.diplomas_items = [];
    return obj;
  }

  function normalizeDiplomaItem(v) {
    if (typeof v === "string") {
      const url = v.trim();
      const kind = url.toLowerCase().includes(".pdf") ? "pdf" : "image";
      return url ? { url, kind } : null;
    }
    if (v && typeof v === "object") {
      const url = String(v.url || v.file_url || "").trim();
      const k = String(v.kind || "").trim().toLowerCase();
      const kind = k === "pdf" ? "pdf" : url.toLowerCase().includes(".pdf") ? "pdf" : "image";
      return url ? { url, kind } : null;
    }
    return null;
  }

  function readDiplomasFromUi() {
    if (!diplomasItemsRoot) return [];
    const rows = Array.from(diplomasItemsRoot.querySelectorAll(".admin-item"));
    return rows
      .map((row) => {
        const url = String(row.querySelector('[data-field="url"]')?.value || "").trim();
        const attrKind = String(row.getAttribute("data-kind") || "").trim().toLowerCase();
        const kind = attrKind === "pdf" || url.toLowerCase().includes(".pdf") ? "pdf" : "image";
        return url ? { url, kind } : null;
      })
      .filter(Boolean);
  }

  async function uploadDiplomaFile(file) {
    if (!file) throw new Error("Файл не выбран");
    if (!isAllowedDiplomaFile(file)) {
      throw new Error("Неподдерживаемый формат. Допустимы изображения (JPG, PNG, WebP, GIF, BMP, SVG) и PDF.");
    }
    if (file.size > DIPLOMA_MAX_BYTES) throw new Error("Файл больше 5 МБ. Уменьшите размер.");
    const ext = fileExt(file.name) || (diplomaKindFromFile(file) === "pdf" ? "pdf" : "jpg");
    const rand = Math.random().toString(16).slice(2);
    const path = `diplomas/${Date.now()}-${rand}.${ext}`;
    const { error: upErr } = await sb.storage.from(getStorageBucketId()).upload(path, file, {
      upsert: false,
      contentType: file.type || undefined,
      cacheControl: "3600",
    });
    if (upErr) throw upErr;
    const { data: pub } = sb.storage.from(getStorageBucketId()).getPublicUrl(path);
    const url = pub?.publicUrl;
    if (!url) throw new Error("Не получили публичную ссылку на файл");
    const kind = diplomaKindFromFile(file);
    return { url, kind };
  }

  let diplomasQuickZoneMounted = false;

  async function runDiplomaQuickUpload(file) {
    setText(diplomasQuickHint, "");
    if (!file) {
      setText(diplomasQuickHint, "Выберите файл.");
      return;
    }
    const { data: authSess } = await sb.auth.getSession();
    if (!authSess?.session) {
      setText(diplomasQuickHint, "Сначала войдите в админку (форма «Вход» выше). Без входа загрузка в Storage недоступна.");
      return;
    }
    try {
      const out = await uploadDiplomaFile(file);
      const parsed = safeJsonParse(contentJson.value || "{}");
      const obj = parsed.ok && parsed.value && typeof parsed.value === "object" ? parsed.value : {};
      ensureDiplomasDefaults(obj);
      obj.diplomas_items.push(out);
      setContentObj(obj);
      rebuildDiplomasUiFromJson();
      await saveContent();
      if (diplomasQuickFile) diplomasQuickFile.value = "";
      setText(diplomasQuickHint, "Загружено и сохранено в Supabase.");
    } catch (e) {
      setText(diplomasQuickHint, `Ошибка: ${e?.message || "не удалось"}${storageErrorHint(e?.message)}`);
    }
  }

  async function uploadDiplomaQuick() {
    await runDiplomaQuickUpload(diplomasQuickFile?.files?.[0]);
  }

  function mountDiplomasQuickZone() {
    if (diplomasQuickZoneMounted || !diplomasQuickRow) return;
    diplomasQuickZoneMounted = true;
    if (diplomasQuickFile) diplomasQuickFile.setAttribute("accept", DIPLOMA_ACCEPT_ATTR);

    diplomasQuickRow.addEventListener("dragover", (e) => {
      if (!e.dataTransfer?.types?.includes("Files")) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      diplomasQuickRow.classList.add("admin-row--drop");
    });
    diplomasQuickRow.addEventListener("dragleave", (e) => {
      if (!diplomasQuickRow.contains(e.relatedTarget)) diplomasQuickRow.classList.remove("admin-row--drop");
    });
    diplomasQuickRow.addEventListener("drop", async (e) => {
      if (!e.dataTransfer?.types?.includes("Files")) return;
      e.preventDefault();
      diplomasQuickRow.classList.remove("admin-row--drop");
      const f = e.dataTransfer?.files?.[0];
      if (f) await runDiplomaQuickUpload(f);
    });
  }

  let diplomasDomSyncAttached = false;
  function syncDiplomasJsonFromDom() {
    const obj2 = getContentObj();
    if (!obj2) return;
    ensureDiplomasDefaults(obj2);
    if (cDiplomasH2) obj2.diplomas_h2 = String(cDiplomasH2.value || "").trim() || "Мои документы";
    obj2.diplomas_items = readDiplomasFromUi();
    setContentObj(obj2);
    if (diplomasHint) setText(diplomasHint, "Изменения внесены в JSON. Нажмите «Сохранить (визуально)» в блоке «Тексты сайта».");
  }

  function attachDiplomasDomSyncOnce() {
    if (diplomasDomSyncAttached || !diplomasItemsRoot) return;
    diplomasDomSyncAttached = true;
    diplomasItemsRoot.addEventListener("input", () => syncDiplomasJsonFromDom(), true);
    diplomasItemsRoot.addEventListener("change", () => syncDiplomasJsonFromDom(), true);
  }

  function rebuildDiplomasUiFromJson() {
    if (!diplomasItemsRoot) return;
    if (diplomasHint) setText(diplomasHint, "");
    const obj = getContentObj();
    if (!obj) {
      if (diplomasHint) setText(diplomasHint, "JSON невалидный. Сначала исправьте JSON в «Тексты сайта».");
      diplomasItemsRoot.innerHTML = "";
      return;
    }
    ensureDiplomasDefaults(obj);
    if (cDiplomasH2) obj.diplomas_h2 = String(cDiplomasH2.value || obj.diplomas_h2 || "Мои документы").trim();
    const items = (Array.isArray(obj.diplomas_items) ? obj.diplomas_items : [])
      .map(normalizeDiplomaItem)
      .filter(Boolean);
    obj.diplomas_items = items;
    setContentObj(obj);

    diplomasItemsRoot.innerHTML = "";
    let draggingEl = null;

    items.forEach((d, idx) => {
      const url = el("input", {
        type: "text",
        "data-field": "url",
        placeholder: "Публичная ссылка https… (если файл уже где-то размещён)",
      });
      url.value = d.url;

      const preview = el("div", { class: "admin-preview-wrap" });
      const img = el("img", { class: "admin-preview", alt: "Превью" });
      const pdfBadge = el("div", { class: "admin-preview admin-preview--pdf", text: "PDF" });
      preview.appendChild(img);
      preview.appendChild(pdfBadge);

      let row = null;
      const syncPreview = () => {
        const u = String(url.value || "").trim();
        const kind =
          String(row?.getAttribute("data-kind") || "").trim() || (u.toLowerCase().includes(".pdf") ? "pdf" : "image");
        if (!u) {
          img.style.display = "none";
          pdfBadge.style.display = "none";
          img.removeAttribute("src");
          return;
        }
        if (kind === "pdf") {
          img.style.display = "none";
          pdfBadge.style.display = "grid";
          img.removeAttribute("src");
        } else {
          pdfBadge.style.display = "none";
          img.src = u;
          img.style.display = "block";
        }
      };

      const removeBtn = el("button", { type: "button", class: "btn btn--secondary admin-item__remove", text: "Удалить" });

      const headRow = el("div", { class: "admin-item__row" }, [
        el("div", {}, [el("div", { class: "muted small", text: `Файл #${idx + 1}` })]),
        removeBtn,
      ]);

      const grip = el("div", {
        class: "admin-diploma-grip",
        title: "Потяните, чтобы изменить порядок",
        text: "⠿",
        role: "button",
        tabindex: "0",
        "aria-grabbed": "false",
      });
      grip.setAttribute("draggable", "true");

      const body = el("div", { class: "admin-diploma-body" }, [headRow, preview, url]);

      const layout = el("div", { class: "admin-diploma-layout" }, [grip, body]);

      row = el("div", { class: "admin-item", "data-kind": d.kind }, [layout]);

      grip.addEventListener("dragstart", (e) => {
        draggingEl = row;
        row.classList.add("admin-item--dragging");
        grip.setAttribute("aria-grabbed", "true");
        try {
          e.dataTransfer.setData("text/plain", "diploma-reorder");
          e.dataTransfer.effectAllowed = "move";
        } catch {
          /* ignore */
        }
      });
      grip.addEventListener("dragend", () => {
        draggingEl = null;
        row.classList.remove("admin-item--dragging");
        grip.setAttribute("aria-grabbed", "false");
        syncDiplomasJsonFromDom();
      });

      row.addEventListener("dragover", (e) => {
        if (!draggingEl) return;
        e.preventDefault();
        if (draggingEl === row) return;
        const rect = row.getBoundingClientRect();
        const before = e.clientY < rect.top + rect.height / 2;
        diplomasItemsRoot.insertBefore(draggingEl, before ? row : row.nextSibling);
      });

      url.addEventListener("input", () => {
        const u = String(url.value || "").trim();
        row.setAttribute("data-kind", u.toLowerCase().includes(".pdf") ? "pdf" : "image");
        syncPreview();
        syncDiplomasJsonFromDom();
      });

      removeBtn.addEventListener("click", () => {
        row.remove();
        syncDiplomasJsonFromDom();
      });

      diplomasItemsRoot.appendChild(row);
      syncPreview();
    });

    if (!items.length && diplomasHint) setText(diplomasHint, "Пока файлов нет — загрузите в карточке «Мои документы» выше (как фото на главной).");

    attachDiplomasDomSyncOnce();
  }

  function addDiplomaUi() {
    const obj = getContentObj();
    if (!obj) {
      if (diplomasHint) setText(diplomasHint, "JSON невалидный. Сначала исправьте JSON в «Тексты сайта».");
      return;
    }
    ensureDiplomasDefaults(obj);
    obj.diplomas_items.unshift({ url: "", kind: "image" });
    setContentObj(obj);
    rebuildDiplomasUiFromJson();
    if (diplomasHint) setText(diplomasHint, "Добавлена пустая строка — вставьте ссылку или загрузите файл в карточке выше.");
  }

  function ensureStoriesDefaults(obj) {
    if (!obj || typeof obj !== "object") return obj;
    if (typeof obj.stories_h2 !== "string") obj.stories_h2 = "Истории из практики";
    if (typeof obj.stories_initial_count !== "number") obj.stories_initial_count = 6;
    if (!Array.isArray(obj.stories_items)) obj.stories_items = [];
    return obj;
  }

  function readStoryFromRow(row) {
    const get = (sel) => String(row.querySelector(sel)?.value ?? "").trim();
    return {
      photo_url: get('[data-field="photo_url"]'),
      parent_name: get('[data-field="parent_name"]'),
      child_age: get('[data-field="child_age"]'),
      problem: get('[data-field="problem"]'),
      text: get('[data-field="text"]'),
      recommendation: get('[data-field="recommendation"]'),
    };
  }

  async function uploadStoryPhoto(file) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const rand = Math.random().toString(16).slice(2);
    const path = `stories/${Date.now()}-${rand}.${ext}`;
    const { error: upErr } = await sb.storage.from(getStorageBucketId()).upload(path, file, {
      upsert: false,
      contentType: file.type || undefined,
      cacheControl: "3600",
    });
    if (upErr) throw upErr;
    const { data: pub } = sb.storage.from(getStorageBucketId()).getPublicUrl(path);
    const url = pub?.publicUrl;
    if (!url) throw new Error("Не получили публичную ссылку на фото");
    return url;
  }

  function rebuildStoriesUiFromJson() {
    setText(storiesHint, "");
    const obj = getContentObj();
    if (!obj) {
      setText(storiesHint, "JSON невалидный. Сначала исправьте JSON в «Тексты сайта».");
      return;
    }
    ensureStoriesDefaults(obj);
    setContentObj(obj);

    if (storiesH2) storiesH2.value = obj.stories_h2 || "Истории из практики";
    if (storiesInitialCount) storiesInitialCount.value = String(Math.max(1, Math.min(9, Number(obj.stories_initial_count || 6) || 6)));

    if (!storiesItems) return;
    storiesItems.innerHTML = "";

    const items = Array.isArray(obj.stories_items) ? obj.stories_items : [];
    if (!items.length) {
      setText(storiesHint, "Историй пока нет. Нажмите «Добавить историю».");
    }

    items.forEach((s, idx) => {
      const photo = el("input", { type: "text", "data-field": "photo_url", placeholder: "Ссылка на фото" });
      photo.value = String(s?.photo_url || "");

      const img = el("img", { class: "admin-preview", alt: "Фото истории" });
      const syncPreview = () => {
        const url = String(photo.value || "").trim();
        if (!url) {
          img.style.display = "none";
          img.removeAttribute("src");
          return;
        }
        img.src = url;
        img.style.display = "block";
      };
      syncPreview();
      photo.addEventListener("input", syncPreview);

      const file = el("input", { type: "file", accept: "image/jpeg,image/png,image/webp" });
      const uploadBtn = el("button", { type: "button", class: "btn btn--secondary", text: "Загрузить фото" });
      const uploadHint = el("div", { class: "muted small", text: "" });

      uploadBtn.addEventListener("click", async () => {
        const f = file.files?.[0];
        if (!f) {
          uploadHint.textContent = "Выберите файл.";
          return;
        }
        uploadHint.textContent = "Загружаю…";
        uploadBtn.disabled = true;
        try {
          const url = await uploadStoryPhoto(f);
          photo.value = url;
          syncPreview();
          uploadHint.textContent = "Готово. Не забудьте «Сохранить» тексты сайта.";
        } catch (e) {
          uploadHint.textContent = `Ошибка: ${e?.message || "не удалось"}${storageErrorHint(e?.message)}`;
        } finally {
          uploadBtn.disabled = false;
        }
      });
      file.addEventListener("change", () => {
        if (file.files?.[0]) uploadBtn.click();
      });

      const parentName = el("input", { type: "text", "data-field": "parent_name", placeholder: "Имя/инициалы (например: Анна, мама Миши)" });
      parentName.value = String(s?.parent_name || "");
      const childAge = el("input", { type: "text", "data-field": "child_age", placeholder: "Возраст ребёнка (например: 4 месяца)" });
      childAge.value = String(s?.child_age || "");
      const problem = el("input", { type: "text", "data-field": "problem", placeholder: "Запрос/проблема (1 строка)" });
      problem.value = String(s?.problem || "");
      const text = el("textarea", { class: "admin-text", "data-field": "text", placeholder: "Текст отзыва/истории" });
      text.value = String(s?.text || "");
      const rec = el("input", { type: "text", "data-field": "recommendation", placeholder: "Рекомендация/результат (коротко)" });
      rec.value = String(s?.recommendation || "");

      const removeBtn = el("button", { type: "button", class: "btn btn--secondary admin-item__remove", text: "Удалить" });
      const headRow = el("div", { class: "admin-item__row" }, [
        el("div", {}, [el("div", { class: "muted small", text: `История #${idx + 1}` }), parentName]),
        removeBtn,
      ]);

      const row = el("div", { class: "admin-item" }, [
        headRow,
        img,
        el("div", { class: "admin-item__cols" }, [childAge, problem]),
        el("div", { class: "admin-item__cols" }, [photo, el("div", {}, [file, uploadBtn, uploadHint])]),
        text,
        rec,
      ]);

      const syncBackToJson = () => {
        const obj2 = getContentObj();
        if (!obj2) return;
        ensureStoriesDefaults(obj2);
        if (storiesH2) obj2.stories_h2 = String(storiesH2.value || "").trim();
        if (storiesInitialCount) obj2.stories_initial_count = Math.max(1, Math.min(9, Number(storiesInitialCount.value || 6) || 6));
        const allRows = Array.from(storiesItems.querySelectorAll(".admin-item"));
        obj2.stories_items = allRows.map((r) => readStoryFromRow(r)).filter((v) => v.photo_url || v.parent_name || v.child_age || v.problem || v.text || v.recommendation);
        setContentObj(obj2);
        setText(storiesHint, "Изменения внесены в JSON. Нажмите «Сохранить» в «Тексты сайта».");
      };

      row.addEventListener("input", () => syncBackToJson(), true);
      row.addEventListener("change", () => syncBackToJson(), true);

      removeBtn.addEventListener("click", () => {
        row.remove();
        syncBackToJson();
      });

      storiesItems.appendChild(row);
    });
  }

  function addStoryUi() {
    const obj = getContentObj();
    if (!obj) {
      setText(storiesHint, "JSON невалидный. Сначала исправьте JSON в «Тексты сайта».");
      return;
    }
    ensureStoriesDefaults(obj);
    obj.stories_items.unshift({
      photo_url: "",
      parent_name: "",
      child_age: "",
      problem: "",
      text: "",
      recommendation: "",
    });
    setContentObj(obj);
    rebuildStoriesUiFromJson();
  }

  storiesReloadBtn?.addEventListener("click", rebuildStoriesUiFromJson);
  addStoryBtn?.addEventListener("click", addStoryUi);
  storiesH2?.addEventListener("input", rebuildStoriesUiFromJson);
  storiesInitialCount?.addEventListener("change", rebuildStoriesUiFromJson);

  addDiplomaItemBtn?.addEventListener("click", addDiplomaUi);
  cDiplomasH2?.addEventListener("input", rebuildDiplomasUiFromJson);

  async function pullFromSiteUi() {
    setText(contentHint, "");
    setText(contentHint, "Подтягиваю тексты с главной страницы…");
    try {
      const res = await fetch("./index.html", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");

      const hero = doc.querySelector(".hero");
      const heroBulletsEls = Array.from(doc.querySelectorAll(".hero__bullets li"));
      const hero_image_url = toSrc(doc.querySelector(".hero__media img"));

      const about = doc.querySelector("#about");
      const aboutWideParas = Array.from(about?.querySelectorAll(".card--wide p") || []).map((p) => toText(p)).filter(Boolean);
      const aboutCardsEls = Array.from(about?.querySelectorAll(".cards:nth-of-type(2) .card") || []);

      const when = doc.querySelector(".section--alt");
      const whenCardsEls = Array.from(when?.querySelectorAll(".cards .card") || []);

      const services = doc.querySelector("#services");
      const servicesCardsEls = Array.from(services?.querySelectorAll(".card") || []);

      const how = doc.querySelector("#how");
      const howCardsEls = Array.from(how?.querySelectorAll(".cards .card") || []);

      const resultSection = Array.from(doc.querySelectorAll("main > section.section")).find((s) =>
        toText(s.querySelector("h2")).toLowerCase().includes("результат")
      );
      const childGroup = resultSection?.querySelector('[data-result-group="child"]');
      const parentGroup = resultSection?.querySelector('[data-result-group="parent"]');
      const splitDom = Boolean(childGroup && parentGroup);

      const result_child_h3 = splitDom ? toText(childGroup.querySelector("h3")) : "Для ребёнка";
      const result_parent_h3 = splitDom ? toText(parentGroup.querySelector("h3")) : "Для родителей";
      const result_child_cards = splitDom ? Array.from(childGroup.querySelectorAll(".cards .card")).map((c) => toText(c)).filter(Boolean) : [];
      const result_parent_cards = splitDom ? Array.from(parentGroup.querySelectorAll(".cards .card")).map((c) => toText(c)).filter(Boolean) : [];

      const legacyResultCards = !splitDom && resultSection
        ? Array.from(resultSection.querySelectorAll(".cards .card")).map((c) => toText(c)).filter(Boolean)
        : [];

      const form = doc.querySelector("#form");
      const formGeo = toText(form?.querySelector(".mini__item:nth-child(1) .mini__value"));
      const formAge = toText(form?.querySelector(".mini__item:nth-child(2) .mini__value"));
      const formLead = toText(form?.querySelector(".form-grid__text .muted"));

      const base = getContentObj() || {};
      const next = {
        ...base,
        hero_pill: toText(hero?.querySelector(".pill")) || base.hero_pill,
        hero_h1: toText(hero?.querySelector("h1")) || base.hero_h1,
        hero_lead: toText(hero?.querySelector(".lead")) || base.hero_lead,
        hero_bullets: heroBulletsEls.map((li) => toText(li)).filter(Boolean),
        hero_image_url: hero_image_url || base.hero_image_url,

        about_h2: toText(about?.querySelector("h2")) || base.about_h2,
        about_wide_paragraphs: aboutWideParas.length ? aboutWideParas : base.about_wide_paragraphs,
        about_cards: aboutCardsEls.map((card) => ({ h3: toText(card.querySelector("h3")), p: toText(card.querySelector("p")) })).filter((x) => x.h3 || x.p),

        when_h2: toText(when?.querySelector("h2")) || base.when_h2,
        when_cards: whenCardsEls.map((c) => toText(c)).filter(Boolean),

        services_h2: toText(services?.querySelector("h2")) || base.services_h2,
        services: servicesCardsEls.map((card) => {
          const h3 = toText(card.querySelector("h3"));
          const p = toText(card.querySelector("p"));
          const btn = card.querySelector("button[data-service]");
          const service_value = String(btn?.getAttribute?.("data-service") ?? "").trim() || h3;
          const button_label = toText(btn) || "Записаться";
          return { h3, p, service_value, button_label };
        }).filter((x) => x.h3 || x.p),

        how_h2: toText(how?.querySelector("h2")) || base.how_h2,
        how_cards: howCardsEls.map((c) => toText(c)).filter(Boolean),

        result_h2: toText(resultSection?.querySelector("h2")) || base.result_h2,
        result_child_h3,
        result_parent_h3,
        result_child_cards: result_child_cards.length ? result_child_cards : base.result_child_cards,
        result_parent_cards: result_parent_cards.length ? result_parent_cards : base.result_parent_cards,
        result_cards: (result_child_cards.length || result_parent_cards.length)
          ? [...result_child_cards, ...result_parent_cards].filter(Boolean)
          : (legacyResultCards.length ? legacyResultCards : base.result_cards),

        form_h2: toText(form?.querySelector("h2")) || base.form_h2,
        form_lead: formLead || base.form_lead,
        form_geo_value: formGeo || base.form_geo_value,
        form_age_value: formAge || base.form_age_value,
      };

      setContentObj(next);
      setText(contentHint, "Подтянуто с главной. Проверьте JSON и нажмите «Сохранить».");
      rebuildStoriesUiFromJson();
    } catch (e) {
      setText(contentHint, `Не удалось подтянуть: ${e?.message || "ошибка"}`);
    }
  }

  pullFromSiteBtn?.addEventListener("click", pullFromSiteUi);

  reloadLegalBtn?.addEventListener("click", loadLegal);
  saveLegalBtn?.addEventListener("click", saveLegal);

  uploadHeroBtn?.addEventListener("click", uploadHero);
  uploadDiplomaQuickBtn?.addEventListener("click", uploadDiplomaQuick);

  reloadLeadsBtn?.addEventListener("click", loadLeads);

  const ok = await refreshSessionUi();
  if (ok) {
    mountDiplomasQuickZone();
    await Promise.all([loadContent(), loadLegal(), loadLeads()]);
    rebuildStoriesUiFromJson();
    loadContentUiFromJson();
  }
});

