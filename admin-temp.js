const SESSION_KEY = "cmtv223:admin_session";
const CONTENT_KEY = "cmtv223:site_content";
const LEGAL_KEY = "cmtv223:legal_texts";
const LEADS_KEY = "cmtv223:leads";
const SITE_CONTENT_SINGLETON_ID = 1;

const ADMINS = {
  "oxanadavidova86@gmail.com": "X561po190",
  "geenvx@gmail.com": "#zxcvbnm9",
};

function qs(sel, root = document) {
  return root.querySelector(sel);
}

function isFilledValue(v) {
  if (v == null) return false;
  return String(v).trim().length > 0;
}

function updateFilledUi(root = document) {
  // Single fields
  Array.from(root.querySelectorAll(".field")).forEach((field) => {
    const input = field.querySelector("input, textarea, select");
    if (!input) return;
    // ignore file inputs
    if (input.tagName === "INPUT" && String(input.type).toLowerCase() === "file") return;
    const filled = isFilledValue(input.value);
    field.classList.toggle("field--filled", filled);
    field.classList.toggle("field--empty", !filled);
  });

  // List items
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

function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function prettyJson(obj) {
  return JSON.stringify(obj, null, 2);
}

function toText(el) {
  return String(el?.textContent ?? "").trim();
}

function toSrc(el) {
  return String(el?.getAttribute?.("src") ?? "").trim();
}

function nowIso() {
  return new Date().toISOString();
}

function formatDt(isoOrText) {
  if (!isoOrText) return "";
  // if old demo value like "14.04.2026, 12:12:12"
  if (String(isoOrText).includes(".")) return String(isoOrText);
  try {
    return new Date(isoOrText).toLocaleString("ru-RU");
  } catch {
    return String(isoOrText);
  }
}

function getDefaultContent() {
  return {
    hero_pill: "Выезд на дом • дети 0–1,5 лет • 20 лет опыта",
    hero_h1: "Бережный детский массаж с заботой и спокойствием для мамы",
    hero_lead:
      "Помогаю малышу развиваться гармонично, мягко корректирую тонус и поддерживаю родителей понятными рекомендациями.",
    hero_bullets: [
      "Без стресса и слёз — ориентируюсь на состояние ребёнка",
      "Объясняю родителям простыми словами “что и почему”",
      "Остаюсь на связи после курса",
    ],
    hero_image_url: "./Oxana-hero.png",
    about_h2: "Обо мне",
    about_wide_paragraphs: [
      "Я — Оксана, детский массажист с более чем 20-летним опытом работы с малышами от рождения до 1,5 лет.",
      "Мой путь начался с практики в медицинском центре, где я впервые взяла на руки новорождённого ребёнка — и поняла, что хочу помогать самым маленьким расти здоровыми и гармоничными.",
      "Доп. квалификация: детский медицинский массаж, грудничковое плавание, фитбол-кинезитерапия, патронаж новорождённых.",
    ],
    about_cards: [
      {
        h3: "Мой подход",
        p: "Работаю мягко и бережно, без стресса, ориентируясь на состояние ребёнка. На каждом шаге объясняю родителям, что делаем и зачем.",
      },
      {
        h3: "Почему мне доверяют",
        p: "Я мама двоих детей и понимаю тревоги родителей. Поддерживаю и даю уверенность, остаюсь на связи после курса.",
      },
      {
        h3: "Моя миссия",
        p: "Помочь родителям не упустить важные моменты в развитии малыша и чувствовать, что они всё делают правильно.",
      },
    ],
    when_h2: "Когда стоит обратиться",
    when_cards: [
      "Колики, беспокойный сон",
      "Гипо- или гипертонус",
      "Задержка развития",
      "Подготовка к ползанию и ходьбе",
      "Страх навредить ребёнку",
      "Неуверенность в уходе",
    ],
    services_h2: "Услуги",
    services: [
      {
        h3: "Патронаж новорождённого",
        p: "Поддержка с первых дней жизни малыша.",
        button_label: "Записаться",
        service_value: "Патронаж",
      },
      {
        h3: "Курс массажа",
        p: "10 сеансов для гармоничного развития.",
        button_label: "Записаться",
        service_value: "Курс массажа",
      },
      {
        h3: "Консультация",
        p: "Ответы на вопросы и рекомендации.",
        button_label: "Записаться",
        service_value: "Консультация",
      },
      {
        h3: "Обучение родителей",
        p: "Научу безопасным приёмам массажа.",
        button_label: "Записаться",
        service_value: "Обучение родителей",
      },
      {
        h3: "Экстренный выезд",
        p: "Когда нужна помощь здесь и сейчас.",
        button_label: "Записаться",
        service_value: "Экстренный выезд",
      },
    ],
    how_h2: "Как проходит работа",
    how_cards: [
      "Знакомство и диагностика",
      "Индивидуальный план",
      "Бережный массаж + фитбол",
      "Обучение родителей",
      "Поддержка после курса",
    ],
    result_h2: "Результат",
    result_child_h3: "Для ребёнка",
    result_child_cards: ["Спокойный ребёнок", "Улучшение сна", "Снижение колик", "Гармоничное развитие"],
    result_parent_h3: "Для родителей",
    result_parent_cards: ["Уверенность родителей"],
    // legacy field (kept for backwards compatibility)
    result_cards: ["Спокойный ребёнок", "Улучшение сна", "Снижение колик", "Гармоничное развитие", "Уверенность родителей"],
    stories_h2: "Истории из практики",
    stories_items: [],
    form_h2: "Записаться",
    form_lead:
      "Оставьте контакты — я напишу/позвоню и подберу удобное время. Перед отправкой нужно согласиться на обработку персональных данных.",
    form_geo_value: "Москва и МО",
    form_age_value: "0–1,5 лет",
  };
}

function getDefaultLegal() {
  return {
    version: "local-1",
    consent_short_text:
      "Нажимая «Отправить заявку», вы соглашаетесь на обработку персональных данных для обратной связи.",
    consent_title: "Согласие на обработку персональных данных",
    consent_body_html:
      "<p>Для отправки заявки требуется ваше согласие на обработку персональных данных (имя, телефон и другие данные, которые вы укажете) исключительно для обратной связи и записи.</p><p>Вы можете отозвать согласие, написав нам, и мы прекратим обработку, если это не противоречит требованиям закона.</p>",
    policy_title: "Политика обработки персональных данных",
    policy_body_html:
      "<p><b>Шаблон</b>. Заполните/уточните под вашу ситуацию (ИП/самозанятый/ООО, адрес, контакты).</p><h4>1. Общие положения</h4><p>Настоящая Политика определяет порядок обработки и защиты персональных данных пользователей сайта.</p><h4>2. Какие данные обрабатываются</h4><ul><li>Имя</li><li>Телефон</li><li>Возраст ребёнка (если указан)</li><li>Выбранная услуга</li></ul><h4>3. Цели обработки</h4><ul><li>Обратная связь</li><li>Запись на консультацию/услугу</li></ul><h4>4. Правовые основания</h4><p>Согласие субъекта персональных данных.</p><h4>5. Сроки хранения</h4><p>До достижения целей обработки или до отзыва согласия, если иное не требуется законом.</p><h4>6. Права субъекта</h4><p>Пользователь вправе запросить сведения об обработке, уточнение, блокирование или удаление данных.</p><h4>7. Контакты оператора</h4><p>Укажите контакты оператора ПДн (телефон/почта).</p>",
  };
}

function getContent() {
  return safeJsonParse(localStorage.getItem(CONTENT_KEY), null) || getDefaultContent();
}

function setContent(obj) {
  localStorage.setItem(CONTENT_KEY, JSON.stringify(obj));
}

function getLegal() {
  return safeJsonParse(localStorage.getItem(LEGAL_KEY), null) || getDefaultLegal();
}

function setLegal(obj) {
  localStorage.setItem(LEGAL_KEY, JSON.stringify(obj));
}

function getLeads() {
  const arr = safeJsonParse(localStorage.getItem(LEADS_KEY), []);
  return Array.isArray(arr) ? arr : [];
}

function setLeads(arr) {
  localStorage.setItem(LEADS_KEY, JSON.stringify(arr));
}

function downloadJson(filename, obj) {
  const blob = new Blob([prettyJson(obj)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
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
    return Array.from(root.querySelectorAll(".admin-item")).map((item) => {
      const input = item.querySelector('[data-field="text"]');
      return getInputValue(input);
    }).filter(Boolean);
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
      el("div", {}, [
        el("div", { class: "muted small", text: "Карточка" }),
        title,
      ]),
      removeBtn,
    ]);
    const item = el("div", { class: "admin-item", "data-kind": "about_card" }, [
      headRow,
      body,
    ]);
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
    return Array.from(root.querySelectorAll(".admin-item")).map((item) => {
      const h3 = getInputValue(item.querySelector('[data-field="h3"]'));
      const p = getInputValue(item.querySelector('[data-field="p"]'));
      return { h3, p };
    }).filter((v) => v.h3 || v.p);
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
    return Array.from(root.querySelectorAll(".admin-item")).map((item) => {
      const h3 = getInputValue(item.querySelector('[data-field="h3"]'));
      const p = getInputValue(item.querySelector('[data-field="p"]'));
      const service_value = getInputValue(item.querySelector('[data-field="service_value"]'));
      return {
        h3,
        p,
        service_value: service_value || h3,
        button_label: "Записаться",
      };
    }).filter((v) => v.h3 || v.p);
  }

  return { setValues, getValues, addItem };
}

