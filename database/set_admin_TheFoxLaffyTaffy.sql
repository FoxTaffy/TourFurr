-- Назначение администратора + подтверждение email
UPDATE users
SET
    is_admin = true,
    email_verified = true,
    email_verified_at = NOW()
WHERE email = 'TheFoxLaffyTaffy@gmail.com';

-- Проверка
SELECT id, email, nickname, is_admin, email_verified FROM users WHERE email = 'TheFoxLaffyTaffy@gmail.com';
