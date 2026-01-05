export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at: string
          entity_id: string | null
          entity_type: string
          error_message: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          status: string | null
          user_agent: string | null
          user_id: string | null
          user_role: Database["public"]["Enums"]["app_role"] | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at?: string
          entity_id?: string | null
          entity_type: string
          error_message?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          status?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["app_role"] | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          status?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["app_role"] | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          actual_cost: number | null
          actual_distance_km: number | null
          actual_end_time: string | null
          actual_start_time: string | null
          admin_notes: string | null
          allocation_method:
            | Database["public"]["Enums"]["allocation_method"]
            | null
          approved_at: string | null
          approved_by: string | null
          booking_number: string
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          driver_accepted_at: string | null
          driver_arrived_at: string | null
          driver_id: string | null
          drop_address: string
          drop_latitude: number | null
          drop_longitude: number | null
          estimated_cost: number | null
          estimated_duration_mins: number | null
          external_booking_id: string | null
          external_service_name: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          is_external_booking: boolean | null
          is_guest_booking: boolean | null
          journey_completed_at: string | null
          journey_started_at: string | null
          passenger_count: number | null
          pickup_address: string
          pickup_latitude: number | null
          pickup_longitude: number | null
          requester_id: string
          requester_type: Database["public"]["Enums"]["app_role"]
          scheduled_datetime: string
          special_requirements: string | null
          sponsor_officer_id: string | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          actual_cost?: number | null
          actual_distance_km?: number | null
          actual_end_time?: string | null
          actual_start_time?: string | null
          admin_notes?: string | null
          allocation_method?:
            | Database["public"]["Enums"]["allocation_method"]
            | null
          approved_at?: string | null
          approved_by?: string | null
          booking_number: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          driver_accepted_at?: string | null
          driver_arrived_at?: string | null
          driver_id?: string | null
          drop_address: string
          drop_latitude?: number | null
          drop_longitude?: number | null
          estimated_cost?: number | null
          estimated_duration_mins?: number | null
          external_booking_id?: string | null
          external_service_name?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          is_external_booking?: boolean | null
          is_guest_booking?: boolean | null
          journey_completed_at?: string | null
          journey_started_at?: string | null
          passenger_count?: number | null
          pickup_address: string
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          requester_id: string
          requester_type?: Database["public"]["Enums"]["app_role"]
          scheduled_datetime: string
          special_requirements?: string | null
          sponsor_officer_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          actual_cost?: number | null
          actual_distance_km?: number | null
          actual_end_time?: string | null
          actual_start_time?: string | null
          admin_notes?: string | null
          allocation_method?:
            | Database["public"]["Enums"]["allocation_method"]
            | null
          approved_at?: string | null
          approved_by?: string | null
          booking_number?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          driver_accepted_at?: string | null
          driver_arrived_at?: string | null
          driver_id?: string | null
          drop_address?: string
          drop_latitude?: number | null
          drop_longitude?: number | null
          estimated_cost?: number | null
          estimated_duration_mins?: number | null
          external_booking_id?: string | null
          external_service_name?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          is_external_booking?: boolean | null
          is_guest_booking?: boolean | null
          journey_completed_at?: string | null
          journey_started_at?: string | null
          passenger_count?: number | null
          pickup_address?: string
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          requester_id?: string
          requester_type?: Database["public"]["Enums"]["app_role"]
          scheduled_datetime?: string
          special_requirements?: string | null
          sponsor_officer_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_sponsor_officer_id_fkey"
            columns: ["sponsor_officer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_availability_logs: {
        Row: {
          created_at: string
          driver_id: string
          id: string
          is_suspicious: boolean | null
          latitude: number | null
          longitude: number | null
          new_status: boolean
          previous_status: boolean
          reason: string | null
          toggle_count_at_time: number | null
        }
        Insert: {
          created_at?: string
          driver_id: string
          id?: string
          is_suspicious?: boolean | null
          latitude?: number | null
          longitude?: number | null
          new_status: boolean
          previous_status: boolean
          reason?: string | null
          toggle_count_at_time?: number | null
        }
        Update: {
          created_at?: string
          driver_id?: string
          id?: string
          is_suspicious?: boolean | null
          latitude?: number | null
          longitude?: number | null
          new_status?: boolean
          previous_status?: boolean
          reason?: string | null
          toggle_count_at_time?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_availability_logs_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          address: string | null
          availability_reason: string | null
          average_rating: number | null
          bank_account_number: string | null
          bank_ifsc: string | null
          completion_rate: number | null
          created_at: string
          current_latitude: number | null
          current_longitude: number | null
          current_vehicle_id: string | null
          date_of_birth: string | null
          gps_last_updated: string | null
          id: string
          is_active: boolean | null
          is_available: boolean | null
          is_verified: boolean | null
          joined_at: string
          last_availability_toggle: string | null
          license_expiry: string
          license_number: string
          on_time_rate: number | null
          tier: Database["public"]["Enums"]["driver_tier"]
          toggle_count_today: number | null
          toggle_lock_until: string | null
          total_distance_km: number | null
          total_ratings: number | null
          total_trips: number | null
          trips_this_month: number | null
          trips_today: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          availability_reason?: string | null
          average_rating?: number | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
          completion_rate?: number | null
          created_at?: string
          current_latitude?: number | null
          current_longitude?: number | null
          current_vehicle_id?: string | null
          date_of_birth?: string | null
          gps_last_updated?: string | null
          id?: string
          is_active?: boolean | null
          is_available?: boolean | null
          is_verified?: boolean | null
          joined_at?: string
          last_availability_toggle?: string | null
          license_expiry: string
          license_number: string
          on_time_rate?: number | null
          tier?: Database["public"]["Enums"]["driver_tier"]
          toggle_count_today?: number | null
          toggle_lock_until?: string | null
          total_distance_km?: number | null
          total_ratings?: number | null
          total_trips?: number | null
          trips_this_month?: number | null
          trips_today?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          availability_reason?: string | null
          average_rating?: number | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
          completion_rate?: number | null
          created_at?: string
          current_latitude?: number | null
          current_longitude?: number | null
          current_vehicle_id?: string | null
          date_of_birth?: string | null
          gps_last_updated?: string | null
          id?: string
          is_active?: boolean | null
          is_available?: boolean | null
          is_verified?: boolean | null
          joined_at?: string
          last_availability_toggle?: string | null
          license_expiry?: string
          license_number?: string
          on_time_rate?: number | null
          tier?: Database["public"]["Enums"]["driver_tier"]
          toggle_count_today?: number | null
          toggle_lock_until?: string | null
          total_distance_km?: number | null
          total_ratings?: number | null
          total_trips?: number | null
          trips_this_month?: number | null
          trips_today?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drivers_current_vehicle_id_fkey"
            columns: ["current_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      geofence_zones: {
        Row: {
          center_latitude: number
          center_longitude: number
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_authorized_zone: boolean | null
          name: string
          radius_meters: number
          updated_at: string
        }
        Insert: {
          center_latitude: number
          center_longitude: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_authorized_zone?: boolean | null
          name: string
          radius_meters: number
          updated_at?: string
        }
        Update: {
          center_latitude?: number
          center_longitude?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_authorized_zone?: boolean | null
          name?: string
          radius_meters?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "geofence_zones_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gps_location_history: {
        Row: {
          accuracy: number | null
          altitude: number | null
          booking_id: string | null
          driver_id: string | null
          heading: number | null
          id: string
          is_spoofing_suspected: boolean | null
          latitude: number
          longitude: number
          recorded_at: string
          speed: number | null
          vehicle_id: string | null
        }
        Insert: {
          accuracy?: number | null
          altitude?: number | null
          booking_id?: string | null
          driver_id?: string | null
          heading?: number | null
          id?: string
          is_spoofing_suspected?: boolean | null
          latitude: number
          longitude: number
          recorded_at?: string
          speed?: number | null
          vehicle_id?: string | null
        }
        Update: {
          accuracy?: number | null
          altitude?: number | null
          booking_id?: string | null
          driver_id?: string | null
          heading?: number | null
          id?: string
          is_spoofing_suspected?: boolean | null
          latitude?: number
          longitude?: number
          recorded_at?: string
          speed?: number | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gps_location_history_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gps_location_history_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gps_location_history_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          admin_action: string | null
          booking_id: string | null
          created_at: string
          description: string
          driver_id: string | null
          evidence_urls: string[] | null
          id: string
          incident_number: string
          incident_type: Database["public"]["Enums"]["incident_type"]
          latitude: number | null
          longitude: number | null
          reported_by: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: Database["public"]["Enums"]["incident_severity"]
          status: string | null
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          admin_action?: string | null
          booking_id?: string | null
          created_at?: string
          description: string
          driver_id?: string | null
          evidence_urls?: string[] | null
          id?: string
          incident_number: string
          incident_type: Database["public"]["Enums"]["incident_type"]
          latitude?: number | null
          longitude?: number | null
          reported_by?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          status?: string | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          admin_action?: string | null
          booking_id?: string | null
          created_at?: string
          description?: string
          driver_id?: string | null
          evidence_urls?: string[] | null
          id?: string
          incident_number?: string
          incident_type?: Database["public"]["Enums"]["incident_type"]
          latitude?: number | null
          longitude?: number | null
          reported_by?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          status?: string | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          designation: string | null
          email: string
          employee_id: string | null
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          designation?: string | null
          email: string
          employee_id?: string | null
          full_name: string
          id: string
          is_active?: boolean | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          designation?: string | null
          email?: string
          employee_id?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          booking_id: string
          created_at: string
          driver_behavior: number | null
          driver_id: string
          feedback_comment: string | null
          id: string
          punctuality: number | null
          rater_id: string
          rating_score: number
          vehicle_cleanliness: number | null
        }
        Insert: {
          booking_id: string
          created_at?: string
          driver_behavior?: number | null
          driver_id: string
          feedback_comment?: string | null
          id?: string
          punctuality?: number | null
          rater_id: string
          rating_score: number
          vehicle_cleanliness?: number | null
        }
        Update: {
          booking_id?: string
          created_at?: string
          driver_behavior?: number | null
          driver_id?: string
          feedback_comment?: string | null
          id?: string
          punctuality?: number | null
          rater_id?: string
          rating_score?: number
          vehicle_cleanliness?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_rater_id_fkey"
            columns: ["rater_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          color: string | null
          created_at: string
          current_driver_id: string | null
          fuel_type: string | null
          id: string
          insurance_expiry: string | null
          is_reserved: boolean | null
          last_service_date: string | null
          make: string
          model: string
          next_service_due: string | null
          puc_expiry: string | null
          registration_number: string
          reserved_for: string | null
          seating_capacity: number
          special_features: string[] | null
          status: Database["public"]["Enums"]["vehicle_status"]
          total_distance_km: number | null
          updated_at: string
          year: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          current_driver_id?: string | null
          fuel_type?: string | null
          id?: string
          insurance_expiry?: string | null
          is_reserved?: boolean | null
          last_service_date?: string | null
          make: string
          model: string
          next_service_due?: string | null
          puc_expiry?: string | null
          registration_number: string
          reserved_for?: string | null
          seating_capacity?: number
          special_features?: string[] | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          total_distance_km?: number | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          current_driver_id?: string | null
          fuel_type?: string | null
          id?: string
          insurance_expiry?: string | null
          is_reserved?: boolean | null
          last_service_date?: string | null
          make?: string
          model?: string
          next_service_due?: string | null
          puc_expiry?: string | null
          registration_number?: string
          reserved_for?: string | null
          seating_capacity?: number
          special_features?: string[] | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          total_distance_km?: number | null
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_vehicles_current_driver"
            columns: ["current_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_reserved_for_fkey"
            columns: ["reserved_for"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      allocation_method:
        | "tier_1_best_driver"
        | "tier_2_fallback"
        | "tier_3_external"
        | "manual_override"
      app_role:
        | "official"
        | "hog"
        | "driver"
        | "admin"
        | "compliance_officer"
        | "super_admin"
      audit_action:
        | "create"
        | "update"
        | "delete"
        | "approval"
        | "rejection"
        | "login"
        | "logout"
        | "toggle_availability"
      booking_status:
        | "pending"
        | "approved"
        | "assigned"
        | "en_route"
        | "arrived"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "rejected"
      driver_tier:
        | "tier_1_reserved"
        | "tier_2_priority"
        | "tier_3_standard"
        | "tier_4_probation"
      incident_severity: "minor" | "major" | "critical"
      incident_type:
        | "gps_spoofing"
        | "availability_fraud"
        | "safety"
        | "misconduct"
        | "vehicle_issue"
        | "late_arrival"
        | "no_show"
        | "passenger_complaint"
      vehicle_status:
        | "available"
        | "in_use"
        | "maintenance"
        | "reserved"
        | "retired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      allocation_method: [
        "tier_1_best_driver",
        "tier_2_fallback",
        "tier_3_external",
        "manual_override",
      ],
      app_role: [
        "official",
        "hog",
        "driver",
        "admin",
        "compliance_officer",
        "super_admin",
      ],
      audit_action: [
        "create",
        "update",
        "delete",
        "approval",
        "rejection",
        "login",
        "logout",
        "toggle_availability",
      ],
      booking_status: [
        "pending",
        "approved",
        "assigned",
        "en_route",
        "arrived",
        "in_progress",
        "completed",
        "cancelled",
        "rejected",
      ],
      driver_tier: [
        "tier_1_reserved",
        "tier_2_priority",
        "tier_3_standard",
        "tier_4_probation",
      ],
      incident_severity: ["minor", "major", "critical"],
      incident_type: [
        "gps_spoofing",
        "availability_fraud",
        "safety",
        "misconduct",
        "vehicle_issue",
        "late_arrival",
        "no_show",
        "passenger_complaint",
      ],
      vehicle_status: [
        "available",
        "in_use",
        "maintenance",
        "reserved",
        "retired",
      ],
    },
  },
} as const
