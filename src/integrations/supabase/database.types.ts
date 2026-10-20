// Hand-typed Database types for the RA2 Travel & Tours schema.
// Regenerate with the Supabase CLI once the schema is finalised:
//   supabase gen types typescript --project-id opqhpeiwimiadlpkrecb > src/integrations/supabase/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "admin";
export type ServiceCategory =
  | "airport_transfer"
  | "tour"
  | "chauffeur"
  | "experience";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed";

export interface ServiceRow {
  id: string;
  slug: string;
  name: string;
  category: ServiceCategory;
  description: string | null;
  duration: string | null;
  price_zar: number | null;
  price_note: string | null;
  max_pax: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BookingRow {
  id: string;
  reference: string;
  service_id: string | null;
  service_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_location: string;
  destination: string | null;
  travel_date: string;
  travel_time: string | null;
  passengers: number;
  notes: string | null;
  special_requirements: string | null;
  customer_email_sent_at: string | null;
  admin_email_sent_at: string | null;
  customer_email_error: string | null;
  admin_email_error: string | null;
  total_zar: number | null;
  status: BookingStatus;
  payment_status: PaymentStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRow {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      services: {
        Row: ServiceRow;
        Insert: Omit<ServiceRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<ServiceRow>;
        Relationships: [];
      };
      bookings: {
        Row: BookingRow;
        Insert: Omit<
          BookingRow,
          | "id"
          | "reference"
          | "created_at"
          | "updated_at"
          | "status"
          | "payment_status"
          | "admin_notes"
        > & {
          id?: string;
          reference?: string;
          status?: BookingStatus;
          payment_status?: PaymentStatus;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<BookingRow>;
        Relationships: [];
      };
      user_roles: {
        Row: UserRoleRow;
        Insert: Omit<UserRoleRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<UserRoleRow>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {
      has_role: {
        Args: { _user_id: string; _role: AppRole };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: AppRole;
      service_category: ServiceCategory;
      booking_status: BookingStatus;
      payment_status: PaymentStatus;
    };
    CompositeTypes: {};
  };
}