function mountStoriesList({ root, addBtn }) {
  async function readFileAsDataUrl(file) {
    return await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result || ""));
      r.onerror = () => reject(new Error("File read error"));
      r.readAsDataURL(file);
    });
  }

  function addItem(
    value = { photo_url: "", parent_name: "", child_age: "", problem: "", text: "", recommendation: "" }
  ) {
    const img = document.createElement("img");
    img.style.width = "100%";
    img.style.maxHeight = "140px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "12px";
    img.style.display = value?.photo_url ? "block" : "none";
    if (value?.photo_url) img.src = value.photo_url;

    const photoUrl = el("input", { type: "text", placeholder: "Ссылка на фото (или загрузите файл ниже)", "data-field": "photo_url" });
    photoUrl.value = value?.photo_url || "";

    const file = el("input", { type: "file", accept: "image/jpeg,image/png,image/webp" });
    const uploadBtn = el("button", { type: "button", class: "btn btn--secondary", text: "Загрузить фото" });
    const uploadHint = el("div", { class: "muted small", text: "" });

    function syncPreviewFromUrl() {
      const url = String(photoUrl.value || "").trim();
      if (!url) {
        img.style.display = "none";
        img.removeAttribute("src");
        return;
      }
      img.src = url;
      img.style.display = "block";
    }

    photoUrl.addEventListener("input", () => {
      uploadHint.textContent = "";
      syncPreviewFromUrl();
    });

    uploadBtn.addEventListener("click", async () => {
      const f = file?.files?.[0];
      if (!f) {
        uploadHint.textContent = "Выберите файл.";
        return;
      }
      if (f.size > 2 * 1024 * 1024) {
        uploadHint.textContent = "Файл больше 2 МБ. Уменьшите размер.";
        return;
      }
      uploadHint.textContent = "Загружаю…";
      try {
        const url = await readFileAsDataUrl(f);
        photoUrl.value = url;
        syncPreviewFromUrl();
        uploadHint.textContent = "Готово.";
      } catch {
        uploadHint.textContent = "Не удалось загрузить.";
      }
    });

    // Auto-upload on file selection (most users expect this)
    file.addEventListener("change", () => {
      if (file?.files?.[0]) uploadBtn.click();
    });

    const parentName = el("input", { type: "text", placeholder: "Имя/инициалы (например: Анна, мама Миши)", "data-field": "parent_name" });
    parentName.value = value?.parent_name || "";
    const childAge = el("input", { type: "text", placeholder: "Возраст ребёнка (например: 4 месяца)", "data-field": "child_age" });
    childAge.value = value?.child_age || "";
    const problem = el("input", { type: "text", placeholder: "Запрос/проблема (1 строка)", "data-field": "problem" });
    problem.value = value?.problem || "";
    const text = el("textarea", { class: "admin-text", placeholder: "Текст отзыва/истории", "data-field": "text" });
    text.value = value?.text || "";
    const rec = el("input", { type: "text", placeholder: "Рекомендация/результат (коротко)", "data-field": "recommendation" });
    rec.value = value?.recommendation || "";

    const removeBtn = el("button", { type: "button", class: "btn btn--secondary admin-item__remove", text: "Удалить" });
    const headRow = el("div", { class: "admin-item__row" }, [
      el("div", {}, [
        el("div", { class: "muted small", text: "История" }),
        parentName,
      ]),
      removeBtn,
    ]);

    const photoTools = el("div", { class: "admin-item__cols" }, [photoUrl, el("div", {}, [file, uploadBtn, uploadHint])]);
    const cols2 = el("div", { class: "admin-item__cols" }, [childAge, problem]);

    const item = el("div", { class: "admin-item", "data-kind": "story" }, [
      headRow,
      img,
      photoTools,
      cols2,
      text,
      rec,
    ]);

    removeBtn.addEventListener("click", () => item.remove());
    root.appendChild(item);
  }

  addBtn?.addEventListener("click", () =>
    addItem({ photo_url: "", parent_name: "", child_age: "", problem: "", text: "", recommendation: "" })
  );

  function setValues(values) {
    root.innerHTML = "";
    (Array.isArray(values) ? values : []).forEach((v) => addItem(v));
    if (!root.children.length) {
      addItem({ photo_url: "", parent_name: "", child_age: "", problem: "", text: "", recommendation: "" });
    }
  }

  function getValues() {
    return Array.from(root.querySelectorAll(".admin-item")).map((item) => {
      const photo_url = getInputValue(item.querySelector('[data-field="photo_url"]'));
      const parent_name = getInputValue(item.querySelector('[data-field="parent_name"]'));
      const child_age = getInputValue(item.querySelector('[data-field="child_age"]'));
      const problem = getInputValue(item.querySelector('[data-field="problem"]'));
      const text = getInputValue(item.querySelector('[data-field="text"]'));
      const recommendation = getInputValue(item.querySelector('[data-field="recommendation"]'));
      return { photo_url, parent_name, child_age, problem, text, recommendation };
    }).filter((v) => v.photo_url || v.parent_name || v.child_age || v.problem || v.text || v.recommendation);
  }

  return { setValues, getValues, addItem };
}

