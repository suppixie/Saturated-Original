create extension if not exists citext with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username extensions.citext unique,
  display_name text not null default 'Saturated User',
  bio text not null default '',
  avatar_url text,
  birth_verified_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.beverages (
  id text primary key,
  name text not null,
  category text not null,
  brand text,
  origin text,
  description text not null default '',
  image_url text,
  official_tags text[] not null default '{}',
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  beverage_id text not null references public.beverages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating numeric(2,1) not null
    check (rating between 0.5 and 5 and mod(rating * 2, 1) = 0),
  body text not null check (length(trim(body)) > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (beverage_id, user_id)
);

create table public.flavour_tags (
  id bigint generated always as identity primary key,
  name extensions.citext not null unique,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.review_flavour_tags (
  review_id uuid not null references public.reviews(id) on delete cascade,
  flavour_tag_id bigint not null references public.flavour_tags(id) on delete cascade,
  primary key (review_id, flavour_tag_id)
);

create table public.review_likes (
  review_id uuid not null references public.reviews(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (review_id, user_id)
);

create table public.review_comments (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(trim(body)) > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.drinklist (
  user_id uuid not null references public.profiles(id) on delete cascade,
  beverage_id text not null references public.beverages(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, beverage_id)
);

create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table public.drink_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  drink_name text not null check (length(trim(drink_name)) > 0),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.badges (
  id text primary key,
  name text not null,
  description text not null default '',
  icon_url text,
  target integer not null default 1 check (target > 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.user_badges (
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id text not null references public.badges(id) on delete cascade,
  progress integer not null default 0 check (progress >= 0),
  earned_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, badge_id)
);

create index reviews_beverage_created_idx
  on public.reviews (beverage_id, created_at desc);
create index reviews_user_created_idx
  on public.reviews (user_id, created_at desc);
create index comments_review_created_idx
  on public.review_comments (review_id, created_at);
create index follows_following_idx
  on public.follows (following_id);
create index drink_requests_status_idx
  on public.drink_requests (status, created_at);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger beverages_set_updated_at
before update on public.beverages
for each row execute function public.set_updated_at();

create trigger reviews_set_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

create trigger comments_set_updated_at
before update on public.review_comments
for each row execute function public.set_updated_at();

create trigger drink_requests_set_updated_at
before update on public.drink_requests
for each row execute function public.set_updated_at();

create trigger user_badges_set_updated_at
before update on public.user_badges
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    null,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      'Saturated User'
    ),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.beverages enable row level security;
alter table public.reviews enable row level security;
alter table public.flavour_tags enable row level security;
alter table public.review_flavour_tags enable row level security;
alter table public.review_likes enable row level security;
alter table public.review_comments enable row level security;
alter table public.drinklist enable row level security;
alter table public.follows enable row level security;
alter table public.drink_requests enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

create policy "Profiles are publicly readable"
on public.profiles for select
to anon, authenticated
using (true);

create policy "Users update their own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Published beverages are publicly readable"
on public.beverages for select
to anon, authenticated
using (is_published);

create policy "Reviews are publicly readable"
on public.reviews for select
to anon, authenticated
using (true);

create policy "Users create their own reviews"
on public.reviews for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users update their own reviews"
on public.reviews for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users delete their own reviews"
on public.reviews for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Flavour tags are publicly readable"
on public.flavour_tags for select
to anon, authenticated
using (true);

create policy "Authenticated users create flavour tags"
on public.flavour_tags for insert
to authenticated
with check ((select auth.uid()) = created_by);

create policy "Review flavour tags are publicly readable"
on public.review_flavour_tags for select
to anon, authenticated
using (true);

create policy "Review owners manage flavour tags"
on public.review_flavour_tags for all
to authenticated
using (
  exists (
    select 1 from public.reviews
    where reviews.id = review_id
      and reviews.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.reviews
    where reviews.id = review_id
      and reviews.user_id = (select auth.uid())
  )
);

create policy "Review likes are publicly readable"
on public.review_likes for select
to anon, authenticated
using (true);

create policy "Users manage their own review likes"
on public.review_likes for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Review comments are publicly readable"
on public.review_comments for select
to anon, authenticated
using (true);

create policy "Users create their own comments"
on public.review_comments for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users update their own comments"
on public.review_comments for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users delete their own comments"
on public.review_comments for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users read their own drinklist"
on public.drinklist for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users manage their own drinklist"
on public.drinklist for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Follows are publicly readable"
on public.follows for select
to anon, authenticated
using (true);

create policy "Users manage their outgoing follows"
on public.follows for all
to authenticated
using ((select auth.uid()) = follower_id)
with check ((select auth.uid()) = follower_id);

create policy "Users read their own drink requests"
on public.drink_requests for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users create their own drink requests"
on public.drink_requests for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Badges are publicly readable"
on public.badges for select
to anon, authenticated
using (true);

create policy "User badge progress is publicly readable"
on public.user_badges for select
to anon, authenticated
using (true);

grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.beverages, public.reviews,
  public.flavour_tags, public.review_flavour_tags, public.review_likes,
  public.review_comments, public.follows, public.badges, public.user_badges
to anon, authenticated;

grant update on public.profiles to authenticated;
grant insert, update, delete on public.reviews to authenticated;
grant insert on public.flavour_tags to authenticated;
grant insert, update, delete on public.review_flavour_tags to authenticated;
grant insert, delete on public.review_likes to authenticated;
grant insert, update, delete on public.review_comments to authenticated;
grant select, insert, delete on public.drinklist to authenticated;
grant insert, delete on public.follows to authenticated;
grant select, insert on public.drink_requests to authenticated;
grant usage, select on all sequences in schema public to authenticated;

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('beverage-images', 'beverage-images', true)
on conflict (id) do nothing;

create policy "Public images are readable"
on storage.objects for select
to anon, authenticated
using (bucket_id in ('avatars', 'beverage-images'));

create policy "Users upload their own avatar"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users update their own avatar"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users delete their own avatar"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
