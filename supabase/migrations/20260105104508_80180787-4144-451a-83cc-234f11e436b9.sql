-- GFAMS Database Schema - Complete Implementation
-- Government Fleet Allocation & Management System

-- =====================================================
-- 1. ENUM TYPES
-- =====================================================

-- User role enum
CREATE TYPE public.app_role AS ENUM ('official', 'hog', 'driver', 'admin', 'compliance_officer', 'super_admin');

-- Vehicle status enum
CREATE TYPE public.vehicle_status AS ENUM ('available', 'in_use', 'maintenance', 'reserved', 'retired');

-- Driver tier enum
CREATE TYPE public.driver_tier AS ENUM ('tier_1_reserved', 'tier_2_priority', 'tier_3_standard', 'tier_4_probation');

-- Booking status enum
CREATE TYPE public.booking_status AS ENUM ('pending', 'approved', 'assigned', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled', 'rejected');

-- Allocation method enum
CREATE TYPE public.allocation_method AS ENUM ('tier_1_best_driver', 'tier_2_fallback', 'tier_3_external', 'manual_override');

-- Incident type enum
CREATE TYPE public.incident_type AS ENUM ('gps_spoofing', 'availability_fraud', 'safety', 'misconduct', 'vehicle_issue', 'late_arrival', 'no_show', 'passenger_complaint');

-- Incident severity enum
CREATE TYPE public.incident_severity AS ENUM ('minor', 'major', 'critical');

-- Audit action enum
CREATE TYPE public.audit_action AS ENUM ('create', 'update', 'delete', 'approval', 'rejection', 'login', 'logout', 'toggle_availability');

-- =====================================================
-- 2. USER ROLES TABLE (Security Critical)
-- =====================================================

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    )
$$;

-- Function to check if user has any admin-level role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id AND role IN ('admin', 'super_admin', 'compliance_officer')
    )
$$;

-- =====================================================
-- 3. PROFILES TABLE
-- =====================================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    designation TEXT,
    department TEXT,
    employee_id TEXT UNIQUE,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. VEHICLES TABLE
-- =====================================================

CREATE TABLE public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number TEXT NOT NULL UNIQUE,
    model TEXT NOT NULL,
    make TEXT NOT NULL,
    year INTEGER,
    seating_capacity INTEGER NOT NULL DEFAULT 4,
    fuel_type TEXT DEFAULT 'petrol',
    color TEXT,
    status vehicle_status NOT NULL DEFAULT 'available',
    is_reserved BOOLEAN DEFAULT false,
    reserved_for UUID REFERENCES public.profiles(id),
    current_driver_id UUID,
    insurance_expiry DATE,
    puc_expiry DATE,
    last_service_date DATE,
    next_service_due DATE,
    total_distance_km DECIMAL(12,2) DEFAULT 0,
    special_features TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. DRIVERS TABLE
-- =====================================================

CREATE TABLE public.drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    license_number TEXT NOT NULL UNIQUE,
    license_expiry DATE NOT NULL,
    date_of_birth DATE,
    address TEXT,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    current_vehicle_id UUID REFERENCES public.vehicles(id),
    tier driver_tier NOT NULL DEFAULT 'tier_3_standard',
    is_available BOOLEAN DEFAULT false,
    availability_reason TEXT,
    last_availability_toggle TIMESTAMPTZ,
    toggle_count_today INTEGER DEFAULT 0,
    toggle_lock_until TIMESTAMPTZ,
    current_latitude DECIMAL(10,8),
    current_longitude DECIMAL(11,8),
    gps_last_updated TIMESTAMPTZ,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 100,
    on_time_rate DECIMAL(5,2) DEFAULT 100,
    total_trips INTEGER DEFAULT 0,
    trips_today INTEGER DEFAULT 0,
    trips_this_month INTEGER DEFAULT 0,
    total_distance_km DECIMAL(12,2) DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add foreign key for current_driver in vehicles
ALTER TABLE public.vehicles 
ADD CONSTRAINT fk_vehicles_current_driver 
FOREIGN KEY (current_driver_id) REFERENCES public.drivers(id);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. BOOKINGS TABLE
-- =====================================================

CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number TEXT NOT NULL UNIQUE,
    requester_id UUID NOT NULL REFERENCES public.profiles(id),
    requester_type app_role NOT NULL DEFAULT 'official',
    is_guest_booking BOOLEAN DEFAULT false,
    guest_name TEXT,
    guest_phone TEXT,
    sponsor_officer_id UUID REFERENCES public.profiles(id),
    vehicle_id UUID REFERENCES public.vehicles(id),
    driver_id UUID REFERENCES public.drivers(id),
    pickup_address TEXT NOT NULL,
    pickup_latitude DECIMAL(10,8),
    pickup_longitude DECIMAL(11,8),
    drop_address TEXT NOT NULL,
    drop_latitude DECIMAL(10,8),
    drop_longitude DECIMAL(11,8),
    scheduled_datetime TIMESTAMPTZ NOT NULL,
    estimated_duration_mins INTEGER,
    actual_start_time TIMESTAMPTZ,
    actual_end_time TIMESTAMPTZ,
    passenger_count INTEGER DEFAULT 1,
    special_requirements TEXT,
    status booking_status NOT NULL DEFAULT 'pending',
    allocation_method allocation_method,
    driver_accepted_at TIMESTAMPTZ,
    driver_arrived_at TIMESTAMPTZ,
    journey_started_at TIMESTAMPTZ,
    journey_completed_at TIMESTAMPTZ,
    actual_distance_km DECIMAL(10,2),
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    is_external_booking BOOLEAN DEFAULT false,
    external_service_name TEXT,
    external_booking_id TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    cancelled_by UUID REFERENCES public.profiles(id),
    admin_notes TEXT,
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. RATINGS TABLE
-- =====================================================

CREATE TABLE public.ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES public.drivers(id),
    rater_id UUID NOT NULL REFERENCES public.profiles(id),
    rating_score INTEGER NOT NULL CHECK (rating_score >= 1 AND rating_score <= 5),
    feedback_comment TEXT,
    vehicle_cleanliness INTEGER CHECK (vehicle_cleanliness >= 1 AND vehicle_cleanliness <= 5),
    driver_behavior INTEGER CHECK (driver_behavior >= 1 AND driver_behavior <= 5),
    punctuality INTEGER CHECK (punctuality >= 1 AND punctuality <= 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(booking_id, rater_id)
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. DRIVER AVAILABILITY LOG
-- =====================================================

CREATE TABLE public.driver_availability_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
    previous_status BOOLEAN NOT NULL,
    new_status BOOLEAN NOT NULL,
    reason TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    is_suspicious BOOLEAN DEFAULT false,
    toggle_count_at_time INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.driver_availability_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 9. GPS LOCATION HISTORY
-- =====================================================

CREATE TABLE public.gps_location_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    accuracy DECIMAL(6,2),
    speed DECIMAL(6,2),
    heading DECIMAL(5,2),
    altitude DECIMAL(10,2),
    is_spoofing_suspected BOOLEAN DEFAULT false,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gps_location_history ENABLE ROW LEVEL SECURITY;

-- Index for efficient querying of recent locations
CREATE INDEX idx_gps_history_driver_time ON public.gps_location_history(driver_id, recorded_at DESC);
CREATE INDEX idx_gps_history_vehicle_time ON public.gps_location_history(vehicle_id, recorded_at DESC);

-- =====================================================
-- 10. INCIDENTS LOG
-- =====================================================

CREATE TABLE public.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_number TEXT NOT NULL UNIQUE,
    incident_type incident_type NOT NULL,
    severity incident_severity NOT NULL DEFAULT 'minor',
    driver_id UUID REFERENCES public.drivers(id),
    vehicle_id UUID REFERENCES public.vehicles(id),
    booking_id UUID REFERENCES public.bookings(id),
    reported_by UUID REFERENCES public.profiles(id),
    description TEXT NOT NULL,
    evidence_urls TEXT[],
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    admin_action TEXT,
    resolved_by UUID REFERENCES public.profiles(id),
    resolved_at TIMESTAMPTZ,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 11. AUDIT LOG (Immutable)
-- =====================================================

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action audit_action NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    user_id UUID REFERENCES auth.users(id),
    user_role app_role,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failure')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Index for efficient audit queries
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_time ON public.audit_logs(created_at DESC);

-- =====================================================
-- 12. NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    related_entity_type TEXT,
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Index for user notifications
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);

-- =====================================================
-- 13. GEOFENCING ZONES
-- =====================================================

CREATE TABLE public.geofence_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    center_latitude DECIMAL(10,8) NOT NULL,
    center_longitude DECIMAL(11,8) NOT NULL,
    radius_meters INTEGER NOT NULL,
    is_authorized_zone BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.geofence_zones ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 14. RLS POLICIES
-- =====================================================

