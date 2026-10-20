-- =============================================================
-- RA2 Travel & Tours — Database Schema
-- Run this in the Supabase SQL Editor for project opqhpeiwimiadlpkrecb
-- =============================================================

-- 1. Extensions ------------------------------------------------
create extension if not exists "pgcrypto";

-- 2. Enums -----------------------------------------------------
do $$ begin
  create type public.app_role as enum ('admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.service_category as enum (
    'airport_transfer', 'tour', 'chauffeur', 'experience'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.booking_status as enum (
    'pending', 'confirmed', 'completed', 'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum (
    'unpaid', 'paid', 'refunded', 'failed'
  );
exception when duplicate_object then null; end $$;

-- 3. updated_at trigger helper --------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 4. Booking reference generator ------------------------------
create or replace function public.generate_booking_reference()
returns trigger
language plpgsql
as $$
begin
  if new.reference is null or new.reference = '' then
    new.reference :=
      'RA2-' ||
      to_char(now(), 'YYMMDD') || '-' ||
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  end if;
  return new;
end;
$$;

-- 5. user_roles table -----------------------------------------
create table if not exists public.user_roles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        public.app_role not null,
  created_at  timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all    on public.user_roles to service_role;

alter table public.user_roles enable row level security;

-- 6. has_role security-definer helper -------------------------
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

-- 7. user_roles policies --------------------------------------
drop policy if exists "Users read own roles"   on public.user_roles;
drop policy if exists "Admins read all roles"  on public.user_roles;
drop policy if exists "Admins manage roles"    on public.user_roles;

create policy "Users read own roles"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins read all roles"
  on public.user_roles for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins manage roles"
  on public.user_roles for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 8. services table -------------------------------------------
create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  category    public.service_category not null,
  description text,
  duration    text,
  price_zar   numeric(10,2),
  price_note  text,
  max_pax     integer,
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_services_updated_at on public.services;
create trigger trg_services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

grant select                          on public.services to anon;
grant select                          on public.services to authenticated;
grant all                             on public.services to service_role;

alter table public.services enable row level security;

drop policy if exists "Public can read active services" on public.services;
drop policy if exists "Admins manage services"          on public.services;

create policy "Public can read active services"
  on public.services for select
  to anon, authenticated
  using (is_active = true);

create policy "Admins manage services"
  on public.services for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 9. bookings table -------------------------------------------
create table if not exists public.bookings (
  id              uuid primary key default gen_random_uuid(),
  reference       text unique,
  service_id      uuid references public.services(id) on delete set null,
  service_name    text not null,
  customer_name   text not null,
  customer_email  text not null,
  customer_phone  text not null,
  pickup_location text not null,
  destination     text,
  travel_date     date not null,
  travel_time     time,
  passengers      integer not null default 1 check (passengers between 1 and 30),
  notes           text,
  total_zar       numeric(10,2),
  status          public.booking_status not null default 'pending',
  payment_status  public.payment_status not null default 'unpaid',
  admin_notes     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_bookings_created_at on public.bookings (created_at desc);
create index if not exists idx_bookings_status     on public.bookings (status);
create index if not exists idx_bookings_email      on public.bookings (customer_email);

drop trigger if exists trg_bookings_updated_at on public.bookings;
create trigger trg_bookings_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

drop trigger if exists trg_bookings_reference on public.bookings;
create trigger trg_bookings_reference
  before insert on public.bookings
  for each row execute function public.generate_booking_reference();

-- Public site needs to INSERT a booking with the anon key.
-- Only admins can read / update / delete.
grant insert on public.bookings to anon;
grant insert on public.bookings to authenticated;
grant all    on public.bookings to service_role;

alter table public.bookings enable row level security;

drop policy if exists "Anyone can create a booking" on public.bookings;
drop policy if exists "Admins read bookings"        on public.bookings;
drop policy if exists "Admins update bookings"      on public.bookings;
drop policy if exists "Admins delete bookings"      on public.bookings;

create policy "Anyone can create a booking"
  on public.bookings for insert
  to anon, authenticated
  with check (true);

create policy "Admins read bookings"
  on public.bookings for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins update bookings"
  on public.bookings for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins delete bookings"
  on public.bookings for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));


