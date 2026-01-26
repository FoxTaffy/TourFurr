-- Функция для очистки неподтвержденных аккаунтов
-- Удаляет пользователей, которые не подтвердили email в течение 15 минут

-- Функция для удаления неподтвержденных пользователей
CREATE OR REPLACE FUNCTION cleanup_unverified_users()
RETURNS TABLE (
  deleted_count INTEGER,
  deleted_emails TEXT[]
) AS $$
DECLARE
  grace_period_minutes INTEGER := 15;
  deleted_user_emails TEXT[];
  deleted_user_ids UUID[];
  user_record RECORD;
BEGIN
  -- Найти всех неподтвержденных пользователей старше grace period
  SELECT
    ARRAY_AGG(id),
    ARRAY_AGG(email)
  INTO
    deleted_user_ids,
    deleted_user_emails
  FROM users
  WHERE
    email_verified = FALSE
    AND created_at < NOW() - (grace_period_minutes || ' minutes')::INTERVAL;

  -- Если есть пользователи для удаления
  IF deleted_user_ids IS NOT NULL THEN
    -- Удалить пользователей из таблицы users
    DELETE FROM users
    WHERE id = ANY(deleted_user_ids);

    -- Удалить связанные коды подтверждения
    DELETE FROM email_verification_codes
    WHERE email = ANY(deleted_user_emails);

    -- Попытаться удалить пользователей из Supabase Auth
    -- Примечание: это требует админских прав
    -- В Supabase можно настроить RLS или использовать Service Role
    FOR user_record IN
      SELECT unnest(deleted_user_ids) as user_id
    LOOP
      BEGIN
        -- Удаляем из auth.users через расширение
        DELETE FROM auth.users WHERE id = user_record.user_id;
      EXCEPTION WHEN OTHERS THEN
        -- Логируем ошибку, но продолжаем
        RAISE NOTICE 'Failed to delete auth user %: %', user_record.user_id, SQLERRM;
      END;
    END LOOP;

    -- Вернуть результат
    RETURN QUERY SELECT
      COALESCE(array_length(deleted_user_ids, 1), 0)::INTEGER,
      deleted_user_emails;
  ELSE
    -- Нет пользователей для удаления
    RETURN QUERY SELECT 0::INTEGER, ARRAY[]::TEXT[];
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Комментарии
COMMENT ON FUNCTION cleanup_unverified_users() IS
  'Удаляет пользователей, которые не подтвердили email в течение 15 минут после регистрации';

-- Создать расписание для автоматической очистки (если установлен pg_cron)
-- Запускается каждые 5 минут
-- Примечание: pg_cron должен быть установлен и настроен в Supabase
-- SELECT cron.schedule(
--   'cleanup-unverified-users',
--   '*/5 * * * *',  -- каждые 5 минут
--   $$SELECT cleanup_unverified_users();$$
-- );

-- Альтернатива: Создать триггер, который проверяет при входе
-- Это менее эффективно, но не требует pg_cron

-- Функция для проверки и уведомления о истекшем времени
CREATE OR REPLACE FUNCTION check_user_verification_grace_period(user_email TEXT)
RETURNS TABLE (
  is_expired BOOLEAN,
  minutes_remaining INTEGER,
  will_be_deleted_at TIMESTAMPTZ
) AS $$
DECLARE
  grace_period_minutes INTEGER := 15;
  user_created_at TIMESTAMPTZ;
  user_verified BOOLEAN;
BEGIN
  -- Получить информацию о пользователе
  SELECT created_at, email_verified
  INTO user_created_at, user_verified
  FROM users
  WHERE email = user_email;

  -- Если пользователь не найден или уже подтвержден
  IF user_created_at IS NULL OR user_verified = TRUE THEN
    RETURN QUERY SELECT FALSE, NULL::INTEGER, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- Вычислить оставшееся время
  DECLARE
    deletion_time TIMESTAMPTZ := user_created_at + (grace_period_minutes || ' minutes')::INTERVAL;
    remaining_minutes INTEGER := EXTRACT(EPOCH FROM (deletion_time - NOW())) / 60;
  BEGIN
    IF remaining_minutes <= 0 THEN
      -- Время истекло
      RETURN QUERY SELECT TRUE, 0, deletion_time;
    ELSE
      -- Время еще есть
      RETURN QUERY SELECT FALSE, remaining_minutes, deletion_time;
    END IF;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_user_verification_grace_period(TEXT) IS
  'Проверяет, истек ли grace period для неподтвержденного пользователя';

-- Проверка работы функций
-- SELECT * FROM cleanup_unverified_users();
-- SELECT * FROM check_user_verification_grace_period('test@example.com');
