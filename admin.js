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
  const pullFromSiteBtn = qs("#pullFromSiteBtn");
  const saveContentBtn = qs("#saveContentBtn");
  const contentJson = qs("#contentJson");
  const contentHint = qs("#contentHint");

  const storiesReloadBtn = qs("#storiesReloadBtn");
  const addStoryBtn = qs("#addStoryBtn");
  const storiesItems = qs("#storiesItems");
  const storiesH2 = qs("#storiesH2");
  const storiesInitialCount = qs("#storiesInitialCount");
  const storiesHint = qs("#storiesHint");

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

  function getContentObj() {
    const parsed = safeJsonParse(contentJson.value || "{}");
    return parsed.ok && parsed.value && typeof parsed.value === "object" ? parsed.value : null;
  }

  function setContentObj(obj) {
    contentJson.value = prettyJson(obj || {});
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
    const { error: upErr } = await sb.storage.from("site-assets").upload(path, file, {
      upsert: false,
      contentType: file.type || undefined,
      cacheControl: "3600",
    });
    if (upErr) throw upErr;
    const { data: pub } = sb.storage.from("site-assets").getPublicUrl(path);
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
          uploadHint.textContent = `Ошибка: ${e?.message || "не удалось"}`;
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

  reloadLeadsBtn?.addEventListener("click", loadLeads);

  const ok = await refreshSessionUi();
  if (ok) {
    await Promise.all([loadContent(), loadLegal(), loadLeads()]);
    rebuildStoriesUiFromJson();
  }
});

