-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.alerts (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  hive_id integer NOT NULL,
  sensor_id integer,
  alert_type character varying NOT NULL CHECK (alert_type::text = ANY (ARRAY['sensor_offline'::character varying, 'battery_low'::character varying, 'temperature_high'::character varying, 'temperature_low'::character varying, 'humidity_high'::character varying, 'humidity_low'::character varying, 'weight_change'::character varying, 'system_error'::character varying]::text[])),
  severity character varying NOT NULL CHECK (severity::text = ANY (ARRAY['info'::character varying, 'warning'::character varying, 'critical'::character varying, 'low'::character varying, 'medium'::character varying, 'high'::character varying]::text[])),
  title character varying NOT NULL,
  message text NOT NULL,
  threshold_value numeric,
  actual_value numeric,
  resolved boolean DEFAULT false,
  resolved_by character varying,
  resolved_notes text,
  created_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone,
  CONSTRAINT alerts_pkey PRIMARY KEY (id),
  CONSTRAINT alerts_sensor_id_fkey FOREIGN KEY (sensor_id) REFERENCES public.sensors(id),
  CONSTRAINT alerts_hive_id_fkey FOREIGN KEY (hive_id) REFERENCES public.hives(id)
);
CREATE TABLE public.apiaries (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  uuid uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  name character varying NOT NULL,
  description text,
  latitude numeric,
  longitude numeric,
  address text,
  installation_date date DEFAULT CURRENT_DATE,
  is_active boolean DEFAULT true,
  user_id uuid NOT NULL,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT apiaries_pkey PRIMARY KEY (id),
  CONSTRAINT apiaries_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT apiaries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.apiary_hubs (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  uuid uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  apiary_id integer,
  user_id uuid NOT NULL,
  name character varying NOT NULL,
  description text,
  last_seen timestamp with time zone,
  firmware_version character varying,
  last_update_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT apiary_hubs_pkey PRIMARY KEY (id),
  CONSTRAINT apiary_hubs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT apiary_hubs_apiary_id_fkey FOREIGN KEY (apiary_id) REFERENCES public.apiaries(id)
);
CREATE TABLE public.daily_summaries (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  hive_id integer NOT NULL,
  date date NOT NULL,
  avg_temperature numeric,
  min_temperature numeric,
  max_temperature numeric,
  temperature_readings_count integer DEFAULT 0,
  avg_humidity numeric,
  min_humidity numeric,
  max_humidity numeric,
  humidity_readings_count integer DEFAULT 0,
  avg_weight numeric,
  min_weight numeric,
  max_weight numeric,
  weight_change_from_previous_day numeric,
  weight_readings_count integer DEFAULT 0,
  total_readings integer DEFAULT 0,
  alerts_count integer DEFAULT 0,
  critical_alerts_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT daily_summaries_pkey PRIMARY KEY (id),
  CONSTRAINT daily_summaries_hive_id_fkey FOREIGN KEY (hive_id) REFERENCES public.hives(id)
);
CREATE TABLE public.device_commands (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  device_type character varying NOT NULL CHECK (device_type::text = ANY (ARRAY['HUB'::character varying, 'UNIT'::character varying]::text[])),
  device_id integer NOT NULL,
  target_sensor_id integer,
  command_type character varying NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status character varying NOT NULL DEFAULT 'queued'::character varying CHECK (status::text = ANY (ARRAY['queued'::character varying, 'sent'::character varying, 'acked'::character varying, 'failed'::character varying, 'expired'::character varying]::text[])),
  correlation_id character varying,
  queued_at timestamp with time zone NOT NULL DEFAULT now(),
  sent_at timestamp with time zone,
  acked_at timestamp with time zone,
  failed_at timestamp with time zone,
  failure_reason text,
  CONSTRAINT device_commands_pkey PRIMARY KEY (id),
  CONSTRAINT device_commands_target_sensor_id_fkey FOREIGN KEY (target_sensor_id) REFERENCES public.sensors(id)
);
CREATE TABLE public.device_telemetry (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  device_type character varying NOT NULL CHECK (device_type::text = ANY (ARRAY['HUB'::character varying, 'UNIT'::character varying]::text[])),
  device_id integer NOT NULL,
  recorded_at timestamp with time zone NOT NULL DEFAULT now(),
  battery_level integer,
  rssi integer,
  snr integer,
  voltage numeric,
  storage_free_bytes bigint,
  ip character varying,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT device_telemetry_pkey PRIMARY KEY (id)
);
CREATE TABLE public.hives (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  uuid uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  apiary_id integer,
  name character varying NOT NULL,
  description text,
  installation_date date DEFAULT CURRENT_DATE,
  is_active boolean DEFAULT true,
  user_id uuid,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT hives_pkey PRIMARY KEY (id),
  CONSTRAINT hives_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT hives_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT hives_apiary_id_fkey FOREIGN KEY (apiary_id) REFERENCES public.apiaries(id)
);
CREATE TABLE public.hub_firmware (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  version character varying NOT NULL,
  file_url text NOT NULL,
  checksum_sha256 character varying,
  is_active boolean DEFAULT true,
  description text,
  uploaded_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT hub_firmware_pkey PRIMARY KEY (id),
  CONSTRAINT hub_firmware_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users(id)
);
CREATE TABLE public.register_interest (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT register_interest_pkey PRIMARY KEY (id)
);
CREATE TABLE public.sensor_firmware (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  sensor_type character varying NOT NULL,
  version character varying NOT NULL,
  file_url text NOT NULL,
  checksum_sha256 character varying,
  is_active boolean DEFAULT true,
  description text,
  uploaded_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sensor_firmware_pkey PRIMARY KEY (id),
  CONSTRAINT sensor_firmware_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users(id)
);
CREATE TABLE public.sensor_readings (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  sensor_id integer NOT NULL,
  hive_id integer NOT NULL,
  hub_id integer,
  sensor_type character varying NOT NULL CHECK (sensor_type::text = ANY (ARRAY['temperature'::character varying, 'weight'::character varying, 'humidity'::character varying, 'audio'::character varying]::text[])),
  value numeric NOT NULL,
  unit character varying NOT NULL,
  reading_time timestamp with time zone NOT NULL DEFAULT now(),
  signal_strength integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sensor_readings_pkey PRIMARY KEY (id),
  CONSTRAINT sensor_readings_sensor_id_fkey FOREIGN KEY (sensor_id) REFERENCES public.sensors(id),
  CONSTRAINT sensor_readings_hub_id_fkey FOREIGN KEY (hub_id) REFERENCES public.apiary_hubs(id),
  CONSTRAINT sensor_readings_hive_id_fkey FOREIGN KEY (hive_id) REFERENCES public.hives(id)
);
CREATE TABLE public.sensor_units (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  uuid uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  hive_id integer NOT NULL,
  user_id uuid NOT NULL,
  hub_id integer,
  name character varying NOT NULL,
  description text,
  last_seen timestamp with time zone,
  firmware_version character varying,
  last_update_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sensor_units_pkey PRIMARY KEY (id),
  CONSTRAINT sensor_units_hive_id_fkey FOREIGN KEY (hive_id) REFERENCES public.hives(id),
  CONSTRAINT sensor_units_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT sensor_units_hub_id_fkey FOREIGN KEY (hub_id) REFERENCES public.apiary_hubs(id)
);
CREATE TABLE public.sensors (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  uuid uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  sensor_unit_id integer,
  hive_id integer,
  user_id uuid NOT NULL,
  sensor_type character varying NOT NULL CHECK (sensor_type::text = ANY (ARRAY['temperature'::character varying, 'weight'::character varying, 'humidity'::character varying, 'audio'::character varying]::text[])),
  name character varying,
  model character varying,
  calibration_offset numeric DEFAULT 0,
  battery_level integer DEFAULT 100 CHECK (battery_level >= 0 AND battery_level <= 100),
  is_online boolean DEFAULT true,
  last_reading_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sensors_pkey PRIMARY KEY (id),
  CONSTRAINT sensors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT sensors_hive_id_fkey FOREIGN KEY (hive_id) REFERENCES public.hives(id),
  CONSTRAINT sensors_sensor_unit_id_fkey FOREIGN KEY (sensor_unit_id) REFERENCES public.sensor_units(id)
);