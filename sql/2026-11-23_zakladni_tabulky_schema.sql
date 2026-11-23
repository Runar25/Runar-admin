-- 2026-11-23 — Základní tabulky bez vytvářecí migrace: jen ZÁZNAM, jak vypadají v produkci (pg_dump --schema-only, bez vlastníka a grantů).
-- Proč: readings, gift_codes, runar_character, runar_corrections, runar_static_audio a rate_limits vznikly ručně v Supabase editoru
-- před zavedením sql/; z repa se DB postavit nedala (údržba 2026-11-23, oblast G). NESPOUŠTĚT na produkci — tabulky tam jsou.
-- Granty a mazání vlastní pozdější migrace; obnovu ze zálohy dělá scripts/utils/obnova_db.js z pg_dump (zálohy), ne tenhle soubor.

--
-- PostgreSQL database dump
--

\restrict u4hsDa7OAx0bjgOQCsGtY0w7WihVDOOeGiZTLFfzkeeo8bzoXnzupLnAaiyU7lD

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: gift_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gift_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    credits integer DEFAULT 10 NOT NULL,
    rune_name text,
    batch_id text,
    used_by uuid,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    form text,
    purpose text,
    channel text,
    bundle text,
    order_ref text,
    price numeric(10,2),
    currency text DEFAULT 'ISK'::text,
    complimentary boolean DEFAULT false NOT NULL,
    lang text,
    design text,
    CONSTRAINT gift_codes_form_check CHECK ((form = ANY (ARRAY['digital'::text, 'physical'::text]))),
    CONSTRAINT gift_codes_lang_check CHECK ((lang = ANY (ARRAY['is'::text, 'en'::text]))),
    CONSTRAINT gift_codes_purpose_check CHECK ((purpose = ANY (ARRAY['self'::text, 'gift'::text])))
);


--
-- Name: rate_limits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rate_limits (
    key text NOT NULL,
    window_start timestamp with time zone NOT NULL,
    count integer DEFAULT 1 NOT NULL
);


--
-- Name: readings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.readings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    rune_name text NOT NULL,
    rune_glyph text,
    lang text DEFAULT 'en'::text NOT NULL,
    short_text text,
    deep_text text,
    area text,
    seeking text,
    question text,
    drawn_at timestamp with time zone DEFAULT now(),
    life_rune text,
    credits_used boolean DEFAULT false,
    intention text,
    follow_up jsonb,
    aol text,
    prompt_version text,
    address text,
    reading_mode text,
    prompt_draws jsonb,
    usage jsonb
);


--
-- Name: COLUMN readings.prompt_draws; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.readings.prompt_draws IS 'Co si prompt pro toto čtení vylosoval (angle/image/ending/name). Zapisuje server. Null = čtení z doby před 2026-08-09.';


--
-- Name: runar_character; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.runar_character (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    label text,
    identity text,
    personality text,
    purpose text,
    voice text,
    never text,
    philosophy text,
    format text,
    imagery text,
    active boolean DEFAULT true
);


--
-- Name: runar_corrections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.runar_corrections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    original_phrase text NOT NULL,
    replacement_phrase text NOT NULL,
    context text,
    lang_scope text DEFAULT 'both'::text
);


--
-- Name: runar_static_audio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.runar_static_audio (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    rune_name text NOT NULL,
    rune_glyph text NOT NULL,
    lang text NOT NULL,
    text text NOT NULL,
    audio_url text,
    ready boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    version integer DEFAULT 1 NOT NULL,
    CONSTRAINT runar_static_audio_lang_check CHECK ((lang = ANY (ARRAY['en'::text, 'is'::text])))
);


--
-- Name: gift_codes gift_codes_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gift_codes
    ADD CONSTRAINT gift_codes_code_key UNIQUE (code);


--
-- Name: gift_codes gift_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gift_codes
    ADD CONSTRAINT gift_codes_pkey PRIMARY KEY (id);


--
-- Name: rate_limits rate_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rate_limits
    ADD CONSTRAINT rate_limits_pkey PRIMARY KEY (key, window_start);


--
-- Name: readings readings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.readings
    ADD CONSTRAINT readings_pkey PRIMARY KEY (id);


--
-- Name: runar_character runar_character_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.runar_character
    ADD CONSTRAINT runar_character_pkey PRIMARY KEY (id);


--
-- Name: runar_corrections runar_corrections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.runar_corrections
    ADD CONSTRAINT runar_corrections_pkey PRIMARY KEY (id);


--
-- Name: runar_static_audio runar_static_audio_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.runar_static_audio
    ADD CONSTRAINT runar_static_audio_pkey PRIMARY KEY (id);


--
-- Name: runar_static_audio runar_static_audio_rune_name_lang_version_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.runar_static_audio
    ADD CONSTRAINT runar_static_audio_rune_name_lang_version_key UNIQUE (rune_name, lang, version);


--
-- Name: idx_readings_user_drawn; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_readings_user_drawn ON public.readings USING btree (user_id, drawn_at DESC);


--
-- Name: idx_static_audio_rune_lang; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_static_audio_rune_lang ON public.runar_static_audio USING btree (rune_name, lang);


--
-- Name: runar_static_audio runar_static_audio_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER runar_static_audio_updated_at BEFORE UPDATE ON public.runar_static_audio FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: gift_codes gift_codes_used_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gift_codes
    ADD CONSTRAINT gift_codes_used_by_fkey FOREIGN KEY (used_by) REFERENCES auth.users(id);


--
-- Name: readings readings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.readings
    ADD CONSTRAINT readings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: gift_codes Admin manage gift codes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin manage gift codes" ON public.gift_codes USING (public.je_admin()) WITH CHECK (public.je_admin());


--
-- Name: runar_static_audio Public can read ready audio; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read ready audio" ON public.runar_static_audio FOR SELECT USING ((ready = true));


--
-- Name: runar_static_audio Service role can do everything; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can do everything" ON public.runar_static_audio USING ((auth.role() = 'service_role'::text));


--
-- Name: readings Users read own readings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users read own readings" ON public.readings FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: runar_static_audio admins_delete_static_audio; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admins_delete_static_audio ON public.runar_static_audio FOR DELETE TO authenticated USING (public.je_admin());


--
-- Name: runar_static_audio admins_select_static_audio; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admins_select_static_audio ON public.runar_static_audio FOR SELECT TO authenticated USING (true);


--
-- Name: gift_codes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.gift_codes ENABLE ROW LEVEL SECURITY;

--
-- Name: rate_limits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

--
-- Name: readings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.readings ENABLE ROW LEVEL SECURITY;

--
-- Name: runar_character; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.runar_character ENABLE ROW LEVEL SECURITY;

--
-- Name: runar_character runar_character_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY runar_character_admin_all ON public.runar_character TO authenticated USING (public.je_admin()) WITH CHECK (public.je_admin());


--
-- Name: runar_corrections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.runar_corrections ENABLE ROW LEVEL SECURITY;

--
-- Name: runar_corrections runar_corrections_admin_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY runar_corrections_admin_write ON public.runar_corrections TO authenticated USING (public.je_admin()) WITH CHECK (public.je_admin());


--
-- Name: runar_corrections runar_corrections_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY runar_corrections_public_read ON public.runar_corrections FOR SELECT TO authenticated, anon USING (true);


--
-- Name: runar_static_audio; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.runar_static_audio ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict u4hsDa7OAx0bjgOQCsGtY0w7WihVDOOeGiZTLFfzkeeo8bzoXnzupLnAaiyU7lD

