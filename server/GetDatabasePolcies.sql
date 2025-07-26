-- Complete export of all RLS policies and security settings
-- Run this in Supabase SQL Editor and save the output

-- ================================================================
-- 1. TABLE RLS STATUS
-- ================================================================
SELECT 
    '-- TABLE RLS STATUS --' as section,
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN 'ENABLED' 
        ELSE 'DISABLED' 
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ================================================================
-- 2. ALL RLS POLICIES (DETAILED)
-- ================================================================
SELECT 
    '-- RLS POLICIES --' as section,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ================================================================
-- 3. POLICY CREATION STATEMENTS (RECONSTRUCTED)
-- ================================================================
SELECT 
    '-- POLICY RECREATION SQL --' as section,
    tablename,
    'CREATE POLICY "' || policyname || '" ON public.' || tablename || 
    CASE 
        WHEN cmd = 'ALL' THEN ' FOR ALL'
        WHEN cmd = 'SELECT' THEN ' FOR SELECT'
        WHEN cmd = 'INSERT' THEN ' FOR INSERT'
        WHEN cmd = 'UPDATE' THEN ' FOR UPDATE'
        WHEN cmd = 'DELETE' THEN ' FOR DELETE'
    END ||
    CASE 
        WHEN roles IS NOT NULL THEN ' TO ' || array_to_string(roles, ', ')
        ELSE ''
    END ||
    CASE 
        WHEN qual IS NOT NULL THEN ' USING (' || qual || ')'
        ELSE ''
    END ||
    CASE 
        WHEN with_check IS NOT NULL THEN ' WITH CHECK (' || with_check || ')'
        ELSE ''
    END || ';' as policy_sql
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ================================================================
-- 4. TABLE TRIGGERS
-- ================================================================
SELECT 
    '-- TRIGGERS --' as section,
    event_object_table as table_name,
    trigger_name,
    event_manipulation as event,
    action_timing,
    action_statement,
    action_condition
FROM information_schema.triggers 
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ================================================================
-- 5. FOREIGN KEY CONSTRAINTS
-- ================================================================
SELECT 
    '-- FOREIGN KEYS --' as section,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
LEFT JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
    AND tc.table_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- ================================================================
-- 6. CHECK CONSTRAINTS
-- ================================================================
SELECT 
    '-- CHECK CONSTRAINTS --' as section,
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.check_constraints cc
JOIN information_schema.table_constraints tc 
    ON cc.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- ================================================================
-- 7. COLUMN CONSTRAINTS (NOT NULL, DEFAULTS, etc.)
-- ================================================================
SELECT 
    '-- COLUMN DETAILS --' as section,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('sensors', 'hives', 'sensor_readings', 'alerts')
ORDER BY table_name, ordinal_position;

-- ================================================================
-- 8. AUTH SCHEMA POLICIES (if any)
-- ================================================================
SELECT 
    '-- AUTH POLICIES --' as section,
    schemaname,
    tablename,
    policyname,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'auth'
ORDER BY tablename, policyname;