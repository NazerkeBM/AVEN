-- Schema only; no user data.

CREATE TABLE public.board_images (
    board_id bigint NOT NULL,
    image_id bigint NOT NULL,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.boards (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    cover_image_url text,
    user_id bigint NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE SEQUENCE public.boards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.boards_id_seq OWNED BY public.boards.id;

CREATE TABLE public.categories (
    id bigint NOT NULL,
    name character varying(50) NOT NULL,
    description text
);

CREATE SEQUENCE public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;

CREATE TABLE public.comments (
    id bigint NOT NULL,
    content text NOT NULL,
    user_id bigint NOT NULL,
    image_id bigint NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE SEQUENCE public.comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;

CREATE TABLE public.follows (
    follower_id bigint NOT NULL,
    following_id bigint NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_no_self_follow CHECK ((follower_id <> following_id))
);

CREATE TABLE public.images (
    id bigint NOT NULL,
    title character varying(150) NOT NULL,
    description text,
    image_url text NOT NULL,
    user_id bigint NOT NULL,
    category_id bigint,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE SEQUENCE public.images_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.images_id_seq OWNED BY public.images.id;

CREATE TABLE public.likes (
    user_id bigint NOT NULL,
    image_id bigint NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.saved_images (
    user_id bigint NOT NULL,
    image_id bigint NOT NULL,
    saved_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.users (
    id bigint NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    display_name character varying(100),
    bio text,
    avatar_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;

ALTER TABLE ONLY public.boards ALTER COLUMN id SET DEFAULT nextval('public.boards_id_seq'::regclass);

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);

ALTER TABLE ONLY public.images ALTER COLUMN id SET DEFAULT nextval('public.images_id_seq'::regclass);

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);

ALTER TABLE ONLY public.board_images
    ADD CONSTRAINT board_images_pkey PRIMARY KEY (board_id, image_id);

ALTER TABLE ONLY public.boards
    ADD CONSTRAINT boards_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_pkey PRIMARY KEY (follower_id, following_id);

ALTER TABLE ONLY public.images
    ADD CONSTRAINT images_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (user_id, image_id);

ALTER TABLE ONLY public.saved_images
    ADD CONSTRAINT saved_images_pkey PRIMARY KEY (user_id, image_id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);

ALTER TABLE ONLY public.board_images
    ADD CONSTRAINT fk_board_images_board FOREIGN KEY (board_id) REFERENCES public.boards(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.board_images
    ADD CONSTRAINT fk_board_images_image FOREIGN KEY (image_id) REFERENCES public.images(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.boards
    ADD CONSTRAINT fk_board_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT fk_comment_image FOREIGN KEY (image_id) REFERENCES public.images(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT fk_follow_follower FOREIGN KEY (follower_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT fk_follow_following FOREIGN KEY (following_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.images
    ADD CONSTRAINT fk_image_category FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.images
    ADD CONSTRAINT fk_image_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT fk_like_image FOREIGN KEY (image_id) REFERENCES public.images(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT fk_like_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.saved_images
    ADD CONSTRAINT fk_saved_image FOREIGN KEY (image_id) REFERENCES public.images(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.saved_images
    ADD CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
