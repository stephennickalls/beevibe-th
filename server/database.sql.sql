-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.contractor_sessions (
  token text,
  created_at timestamp without time zone DEFAULT now(),
  publicLiabilityUpload text,
  professionalIndemnityUpload text,
  motorVehicleUpload text,
  otherInsuranceUpload text,
  healthSafetyPolicyUpload text,
  qualityPolicyUpload text,
  environmentalPolicyUpload text,
  safetyAuditUpload text,
  iso9001Upload text,
  iso14001Upload text,
  trainingRecordsUpload text,
  meetingMinutesUpload text,
  modernSlaveryPolicyUpload text,
  code text NOT NULL UNIQUE,
  CONSTRAINT contractor_sessions_pkey PRIMARY KEY (code)
);