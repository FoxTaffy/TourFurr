-- Minor Houses (Organizer-Only) for TourFurr
-- Run this in Supabase SQL Editor after teams_schema.sql

INSERT INTO teams (name, slug, description, crest_url, color) VALUES
    ('Аррен',     'arryn',     '«Высоко, как честь». Владыки Долины Аррен.',             NULL, '#6BAED6'),
    ('Флорент',   'florent',   '«Наша честь чиста». Лорды Бьюфорта.',                    NULL, '#C94040'),
    ('Грейджой',  'greyjoy',   '«Мы не сеем». Владыки Железных островов.',               NULL, '#8B7355'),
    ('Тарт',      'tarth',     'Лорды сапфирового острова Тарт.',                         NULL, '#4A9BBF'),
    ('Стронг',    'strong',    'Древний дом Речных земель.',                              NULL, '#7B6EA8'),
    ('Хайтауэр',  'hightower', '«Мы освещаем путь». Владыки Древней Дубравы.',           NULL, '#7BB7C4'),
    ('Талли',     'tully',     '«Семья, долг, честь». Лорды-сюзерены Речных земель.',    NULL, '#3B82B0'),
    ('Бейлиш',    'baelish',   'Дом пересмешника. Хитрость и знание — оружие.',          NULL, '#6B5B95')
ON CONFLICT (slug) DO NOTHING;
