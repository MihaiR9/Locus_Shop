-- Auto-create a customers row when a new auth.users is created.
-- Signup metadata (first_name, last_name, phone, marketing_opt_in) lives
-- in raw_user_meta_data and we copy it across. For Google OAuth, name +
-- email come from the same field.

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_phone text;
  v_first text;
  v_last  text;
  v_full  text;
  v_marketing boolean;
begin
  v_email := coalesce(new.email, new.raw_user_meta_data->>'email');
  v_phone := coalesce(new.phone, new.raw_user_meta_data->>'phone');
  v_first := coalesce(
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'firstName',
    split_part(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), ' ', 1)
  );
  v_last := coalesce(
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'lastName',
    nullif(regexp_replace(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), '^\S+\s*', ''), '')
  );
  v_full := nullif(trim(coalesce(v_first, '') || ' ' || coalesce(v_last, '')), '');
  v_marketing := coalesce((new.raw_user_meta_data->>'marketing_opt_in')::boolean, false);

  -- If a guest checkout already created a customer row by email, link it.
  -- Otherwise create a fresh row.
  update customers
    set supabase_user_id = new.id,
        name = coalesce(name, v_full),
        phone = coalesce(phone, v_phone)
    where supabase_user_id is null
      and lower(email) = lower(coalesce(v_email, ''));

  if not found then
    insert into customers (supabase_user_id, email, name, phone, marketing_opt_in)
      values (new.id, coalesce(v_email, ''), v_full, v_phone, v_marketing);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
