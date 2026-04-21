-- Add Redwyne house to teams table
-- Minor house (Organizer-only)

INSERT INTO teams (name, slug, description, crest_url, color) VALUES
    ('Редвин',    'redwyne',   'Переполнился дом, в который хотят многие. Лорды Винодела.',  '/images/crests/Redwyne.png',   '#8B0000')
ON CONFLICT (slug) DO UPDATE SET
    crest_url = EXCLUDED.crest_url,
    color     = EXCLUDED.color;