document.addEventListener("DOMContentLoaded", () => {
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

  const resetContentBtn = qs("#resetContentBtn");
  const pullFromSiteBtn = qs("#pullFromSiteBtn");
  const exportContentBtn = qs("#exportContentBtn");
  const copyContentJsonBtn = qs("#copyContentJsonBtn");
  const publishContentBtn = qs("#publishContentBtn");
  const saveContentBtn = qs("#saveContentBtn");
  const saveContentJsonBtn = qs("#saveContentJsonBtn");
  const contentJson = qs("#contentJson");
  const contentHint = qs("#contentHint");
  const publishHint = qs("#publishHint");

  // Content fields (visual editor)
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

  const cStoriesH2 = qs("#c_stories_h2");
  const cStoriesInitial = qs("#c_stories_initial");

  const cFormH2 = qs("#c_form_h2");
  const cFormLead = qs("#c_form_lead");
  const cFormGeo = qs("#c_form_geo");
  const cFormAge = qs("#c_form_age");

  // Repeaters
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

  const storiesItems = mountStoriesList({
    root: qs("#storiesItems"),
    addBtn: qs("#addStory"),
  });

  const resetLegalBtn = qs("#resetLegalBtn");
  const saveLegalBtn = qs("#saveLegalBtn");
  const legalShort = qs("#legalShort");
  const legalConsentTitle = qs("#legalConsentTitle");
  const legalConsentBody = qs("#legalConsentBody");
  const legalPolicyTitle = qs("#legalPolicyTitle");
  const legalPolicyBody = qs("#legalPolicyBody");
  const legalHint = qs("#legalHint");

  const reloadLeadsBtn = qs("#reloadLeadsBtn");
  const clearLeadsBtn = qs("#clearLeadsBtn");
  const exportLeadsBtn = qs("#exportLeadsBtn");
  const leadsTbody = qs("#leadsTbody");
  const leadsHint = qs("#leadsHint");

  function setLoggedIn(email) {
    sessionStorage.setItem(SESSION_KEY, email);
  }

  function clearLoggedIn() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function getLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY);
  }

  function refreshSessionUi() {
    const email = getLoggedIn();
    const ok = Boolean(email);
    show(loginCard, !ok);
    show(appGrid, ok);
    setText(status, ok ? `Вошли как: ${email} (localStorage)` : "localStorage");
    return ok;
  }

  function loadContentUi() {
    setText(contentHint, "");
    const c = getContent();

    // Visual editor
    cHeroPill.value = c.hero_pill || "";
    cHeroH1.value = c.hero_h1 || "";
    cHeroLead.value = c.hero_lead || "";
    heroBullets.setValues(c.hero_bullets || []);

    cAboutH2.value = c.about_h2 || "";
    aboutParagraphs.setValues(c.about_wide_paragraphs || []);
    aboutCards.setValues(c.about_cards || []);

    cWhenH2.value = c.when_h2 || "";
    whenItems.setValues(c.when_cards || []);

    cServicesH2.value = c.services_h2 || "";
    servicesItems.setValues(c.services || []);

    cHowH2.value = c.how_h2 || "";
    howItems.setValues(c.how_cards || []);

    cResultH2.value = c.result_h2 || "";
    cResultChildH3.value = c.result_child_h3 || "Для ребёнка";
    cResultParentH3.value = c.result_parent_h3 || "Для родителей";

    const legacy = Array.isArray(c.result_cards) ? c.result_cards.filter(Boolean) : [];
    const childFallback = legacy.slice(0, Math.max(0, legacy.length - 1));
    const parentFallback = legacy.length ? legacy.slice(-1) : [];

    resultChildItems.setValues(Array.isArray(c.result_child_cards) ? c.result_child_cards : childFallback);
    resultParentItems.setValues(Array.isArray(c.result_parent_cards) ? c.result_parent_cards : parentFallback);

    cStoriesH2.value = c.stories_h2 || "Истории из практики";
    cStoriesInitial.value = Number(c.stories_initial_count || 6) || 6;
    storiesItems.setValues(c.stories_items || []);

    cFormH2.value = c.form_h2 || "";
    cFormLead.value = c.form_lead || "";
    cFormGeo.value = c.form_geo_value || "";
    cFormAge.value = c.form_age_value || "";

    // JSON view
    contentJson.value = prettyJson(c);
    updateFilledUi(appGrid);
  }

  function buildContentFromFields() {
    const base = getContent();
    const childCards = resultChildItems.getValues();
    const parentCards = resultParentItems.getValues();
    const next = {
      ...base,
      hero_pill: cHeroPill.value || "",
      hero_h1: cHeroH1.value || "",
      hero_lead: cHeroLead.value || "",
      hero_bullets: heroBullets.getValues(),

      about_h2: cAboutH2.value || "",
      about_wide_paragraphs: aboutParagraphs.getValues(),
      about_cards: aboutCards.getValues(),

      when_h2: cWhenH2.value || "",
      when_cards: whenItems.getValues(),

      services_h2: cServicesH2.value || "",
      services: servicesItems.getValues(),

      how_h2: cHowH2.value || "",
      how_cards: howItems.getValues(),

      result_h2: cResultH2.value || "",
      result_child_h3: cResultChildH3.value || "",
      result_child_cards: childCards,
      result_parent_h3: cResultParentH3.value || "",
      result_parent_cards: parentCards,
      // legacy field (kept for older layouts/tools)
      result_cards: [...childCards, ...parentCards].filter(Boolean),

      stories_h2: cStoriesH2.value || "",
      stories_initial_count: Math.max(1, Math.min(9, Number(cStoriesInitial.value || 6) || 6)),
      stories_items: storiesItems.getValues(),

      form_h2: cFormH2.value || "",
      form_lead: cFormLead.value || "",
      form_geo_value: cFormGeo.value || "",
      form_age_value: cFormAge.value || "",

      updated_at: nowIso(),
    };

    return next;
  }

  function saveContentUi() {
    setText(contentHint, "");
    const next = buildContentFromFields();
    setContent(next);
    loadContentUi();
    setText(contentHint, "Сохранено в этом браузере (localStorage). Другие устройства этого не увидят.");
  }

  async function publishContentUi() {
    setText(publishHint, "");
    const sb = getSupabase();
    if (!sb) {
      setText(
        publishHint,
        "Supabase не настроен. Заполните `supabase-config.js` (URL + anon key) и обновите страницу."
      );
      return;
    }

    const okSession = refreshSessionUi();
    if (!okSession) {
      setText(publishHint, "Сначала войдите в админку.");
      return;
    }

    if (publishContentBtn) publishContentBtn.disabled = true;
    setText(publishHint, "Публикую…");
    try {
      const next = buildContentFromFields();
      const payload = {
        id: SITE_CONTENT_SINGLETON_ID,
        content_json: next,
        updated_at: nowIso(),
      };
      const { error } = await sb.from("site_content").upsert(payload, { onConflict: "id" });
      if (error) throw error;
      setText(publishHint, "Опубликовано. Клиент увидит правки по ссылке GitHub Pages.");
    } catch (e) {
      setText(publishHint, `Ошибка публикации: ${e?.message || "неизвестно"}`);
    } finally {
      if (publishContentBtn) publishContentBtn.disabled = false;
    }
  }

  function saveContentFromJsonUi() {
    setText(contentHint, "");
    const parsed = safeJsonParse(contentJson.value, null);
    if (!parsed || typeof parsed !== "object") {
      setText(contentHint, "JSON невалидный.");
      return;
    }
    setContent({ ...parsed, updated_at: nowIso() });
    loadContentUi();
    setText(contentHint, "Сохранено из JSON. Обновите страницу сайта, чтобы увидеть изменения.");
  }

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
      const result_child_cards = splitDom
        ? Array.from(childGroup.querySelectorAll(".cards .card")).map((c) => toText(c)).filter(Boolean)
        : [];
      const result_parent_cards = splitDom
        ? Array.from(parentGroup.querySelectorAll(".cards .card")).map((c) => toText(c)).filter(Boolean)
        : [];

      const legacyResultCards = !splitDom && resultSection
        ? Array.from(resultSection.querySelectorAll(".cards .card")).map((c) => toText(c)).filter(Boolean)
        : [];

      const form = doc.querySelector("#form");
      const formGeo = toText(form?.querySelector(".mini__item:nth-child(1) .mini__value"));
      const formAge = toText(form?.querySelector(".mini__item:nth-child(2) .mini__value"));
      const formLead = toText(form?.querySelector(".form-grid__text .muted"));

      const next = {
        ...getDefaultContent(),
        ...getContent(),
        hero_pill: toText(hero?.querySelector(".pill")) || getContent().hero_pill,
        hero_h1: toText(hero?.querySelector("h1")) || getContent().hero_h1,
        hero_lead: toText(hero?.querySelector(".lead")) || getContent().hero_lead,
        hero_bullets: heroBulletsEls.map((li) => toText(li)).filter(Boolean),
        hero_image_url: hero_image_url || getContent().hero_image_url,

        about_h2: toText(about?.querySelector("h2")) || getContent().about_h2,
        about_wide_paragraphs: aboutWideParas.length ? aboutWideParas : getContent().about_wide_paragraphs,
        about_cards: aboutCardsEls.map((card) => ({ h3: toText(card.querySelector("h3")), p: toText(card.querySelector("p")) })).filter((x) => x.h3 || x.p),

        when_h2: toText(when?.querySelector("h2")) || getContent().when_h2,
        when_cards: whenCardsEls.map((c) => toText(c)).filter(Boolean),

        services_h2: toText(services?.querySelector("h2")) || getContent().services_h2,
        services: servicesCardsEls
          .map((card) => {
            const h3 = toText(card.querySelector("h3"));
            const p = toText(card.querySelector("p"));
            const btn = card.querySelector("button[data-service]");
            const service_value = String(btn?.getAttribute?.("data-service") ?? "").trim() || h3;
            const button_label = toText(btn) || "Записаться";
            return { h3, p, service_value, button_label };
          })
          .filter((x) => x.h3 || x.p),

        how_h2: toText(how?.querySelector("h2")) || getContent().how_h2,
        how_cards: howCardsEls.map((c) => toText(c)).filter(Boolean),

        result_h2: toText(resultSection?.querySelector("h2")) || getContent().result_h2,
        result_child_h3,
        result_parent_h3,
        result_child_cards: result_child_cards.length ? result_child_cards : getContent().result_child_cards,
        result_parent_cards: result_parent_cards.length ? result_parent_cards : getContent().result_parent_cards,
        result_cards: (result_child_cards.length || result_parent_cards.length)
          ? [...result_child_cards, ...result_parent_cards].filter(Boolean)
          : (legacyResultCards.length ? legacyResultCards : getContent().result_cards),

        form_h2: toText(form?.querySelector("h2")) || getContent().form_h2,
        form_lead: formLead || getContent().form_lead,
        form_geo_value: formGeo || getContent().form_geo_value,
        form_age_value: formAge || getContent().form_age_value,

        updated_at: nowIso(),
      };

      setContent(next);
      loadContentUi();
      setText(contentHint, "Подтянуто с главной страницы. Проверьте поля и нажмите «Сохранить» при необходимости.");
    } catch (e) {
      const msg = String(e?.message || e || "");
      setText(
        contentHint,
        `Не удалось подтянуть с сайта. ${msg ? `Причина: ${msg}. ` : ""}Откройте админку через GitHub Pages/локальный сервер и попробуйте ещё раз.`
      );
    }
  }

  // Live highlighting of filled/empty fields
  appGrid?.addEventListener(
    "input",
    () => {
      updateFilledUi(appGrid);
    },
    true
  );

  pullFromSiteBtn?.addEventListener("click", pullFromSiteUi);
  // Safety net in case the button is re-rendered or missed
  document.addEventListener("click", (e) => {
    const btn = e.target?.closest?.("#pullFromSiteBtn");
    if (!btn) return;
    pullFromSiteUi();
  });
  appGrid?.addEventListener(
    "change",
    () => {
      updateFilledUi(appGrid);
    },
    true
  );

  function loadLegalUi() {
    const legal = getLegal();
    legalShort.value = legal.consent_short_text || "";
    legalConsentTitle.value = legal.consent_title || "";
    legalConsentBody.value = legal.consent_body_html || "";
    legalPolicyTitle.value = legal.policy_title || "";
    legalPolicyBody.value = legal.policy_body_html || "";
  }

  function saveLegalUi() {
    setText(legalHint, "");
    const legal = {
      version: `local-${Date.now()}`,
      consent_short_text: legalShort.value || "",
      consent_title: legalConsentTitle.value || "",
      consent_body_html: legalConsentBody.value || "",
      policy_title: legalPolicyTitle.value || "",
      policy_body_html: legalPolicyBody.value || "",
      updated_at: nowIso(),
    };
    setLegal(legal);
    setText(legalHint, "Сохранено. Обновите страницу сайта, чтобы увидеть изменения.");
  }

  async function readFileAsDataUrl(file) {
    return await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result || ""));
      r.onerror = () => reject(new Error("File read error"));
      r.readAsDataURL(file);
    });
  }

  async function saveHeroPhoto() {
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
    try {
      const url = await readFileAsDataUrl(f);
      const content = getContent();
      content.hero_image_url = url;
      content.updated_at = nowIso();
      setContent(content);
      contentJson.value = prettyJson(content);
      setText(uploadHint, "Сохранено. Обновите страницу сайта, чтобы увидеть фото.");
    } catch {
      setText(uploadHint, "Не удалось прочитать файл.");
    }
  }

  function loadLeadsUi() {
    leadsTbody.innerHTML = "";
    const leads = getLeads();

    leads.forEach((l, idx) => {
      const tr = document.createElement("tr");

      const tdCreated = document.createElement("td");
      tdCreated.textContent = formatDt(l.createdAt || l.created_at);

      const tdService = document.createElement("td");
      tdService.textContent = l.service || "";

      const tdName = document.createElement("td");
      tdName.textContent = l.name || "";

      const tdPhone = document.createElement("td");
      tdPhone.textContent = l.phone || "";

      const tdAge = document.createElement("td");
      tdAge.textContent = l.age || l.child_age || "";

      const tdStatus = document.createElement("td");
      const sel = buildStatusSelect(l.status || "new");
      tdStatus.appendChild(sel);

      const tdFulfilled = document.createElement("td");
      tdFulfilled.textContent = formatDt(l.fulfilledAt || l.fulfilled_at);

      const tdAct = document.createElement("td");
      const saveBtn = document.createElement("button");
      saveBtn.type = "button";
      saveBtn.className = "btn btn--secondary";
      saveBtn.textContent = "Сохранить";
      tdAct.appendChild(saveBtn);

      saveBtn.addEventListener("click", () => {
        const nextStatus = sel.value;
        l.status = nextStatus;
        l.statusUpdatedAt = nowIso();
        if (nextStatus === "done" && !l.fulfilledAt && !l.fulfilled_at) {
          l.fulfilledAt = nowIso();
        }
        const all = getLeads();
        all[idx] = l;
        setLeads(all);
        tdFulfilled.textContent = formatDt(l.fulfilledAt || l.fulfilled_at);
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

  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    setText(loginError, "");
    const email = String(loginEmail?.value || "").trim().toLowerCase();
    const password = String(loginPassword?.value || "");
    if (!ADMINS[email] || ADMINS[email] !== password) {
      setText(loginError, "Неверный логин или пароль.");
      return;
    }
    setLoggedIn(email);
    refreshSessionUi();
    loadContentUi();
    loadLegalUi();
    loadLeadsUi();
  });

  logoutBtn?.addEventListener("click", () => {
    clearLoggedIn();
    refreshSessionUi();
  });

  resetContentBtn?.addEventListener("click", () => {
    setContent(getDefaultContent());
    loadContentUi();
    setText(contentHint, "Сброшено к дефолту.");
  });

  exportContentBtn?.addEventListener("click", () => {
    downloadJson("content.json", getContent());
  });

  copyContentJsonBtn?.addEventListener("click", async () => {
    const text = prettyJson(getContent());
    try {
      await navigator.clipboard.writeText(text);
      setText(contentHint, "JSON скопирован. Вставьте его в файл content.json на GitHub и сделайте commit.");
    } catch {
      // Fallback: select in textarea
      if (contentJson) {
        contentJson.value = text;
        contentJson.focus();
        contentJson.select?.();
      }
      setText(contentHint, "Не удалось скопировать автоматически. Выделил JSON в поле ниже — скопируйте вручную (Ctrl+C).");
    }
  });

  saveContentBtn?.addEventListener("click", saveContentUi);
  publishContentBtn?.addEventListener("click", publishContentUi);
  saveContentJsonBtn?.addEventListener("click", saveContentFromJsonUi);

  resetLegalBtn?.addEventListener("click", () => {
    setLegal(getDefaultLegal());
    loadLegalUi();
    setText(legalHint, "Сброшено к дефолту.");
  });

  saveLegalBtn?.addEventListener("click", saveLegalUi);

  uploadHeroBtn?.addEventListener("click", saveHeroPhoto);

  reloadLeadsBtn?.addEventListener("click", loadLeadsUi);

  clearLeadsBtn?.addEventListener("click", () => {
    setLeads([]);
    loadLeadsUi();
    setText(leadsHint, "Очищено.");
  });

  exportLeadsBtn?.addEventListener("click", () => {
    downloadJson("leads.json", getLeads());
  });

  const ok = refreshSessionUi();
  if (ok) {
    loadContentUi();
    loadLegalUi();
    loadLeadsUi();
  }
});

