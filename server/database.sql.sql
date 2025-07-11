-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.alerts (
  id integer NOT NULL DEFAULT nextval('alerts_id_seq'::regclass),
  hive_id integer NOT NULL,
  alert_type character varying NOT NULL,
  severity character varying NOT NULL,
  title character varying NOT NULL,
  message text NOT NULL,
  threshold_value numeric,
  actual_value numeric,
  sensor_id integer,
  resolved boolean DEFAULT false,
  resolved_by character varying,
  resolved_notes text,
  created_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone,
  CONSTRAINT alerts_pkey PRIMARY KEY (id),
  CONSTRAINT alerts_hive_id_fkey FOREIGN KEY (hive_id) REFERENCES public.hives(id),
  CONSTRAINT alerts_sensor_id_fkey FOREIGN KEY (sensor_id) REFERENCES public.sensors(id)
);
CREATE TABLE public.daily_summaries (
  id integer NOT NULL DEFAULT nextval('daily_summaries_id_seq'::regclass),
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
CREATE TABLE public.hives (
  id integer NOT NULL DEFAULT nextval('hives_id_seq'::regclass),
  uuid uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  name character varying NOT NULL,
  description text,
  latitude numeric,
  longitude numeric,
  installation_date date DEFAULT CURRENT_DATE,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT hives_pkey PRIMARY KEY (id)
);
CREATE TABLE public.queen_status (
  id integer NOT NULL DEFAULT nextval('queen_status_id_seq'::regclass),
  hive_id integer NOT NULL,
  queen_age_days integer,
  last_seen_date date,
  laying_pattern character varying DEFAULT 'unknown'::character varying,
  queen_marked boolean DEFAULT false,
  queen_color character varying,
  queen_origin character varying,
  replaced_date date,
  replacement_reason character varying,
  notes text,
  status character varying DEFAULT 'active'::character varying,
  confidence_level character varying DEFAULT 'medium'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT queen_status_pkey PRIMARY KEY (id),
  CONSTRAINT queen_status_hive_id_fkey FOREIGN KEY (hive_id) REFERENCES public.hives(id)
);
CREATE TABLE public.sensor_readings (
  id integer NOT NULL DEFAULT nextval('sensor_readings_id_seq'::regclass),
  sensor_id integer NOT NULL,
  hive_id integer NOT NULL,
  sensor_type character varying NOT NULL,
  value numeric NOT NULL,
  unit character varying NOT NULL,
  reading_time timestamp with time zone DEFAULT now(),
  signal_strength integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sensor_readings_pkey PRIMARY KEY (id),
  CONSTRAINT sensor_readings_sensor_id_fkey FOREIGN KEY (sensor_id) REFERENCES public.sensors(id),
  CONSTRAINT sensor_readings_hive_id_fkey FOREIGN KEY (hive_id) REFERENCES public.hives(id)
);
CREATE TABLE public.sensors (
  id integer NOT NULL DEFAULT nextval('sensors_id_seq'::regclass),
  uuid uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  hive_id integer NOT NULL,
  sensor_type character varying NOT NULL,
  name character varying,
  model character varying,
  battery_level integer DEFAULT 100,
  is_online boolean DEFAULT true,
  last_reading_at timestamp with time zone,
  calibration_offset numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sensors_pkey PRIMARY KEY (id),
  CONSTRAINT sensors_hive_id_fkey FOREIGN KEY (hive_id) REFERENCES public.hives(id)
);