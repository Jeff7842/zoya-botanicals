create table if not exists private.username_change_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references private.users (id) on delete cascade,
  previous_username text not null,
  new_username text not null,
  cooldown_days integer not null check (cooldown_days > 0),
  changed_at timestamp with time zone not null default now(),
  next_allowed_at timestamp with time zone not null
);

create index if not exists idx_private_username_change_log_user_id
  on private.username_change_log using btree (user_id);

create index if not exists idx_private_username_change_log_changed_at
  on private.username_change_log using btree (changed_at desc);
