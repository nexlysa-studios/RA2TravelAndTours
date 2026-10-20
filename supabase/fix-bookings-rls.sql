-- RA2 booking access repair. Public submissions use the create-booking Edge Function.
-- Run in Supabase SQL Editor only if access needs repairing.
revoke insert on public.bookings from anon, authenticated;
grant select, update, delete on public.bookings to authenticated;
grant all on public.bookings to service_role;
alter table public.bookings enable row level security;
drop policy if exists "Anyone can create a booking" on public.bookings;
drop policy if exists "Anyone can submit a booking" on public.bookings;

-- Admin read/update/delete (re-create if missing)
drop policy if exists "Admins read bookings"   on public.bookings;
drop policy if exists "Admins update bookings" on public.bookings;
drop policy if exists "Admins delete bookings" on public.bookings;

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