-- User Roles Policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Vehicles Policies
CREATE POLICY "Authenticated users can view vehicles"
ON public.vehicles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage vehicles"
ON public.vehicles FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Drivers Policies
CREATE POLICY "Drivers can view own record"
ON public.drivers FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all drivers"
ON public.drivers FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Drivers can update own record"
ON public.drivers FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage drivers"
ON public.drivers FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Bookings Policies
CREATE POLICY "Users can view own bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (requester_id = auth.uid() OR sponsor_officer_id = auth.uid());

CREATE POLICY "Drivers can view assigned bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.drivers d 
        WHERE d.user_id = auth.uid() AND d.id = driver_id
    )
);

CREATE POLICY "Admins can view all bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can create bookings"
ON public.bookings FOR INSERT
TO authenticated
WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Admins can manage bookings"
ON public.bookings FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Ratings Policies
CREATE POLICY "Users can view ratings"
ON public.ratings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create ratings for their bookings"
ON public.ratings FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.bookings b 
        WHERE b.id = booking_id AND b.requester_id = auth.uid()
    )
);

-- Availability Logs Policies
CREATE POLICY "Drivers can view own logs"
ON public.driver_availability_logs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.drivers d 
        WHERE d.id = driver_id AND d.user_id = auth.uid()
    )
);

CREATE POLICY "Admins can view all availability logs"
ON public.driver_availability_logs FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- GPS History Policies
CREATE POLICY "Admins can view GPS history"
ON public.gps_location_history FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Drivers can view own GPS history"
ON public.gps_location_history FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.drivers d 
        WHERE d.id = driver_id AND d.user_id = auth.uid()
    )
);

-- Incidents Policies
CREATE POLICY "Admins can manage incidents"
ON public.incidents FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view incidents they reported"
ON public.incidents FOR SELECT
TO authenticated
USING (reported_by = auth.uid());

-- Audit Logs Policies (Read-only for admins)
CREATE POLICY "Admins and compliance can view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin') OR 
    public.has_role(auth.uid(), 'compliance_officer')
);

-- Notifications Policies
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Geofence Zones Policies
CREATE POLICY "Authenticated can view active zones"
ON public.geofence_zones FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage zones"
ON public.geofence_zones FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- =====================================================
-- 15. TRIGGERS & FUNCTIONS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply to relevant tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON public.vehicles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at
    BEFORE UPDATE ON public.drivers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at
    BEFORE UPDATE ON public.incidents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_geofence_zones_updated_at
    BEFORE UPDATE ON public.geofence_zones
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Generate booking number
CREATE OR REPLACE FUNCTION public.generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.booking_number := 'BK' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('booking_number_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE SEQUENCE IF NOT EXISTS booking_number_seq START 1;

CREATE TRIGGER set_booking_number
    BEFORE INSERT ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.generate_booking_number();

-- Generate incident number
CREATE OR REPLACE FUNCTION public.generate_incident_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.incident_number := 'INC' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('incident_number_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE SEQUENCE IF NOT EXISTS incident_number_seq START 1;

CREATE TRIGGER set_incident_number
    BEFORE INSERT ON public.incidents
    FOR EACH ROW EXECUTE FUNCTION public.generate_incident_number();

-- Handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, phone, designation, department)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'designation',
        NEW.raw_user_meta_data->>'department'
    );
    
    -- Assign default role based on user metadata
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
        NEW.id,
        COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'official')
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Driver rating update trigger
CREATE OR REPLACE FUNCTION public.update_driver_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    total_count INTEGER;
BEGIN
    SELECT AVG(rating_score), COUNT(*) INTO avg_rating, total_count
    FROM public.ratings
    WHERE driver_id = NEW.driver_id
    AND created_at > NOW() - INTERVAL '90 days';
    
    UPDATE public.drivers
    SET average_rating = COALESCE(avg_rating, 0),
        total_ratings = total_count
    WHERE id = NEW.driver_id;
    
    -- Update tier based on rating
    UPDATE public.drivers
    SET tier = CASE
        WHEN COALESCE(avg_rating, 0) >= 4.5 AND completion_rate >= 95 THEN 'tier_1_reserved'
        WHEN COALESCE(avg_rating, 0) >= 4.0 AND completion_rate >= 90 THEN 'tier_2_priority'
        WHEN COALESCE(avg_rating, 0) >= 3.5 AND completion_rate >= 85 THEN 'tier_3_standard'
        ELSE 'tier_4_probation'
    END
    WHERE id = NEW.driver_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER on_rating_insert
    AFTER INSERT ON public.ratings
    FOR EACH ROW EXECUTE FUNCTION public.update_driver_rating();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;