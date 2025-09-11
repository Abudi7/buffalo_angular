--
-- PostgreSQL database dump
--

\restrict Vc7ch69lNKPIJkt1jXt4ECTqzNel3qOw5ivTo4bc8j9PhasJEmApl3wb7FiDaUl

-- Dumped from database version 15.14
-- Dumped by pg_dump version 16.10 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: auth_tokens; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.auth_tokens (
    jti character varying(64) NOT NULL,
    user_id uuid,
    revoked_at timestamp without time zone,
    expires_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.auth_tokens OWNER TO app;

--
-- Name: schema_migration; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.schema_migration (
    version character varying(14) NOT NULL
);


ALTER TABLE public.schema_migration OWNER TO app;

--
-- Name: team_members; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.team_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid,
    user_id uuid,
    role character varying(50) DEFAULT 'member'::character varying,
    status character varying(50) DEFAULT 'active'::character varying,
    invited_by uuid,
    joined_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.team_members OWNER TO app;

--
-- Name: teams; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.teams (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255),
    description text,
    owner_id uuid,
    settings text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.teams OWNER TO app;

--
-- Name: timetrac; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.timetrac (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    project character varying(255),
    note text,
    color character varying(255) DEFAULT '#3b82f6'::character varying,
    start_at timestamp without time zone DEFAULT now(),
    end_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    location_lat numeric,
    location_lng numeric,
    location_addr text,
    photo_data text
);


ALTER TABLE public.timetrac OWNER TO app;

--
-- Name: users; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text,
    password_hash text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO app;

--
-- Name: auth_tokens auth_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.auth_tokens
    ADD CONSTRAINT auth_tokens_pkey PRIMARY KEY (jti);


--
-- Name: schema_migration schema_migration_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.schema_migration
    ADD CONSTRAINT schema_migration_pkey PRIMARY KEY (version);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: timetrac timetrac_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.timetrac
    ADD CONSTRAINT timetrac_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_auth_tokens_user_id; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX idx_auth_tokens_user_id ON public.auth_tokens USING btree (user_id);


--
-- Name: idx_timetrac_start_at; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX idx_timetrac_start_at ON public.timetrac USING btree (start_at);


--
-- Name: schema_migration_version_idx; Type: INDEX; Schema: public; Owner: app
--

CREATE UNIQUE INDEX schema_migration_version_idx ON public.schema_migration USING btree (version);


--
-- Name: team_members_status_idx; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX team_members_status_idx ON public.team_members USING btree (status);


--
-- Name: team_members_team_id_idx; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX team_members_team_id_idx ON public.team_members USING btree (team_id);


--
-- Name: team_members_team_user_idx; Type: INDEX; Schema: public; Owner: app
--

CREATE UNIQUE INDEX team_members_team_user_idx ON public.team_members USING btree (team_id, user_id);


--
-- Name: team_members_user_id_idx; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX team_members_user_id_idx ON public.team_members USING btree (user_id);


--
-- Name: teams_name_idx; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX teams_name_idx ON public.teams USING btree (name);


--
-- Name: teams_owner_id_idx; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX teams_owner_id_idx ON public.teams USING btree (owner_id);


--
-- Name: timetrac_user_id_idx; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX timetrac_user_id_idx ON public.timetrac USING btree (user_id);


--
-- Name: auth_tokens auth_tokens_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.auth_tokens
    ADD CONSTRAINT auth_tokens_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: team_members team_members_invited_by_fk; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_invited_by_fk FOREIGN KEY (invited_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: team_members team_members_teams_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_teams_id_fk FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: team_members team_members_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: teams teams_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_users_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Vc7ch69lNKPIJkt1jXt4ECTqzNel3qOw5ivTo4bc8j9PhasJEmApl3wb7FiDaUl

