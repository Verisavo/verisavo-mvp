-- Custom SQL migration file, put your code below! --
-- Every new Supabase Auth user gets a profile row, with the name and organisation from the sign-up form.
-- security definer: the trigger runs as the function owner, because the auth service inserts the user.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, organisation)
  VALUES (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'name', ''), 120),
    nullif(left(coalesce(new.raw_user_meta_data ->> 'organisation', ''), 160), '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;
--> statement-breakpoint
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
--> statement-breakpoint
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
--> statement-breakpoint
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
--> statement-breakpoint
-- Users created before this migration (none expected) get a profile too
INSERT INTO public.profiles (id, name)
SELECT id, left(coalesce(raw_user_meta_data ->> 'name', ''), 120) FROM auth.users
ON CONFLICT (id) DO NOTHING;
