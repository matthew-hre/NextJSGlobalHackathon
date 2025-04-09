CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  insert into public.users (id, name, email, profile_image, created_at, updated_at)
  values (
    new.id,
    (new.raw_user_meta_data ->> 'name')::text,
    new.email,
    new.raw_user_meta_data ->> 'avatar_url',
    now(),
    now()
  );
  return new;
end;
$function$
;