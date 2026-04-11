-- Minor Houses (Organizer-Only) for TourFurr
-- Run this in Supabase SQL Editor after teams_schema.sql

INSERT INTO teams (name, slug, description, crest_url, color) VALUES
    ('Аррен',     'arryn',     '«Высоко, как честь». Владыки Долины Аррен.',             '/images/crests/arryn.png',     '#6BAED6'),
    ('Флорент',   'florent',   '«Наша честь чиста». Лорды Бьюфорта.',                    '/images/crests/florent.png',   '#C94040'),
    ('Грейджой',  'greyjoy',   '«Мы не сеем». Владыки Железных островов.',               '/images/crests/greyjoy.png',   '#8B7355'),
    ('Тарт',      'tarth',     'Лорды сапфирового острова Тарт.',                         '/images/crests/tarth.png',     '#4A9BBF'),
    ('Стронг',    'strong',    'Древний дом Речных земель.',                              '/images/crests/strong.png',    '#7B6EA8'),
    ('Хайтауэр',  'hightower', '«Мы освещаем путь». Владыки Древней Дубравы.',           '/images/crests/hightower.png', '#7BB7C4'),
    ('Талли',     'tully',     '«Семья, долг, честь». Лорды-сюзерены Речных земель.',    '/images/crests/tully.png',     '#3B82B0'),
    ('Бейлиш',    'baelish',   'Дом пересмешника. Хитрость и знание — оружие.',          '/images/crests/baelish.png',   '#6B5B95')
ON CONFLICT (slug) DO UPDATE SET
    crest_url = EXCLUDED.crest_url,
    color     = EXCLUDED.color;
