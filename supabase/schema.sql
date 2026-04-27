-- Schema for childrens-massage-therapist-v223 (GitHub Pages + Supabase)
-- Run in Supabase SQL Editor.

-- Extensions (usually enabled by default, but safe)
create extension if not exists "uuid-ossp";

-- =========================
-- Tables
-- =========================

create table if not exists public.site_content (
  id int primary key,
  content_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.legal_texts (
  id int primary key,
  version text not null default '1',
  consent_short_text text not null default '',
  consent_title text not null default '',
  consent_body_html text not null default '',
  policy_title text not null default '',
  policy_body_html text not null default '',
  -- optional snapshot for logging in leads (what user agreed to)
  consent_snapshot_for_logging text,
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  service text not null default '',
  name text not null default '',
  phone text not null default '',
  child_age text,
  status text not null default 'new',
  status_updated_at timestamptz not null default now(),
  fulfilled_at timestamptz,

  consented_at timestamptz not null,
  consent_text_version text,
  consent_text_snapshot text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);

-- =========================
-- Seed data (singleton rows)
-- =========================

insert into public.site_content (id, content_json)
values (
  1,
  jsonb_build_object(
    'hero_pill', 'Выезд на дом • дети 0–1,5 лет • 20 лет опыта',
    'hero_h1', 'Бережный детский массаж с заботой и спокойствием для мамы',
    'hero_lead', 'Помогаю малышу развиваться гармонично, мягко корректирую тонус и поддерживаю родителей понятными рекомендациями.',
    'hero_bullets', jsonb_build_array(
      'Без стресса и слёз — ориентируюсь на состояние ребёнка',
      'Объясняю родителям простыми словами “что и почему”',
      'Остаюсь на связи после курса'
    ),
    'about_h2', 'Обо мне',
    'about_wide_paragraphs', jsonb_build_array(
      'Я — Оксана, детский массажист с более чем 20-летним опытом работы с малышами от рождения до 1,5 лет.',
      'Мой путь начался с практики в медицинском центре, где я впервые взяла на руки новорождённого ребёнка — и поняла, что хочу помогать самым маленьким расти здоровыми и гармоничными.',
      'Доп. квалификация: детский медицинский массаж, грудничковое плавание, фитбол-кинезитерапия, патронаж новорождённых.'
    ),
    'about_cards', jsonb_build_array(
      jsonb_build_object('h3','Мой подход','p','Работаю мягко и бережно, без стресса, ориентируясь на состояние ребёнка. На каждом шаге объясняю родителям, что делаем и зачем.'),
      jsonb_build_object('h3','Почему мне доверяют','p','Я мама двоих детей и понимаю тревоги родителей. Поддерживаю и даю уверенность, остаюсь на связи после курса.'),
      jsonb_build_object('h3','Моя миссия','p','Помочь родителям не упустить важные моменты в развитии малыша и чувствовать, что они всё делают правильно.')
    ),
    'when_h2', 'Когда стоит обратиться',
    'when_cards', jsonb_build_array(
      'Колики, беспокойный сон',
      'Гипо- или гипертонус',
      'Задержка развития',
      'Подготовка к ползанию и ходьбе',
      'Страх навредить ребёнку',
      'Неуверенность в уходе'
    ),
    'services_h2', 'Услуги',
    'services', jsonb_build_array(
      jsonb_build_object('h3','Патронаж новорождённого','p','Поддержка с первых дней жизни малыша.','button_label','Записаться','service_value','Патронаж'),
      jsonb_build_object('h3','Курс массажа','p','10 сеансов для гармоничного развития.','button_label','Записаться','service_value','Курс массажа'),
      jsonb_build_object('h3','Консультация','p','Ответы на вопросы и рекомендации.','button_label','Записаться','service_value','Консультация'),
      jsonb_build_object('h3','Обучение родителей','p','Научу безопасным приёмам массажа.','button_label','Записаться','service_value','Обучение родителей'),
      jsonb_build_object('h3','Экстренный выезд','p','Когда нужна помощь здесь и сейчас.','button_label','Записаться','service_value','Экстренный выезд')
    ),
    'how_h2', 'Как проходит работа',
    'how_cards', jsonb_build_array(
      'Знакомство и диагностика',
      'Индивидуальный план',
      'Бережный массаж + фитбол',
      'Обучение родителей',
      'Поддержка после курса'
    ),
    'result_h2', 'Результат',
    'result_cards', jsonb_build_array(
      'Спокойный ребёнок',
      'Улучшение сна',
      'Снижение колик',
      'Гармоничное развитие',
      'Уверенность родителей'
    ),
    'form_h2', 'Записаться',
    'form_lead', 'Оставьте контакты — я напишу/позвоню и подберу удобное время. Перед отправкой нужно согласиться на обработку персональных данных.',
    'form_geo_value', 'Москва и МО',
    'form_age_value', '0–1,5 лет'
  )
)
on conflict (id) do nothing;

insert into public.legal_texts (
  id,
  version,
  consent_short_text,
  consent_title,
  consent_body_html,
  policy_title,
  policy_body_html,
  consent_snapshot_for_logging
)
values (
  1,
  '1',
  'Нажимая «Отправить заявку», вы соглашаетесь на обработку персональных данных для обратной связи.',
  'Согласие на обработку персональных данных',
  '<p>Для отправки заявки требуется ваше согласие на обработку персональных данных (ФИО, телефон и другие данные, которые вы укажете) исключительно для обратной связи и записи.</p><p>Вы можете отозвать согласие, написав нам, и мы прекратим обработку, если это не противоречит требованиям закона.</p>',
  'Политика обработки персональных данных',
  '<p><b>Шаблон</b>. Заполните/уточните под вашу ситуацию (ИП/самозанятый/ООО, адрес, контакты).</p><h4>1. Общие положения</h4><p>Настоящая Политика определяет порядок обработки и защиты персональных данных пользователей сайта.</p><h4>2. Какие данные обрабатываются</h4><ul><li>Имя</li><li>Телефон</li><li>Возраст ребёнка (если указан)</li><li>Выбранная услуга</li></ul><h4>3. Цели обработки</h4><ul><li>Обратная связь</li><li>Запись на консультацию/услугу</li></ul><h4>4. Правовые основания</h4><p>Согласие субъекта персональных данных.</p><h4>5. Сроки хранения</h4><p>До достижения целей обработки или до отзыва согласия, если иное не требуется законом.</p><h4>6. Права субъекта</h4><p>Пользователь вправе запросить сведения об обработке, уточнение, блокирование или удаление данных.</p><h4>7. Контакты оператора</h4><p>Укажите контакты оператора ПДн (телефон/почта).</p>',
  ''
)
on conflict (id) do nothing;

update public.legal_texts
set consent_snapshot_for_logging = concat(consent_title, E'\n\n', consent_body_html, E'\n\n', policy_title, E'\n\n', policy_body_html)
where id = 1 and (consent_snapshot_for_logging is null or consent_snapshot_for_logging = '');

-- =========================
-- RLS (Row Level Security)
-- =========================

alter table public.site_content enable row level security;
alter table public.legal_texts enable row level security;
alter table public.leads enable row level security;

-- Public read for site (anon)
drop policy if exists "public read site_content" on public.site_content;
create policy "public read site_content"
on public.site_content
for select
to anon
using (true);

drop policy if exists "admins write site_content" on public.site_content;
create policy "admins write site_content"
on public.site_content
for all
to authenticated
using (true)
with check (true);

drop policy if exists "public read legal_texts" on public.legal_texts;
create policy "public read legal_texts"
on public.legal_texts
for select
to anon
using (true);

drop policy if exists "admins write legal_texts" on public.legal_texts;
create policy "admins write legal_texts"
on public.legal_texts
for all
to authenticated
using (true)
with check (true);

-- Leads: public can only INSERT (with consented_at present).
drop policy if exists "public insert leads" on public.leads;
create policy "public insert leads"
on public.leads
for insert
to anon
with check (consented_at is not null);

-- Leads: admins can read/update
drop policy if exists "admins read leads" on public.leads;
create policy "admins read leads"
on public.leads
for select
to authenticated
using (true);

drop policy if exists "admins update leads" on public.leads;
create policy "admins update leads"
on public.leads
for update
to authenticated
using (true)
with check (true);

-- =========================
-- Storage policies (bucket: site-assets)
-- =========================
-- NOTE: Bucket itself is created in UI. These policies control access to objects.

-- Public read
drop policy if exists "public read site-assets" on storage.objects;
create policy "public read site-assets"
on storage.objects
for select
to anon
using (bucket_id = 'site-assets');

-- Authenticated upload/update/delete
drop policy if exists "admins write site-assets" on storage.objects;
create policy "admins write site-assets"
on storage.objects
for all
to authenticated
using (bucket_id = 'site-assets')
with check (bucket_id = 'site-assets');

