-- The imported project's policy used this alternate name. Its insert grants
-- were already revoked in the previous migration; remove the unused policy too.
drop policy if exists "Anyone can submit a booking" on public.bookings;
