
CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TYPE public.service_category AS ENUM ('airport_transfer','tour','chauffeur','experience');
CREATE TYPE public.booking_status AS ENUM ('pending','confirmed','completed','cancelled');
CREATE TYPE public.payment_status AS ENUM ('unpaid','paid','refunded','failed');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category public.service_category NOT NULL DEFAULT 'airport_transfer',
  description text,
  duration text,
  price_zar numeric,
  price_note text,
  max_pax integer,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active services are public" ON public.services
  FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can view all services" ON public.services
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert services" ON public.services
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update services" ON public.services
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete services" ON public.services
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER services_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE DEFAULT ('TBS-' || to_char(now(),'YYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  service_name text NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  pickup_location text NOT NULL,
  destination text,
  travel_date date NOT NULL,
  travel_time time,
  passengers integer NOT NULL DEFAULT 1,
  notes text,
  total_zar numeric,
  status public.booking_status NOT NULL DEFAULT 'pending',
  payment_status public.payment_status NOT NULL DEFAULT 'unpaid',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.bookings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a booking" ON public.bookings
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view bookings" ON public.bookings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update bookings" ON public.bookings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete bookings" ON public.bookings
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL,
  alt text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active gallery images are public" ON public.gallery_images
  FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can manage gallery images" ON public.gallery_images
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER gallery_images_updated_at BEFORE UPDATE ON public.gallery_images
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.services (slug, name, category, price_zar, price_note, max_pax, sort_order) VALUES
('hermanus-airport-shuttle','Hermanus Airport Shuttle','airport_transfer',2500,NULL,NULL,10),
('arrival-departure-cape-town-city','Arrival & Departure Cape Town City','airport_transfer',950,'Max 2 pax',2,20),
('affordable-airport-shuttles','Affordable Airport Shuttles','airport_transfer',550,NULL,NULL,30),
('executive-airport-shuttle','Executive Airport Shuttle','airport_transfer',650,NULL,NULL,40),
('minivan-airport-shuttle','Minivan Airport Shuttle','airport_transfer',1000,NULL,NULL,50),
('7-seater-shuttle-services','7 Seater Shuttle Services','airport_transfer',NULL,'Available on request',7,60),
('bloubergstrand','Bloubergstrand Transfer','chauffeur',550,'Max 2 pax',2,70),
('cape-town-city-transfer','Cape Town City Transfer','chauffeur',550,'Max 2 pax',2,80),
('hout-bay-transfer','Hout Bay Transfer','chauffeur',600,'Max 2 pax',2,90),
('strand-transfer','Strand Transfer','chauffeur',600,'Max 2 pax',2,100),
('franschhoek-transfer','Franschhoek Transfer','chauffeur',1500,'Max 2 pax',2,110),
('bellville-transfer','Bellville Transfer','chauffeur',450,'Max 2 pax',2,120),
('camps-bay-transfer','Camps Bay Transfer','chauffeur',550,'Max 2 pax',2,130),
('constantia-transfer','Constantia Transfer','chauffeur',500,'Max 2 pax',2,140),
('sea-point-transfer','Sea Point Transfer','chauffeur',500,'Max 2 pax',2,150),
('va-waterfront-transfer','V&A Waterfront Transfer','chauffeur',450,'Max 2 pax',2,160),
('melkbosstrand-transfer','Melkbosstrand Transfer','chauffeur',580,'Max 2 pax',2,170),
('muizenberg-transfer','Muizenberg Transfer','chauffeur',460,'Max 2 pax',2,180),
('paarl-transfer','Paarl Transfer','chauffeur',NULL,'Available on request',NULL,190),
('cape-peninsula-guided-chauffeur-tour','Cape Peninsula Guided Chauffeur Tour','tour',1900,'Private guided tour, per adult',NULL,200),
('cape-town-city-guided-chauffeur-tour','Cape Town City Guided Chauffeur Tour','tour',1600,'Private city tour',NULL,210),
('stellenbosch-wine-tour','Stellenbosch Wine Tour','tour',2400,'Private wine country tour',NULL,220),
('half-day-wine-tour','Half Day Wine Tour','tour',2400,NULL,NULL,230),
('full-day-wine-tour','Full Day Wine Tour','tour',3500,'8hr',NULL,240),
('cape-flats-culture-tour','Cape Flats Culture Tour','tour',3000,NULL,NULL,250),
('cape-town-half-day-tour','Cape Town Half Day Tour','tour',2400,NULL,NULL,260),
('helicopter-two-oceans','Two Oceans Helicopter Tour','experience',4200,'Half Peninsula',NULL,270),
('helicopter-cape-point','Cape Point Helicopter Tour','experience',8200,'Full Peninsula',NULL,280),
('helicopter-atlantic-seaboard','Cape Town Atlantic Seaboard Helicopter Tour','experience',3150,NULL,NULL,290);
;