-- RA2 catalogue and durable booking notifications. Existing bookings are preserved.
alter table public.bookings
  add column if not exists request_id uuid unique,
  add column if not exists request_fingerprint text,
  add column if not exists request_ip_hash text,
  add column if not exists special_requirements text,
  add column if not exists customer_email_sent_at timestamptz,
  add column if not exists admin_email_sent_at timestamptz,
  add column if not exists customer_email_id text,
  add column if not exists admin_email_id text,
  add column if not exists customer_email_error text,
  add column if not exists admin_email_error text,
  add column if not exists email_claim_until timestamptz;

create index if not exists idx_booking_rate_limit on public.bookings(request_ip_hash, created_at desc);

alter table public.bookings alter column reference set default
  ('RA2-' || to_char(now() at time zone 'Africa/Johannesburg', 'YYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)));

create or replace function public.generate_booking_reference()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.reference is null or new.reference = '' then
    new.reference := 'RA2-' || to_char(now() at time zone 'Africa/Johannesburg', 'YYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  end if;
  return new;
end;
$$;

-- Archive the inherited service catalogue without breaking historical foreign keys.
update public.services set is_active = false, price_zar = null, price_note = 'Archived service'
where slug in (
  'hermanus-airport-shuttle', 'arrival-departure-cape-town-city', 'affordable-airport-shuttles',
  'executive-airport-shuttle', 'minivan-airport-shuttle', '7-seater-shuttle-services',
  'bloubergstrand', 'cape-town-city-transfer', 'hout-bay-transfer', 'strand-transfer',
  'franschhoek-transfer', 'bellville-transfer', 'camps-bay-transfer', 'constantia-transfer',
  'sea-point-transfer', 'va-waterfront-transfer', 'melkbosstrand-transfer', 'muizenberg-transfer',
  'paarl-transfer', 'cape-peninsula-guided-chauffeur-tour', 'cape-town-city-guided-chauffeur-tour',
  'stellenbosch-wine-tour', 'half-day-wine-tour', 'full-day-wine-tour', 'cape-flats-culture-tour',
  'cape-town-half-day-tour', 'helicopter-two-oceans', 'helicopter-cape-point', 'helicopter-atlantic-seaboard',
  'airport-transfer-cape-town', 'full-day-cape-peninsula-tour', 'half-day-cape-town-chauffeur-drive',
  'half-day-wine-chauffeur-drive', 'big-5-game-drive', 'shark-cage-diving'
);

insert into public.services (slug, name, category, description, duration, price_zar, price_note, max_pax, is_active, sort_order) values
('aquila-safari', 'Aquila Game Reserve Safari', 'experience', 'Big 5 safari at Aquila Game Reserve with private transport from Cape Town. Reserve activities and inclusions confirmed in your quote.', 'Full day · approximately 10 hours', null, 'Request a Quote', 30, true, 10),
('cape-peninsula-tour', 'Cape Peninsula Full Day Tour', 'tour', 'A private Cape Point, Boulders Beach, Chapman''s Peak and Cape Peninsula experience.', 'Full day · approximately 8 hours', null, 'Request a Quote', 30, true, 20),
('cape-town-city-tour', 'Cape Town City Tour', 'tour', 'A private city tour featuring Table Mountain, Bo-Kaap and the V&A Waterfront, tailored around you.', 'Half or full day', null, 'Request a Quote', 30, true, 30),
('cape-winelands', 'Cape Winelands Private Tour', 'tour', 'Private Stellenbosch and Franschhoek touring with estate visits and tastings by arrangement.', 'Full day · approximately 8 hours', null, 'Request a Quote', 30, true, 40),
('garden-route', 'Garden Route', 'tour', 'A tailor-made journey through South Africa''s coastal towns, forests and Garden Route scenery.', 'Multi-day · tailor-made', null, 'Request a Quote', 30, true, 50),
('adventure-experiences', 'Adventure Experiences', 'experience', 'Quad biking, tandem skydiving, paragliding and helicopter rides in and around Cape Town.', 'Activity dependent', null, 'Request a Quote', 30, true, 60),
('airport-transfer', 'Private Airport Transfers', 'airport_transfer', 'Private transfers, airport meet and greet, VIP arrivals and transport for individuals, families and groups. Preferably book 24 hours before arrival.', 'Route dependent', null, 'Request a Quote', 30, true, 70),
('custom-private-tour', 'Custom Private Tours', 'tour', 'Personalised South African itineraries built around your interests, dates, group and budget.', 'Tailor-made', null, 'Request a Quote', 30, true, 80),
('chauffeur-service', 'Executive & Chauffeur Services', 'chauffeur', 'Professional private transport for business, VIP travel, special occasions and custom day itineraries.', 'By arrangement', null, 'Request a Quote', 30, true, 90)
on conflict (slug) do update set name = excluded.name, category = excluded.category, description = excluded.description,
duration = excluded.duration, price_zar = excluded.price_zar, price_note = excluded.price_note,
max_pax = excluded.max_pax, is_active = excluded.is_active, sort_order = excluded.sort_order;

-- Only the Edge Function can create bookings. Public users cannot forge prices,
-- references, payment statuses or notification delivery markers through REST.
drop policy if exists "Anyone can create a booking" on public.bookings;
revoke insert on public.bookings from anon, authenticated;
grant select, update, delete on public.bookings to authenticated;
grant select, insert, update, delete on public.services to authenticated;
grant all on public.bookings, public.services to service_role;
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;

create or replace function public.create_booking_request(p_request jsonb, p_ip_hash text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  b public.bookings%rowtype;
  s public.services%rowtype;
begin
  -- Serialize requests with the same id so a lost HTTP response can safely retry.
  perform pg_advisory_xact_lock(hashtextextended(p_request->>'requestId', 0));
  select * into b from public.bookings where request_id = (p_request->>'requestId')::uuid;
  if found then
    if b.request_fingerprint is distinct from md5(p_request::text) then raise exception 'REQUEST_MISMATCH'; end if;
    return to_jsonb(b);
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_ip_hash, 1));
  perform pg_advisory_xact_lock(hashtextextended(lower(p_request->>'email'), 2));
  if (select count(*) from public.bookings where request_ip_hash = p_ip_hash and created_at > now() - interval '10 minutes') >= 5
    or (select count(*) from public.bookings where lower(customer_email) = lower(p_request->>'email') and request_id is not null and created_at > now() - interval '1 hour') >= 5
  then raise exception 'RATE_LIMITED'; end if;

  select * into s from public.services where slug = p_request->>'serviceSlug' and is_active = true for share;
  if not found then raise exception 'SERVICE_UNAVAILABLE'; end if;
  if s.max_pax is not null and (p_request->>'passengers')::integer > s.max_pax then raise exception 'GROUP_TOO_LARGE'; end if;

  insert into public.bookings (
    request_id, request_fingerprint, request_ip_hash, service_id, service_name, customer_name, customer_email, customer_phone,
    pickup_location, destination, travel_date, travel_time, passengers, special_requirements, notes, total_zar
  ) values (
    (p_request->>'requestId')::uuid, md5(p_request::text), p_ip_hash, s.id, s.name,
    p_request->>'name', p_request->>'email', p_request->>'phone', p_request->>'pickup',
    nullif(p_request->>'destination', ''), (p_request->>'date')::date, nullif(p_request->>'time', '')::time,
    (p_request->>'passengers')::integer, nullif(p_request->>'specialRequirements', ''), nullif(p_request->>'notes', ''), null
  ) returning * into b;
  return to_jsonb(b);
end;
$$;
revoke all on function public.create_booking_request(jsonb, text) from public, anon, authenticated;
grant execute on function public.create_booking_request(jsonb, text) to service_role;

create or replace function public.claim_booking_emails(p_booking_id uuid)
returns boolean language plpgsql security definer set search_path = public, pg_temp as $$
begin
  update public.bookings set email_claim_until = now() + interval '2 minutes'
  where id = p_booking_id and (email_claim_until is null or email_claim_until < now())
    and (customer_email_sent_at is null or admin_email_sent_at is null);
  return found;
end;
$$;
revoke all on function public.claim_booking_emails(uuid) from public, anon, authenticated;
grant execute on function public.claim_booking_emails(uuid) to service_role;

-- Promote an existing Supabase Auth user when ready:
-- insert into public.user_roles (user_id, role)
-- select id, 'admin'::public.app_role from auth.users
-- where email = 'rezah@ra2travelandtours.co.za'
-- on conflict (user_id, role) do nothing;

-- The imported project's policy used this alternate name. Its insert grants
-- were already revoked in the previous migration; remove the unused policy too.
drop policy if exists "Anyone can submit a booking" on public.bookings;
