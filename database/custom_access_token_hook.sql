-- Migration: Custom Access Token Hook — embed is_admin in JWT
-- =============================================================================
-- SECURITY FIX: Previously the frontend checked admin status by making a
-- separate GET request (`users?select=is_admin&id=eq.<uid>`) whose plain-JSON
-- response could be intercepted and modified by a proxy, allowing any
-- authenticated user to fake admin status.
--
-- This hook runs server-side every time Supabase issues a JWT.  It reads
-- `is_admin` from `public.users` and adds it as a signed JWT claim.
-- Because the token is HMAC-signed by the Supabase Auth server, its payload
-- cannot be altered without invalidating the signature.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims     JSONB;
  is_admin_val BOOLEAN;
BEGIN
  -- Look up admin status for the user who is signing in
  SELECT is_admin
    INTO is_admin_val
    FROM public.users
   WHERE id = (event->>'user_id')::UUID;

  -- Warn if the auth user has no corresponding profile row (data integrity issue)
  IF NOT FOUND THEN
    RAISE NOTICE 'custom_access_token_hook: no public.users row for user_id=%', event->>'user_id';
  END IF;

  -- Append the claim to the token payload
  claims := event->'claims';
  claims := jsonb_set(claims, '{is_admin}', to_jsonb(COALESCE(is_admin_val, false)));
  event  := jsonb_set(event, '{claims}', claims);

  RETURN event;
END;
$$;

-- Grant the Supabase Auth service the permissions it needs to call this hook
GRANT USAGE  ON SCHEMA public                          TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
GRANT SELECT  ON TABLE public.users                    TO supabase_auth_admin;

-- Restrict direct execution to prevent misuse
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook
  FROM authenticated, anon, public;

COMMENT ON FUNCTION public.custom_access_token_hook IS
  'Supabase Auth hook: adds is_admin JWT claim from public.users. '
  'Prevents admin-status spoofing via intercepted REST responses.';
