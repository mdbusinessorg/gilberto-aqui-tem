-- GILBERTO AQUI TEM — esquema principal
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- enums
create type public.user_role as enum (
  'super_admin','admin','manager','sales','warehouse','customer_service','marketing','delivery','technician','customer'
);
create type public.product_condition as enum ('novo','recondicionado','usado');
create type public.order_status as enum (
  'pendente','confirmado','pago','em_preparacao','enviado','entregue','concluido','cancelado','devolvido'
);
create type public.payment_status as enum ('pendente','pago','parcial','reembolsado');
create type public.order_channel as enum ('website','whatsapp','loja','manual');
create type public.delivery_method as enum ('levantamento','entrega');
create type public.movement_type as enum (
  'entrada','saida','venda','devolucao','troca','danificado','perdido','ajuste','transferencia'
);
create type public.trade_status as enum (
  'novo','em_avaliacao','proposta_enviada','aceite','rejeitado','aparelho_recebido','concluido'
);
create type public.review_status as enum ('pendente','aprovada','rejeitada','oculta');
create type public.work_status as enum ('nao_iniciada','em_progresso','concluida','atrasada','cancelada');
create type public.priority_level as enum ('baixa','media','alta','urgente');
create type public.po_status as enum ('rascunho','encomendado','parcialmente_recebido','recebido','cancelado');
create type public.return_status as enum ('pendente','aprovada','rejeitada','concluida');
create type public.attendance_status as enum ('presente','atrasado','ausente','justificado');
create type public.loyalty_tier as enum ('regular','silver','gold','vip');
create type public.chat_room_type as enum ('produto','suporte','equipa');
create type public.discount_type as enum ('percentual','fixo');
create type public.notification_priority as enum ('baixa','normal','alta','critica');

-- ---------------------------------------------------------------- utilidades
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create or replace function public.slugify(txt text) returns text language sql immutable as $$
  select trim(both '-' from regexp_replace(lower(translate(coalesce(txt,''),
    'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
    'aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN')), '[^a-z0-9]+', '-', 'g'))
$$;

-- ---------------------------------------------------------------- perfis
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  email text,
  role public.user_role not null default 'customer',
  avatar_url text,
  birth_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated before update on public.profiles for each row execute function public.set_updated_at();

create or replace function public.my_role() returns public.user_role
language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where id = auth.uid() and is_active), 'customer'::public.user_role)
$$;
create or replace function public.is_staff() returns boolean language sql stable as $$
  select auth.uid() is not null and public.my_role() <> 'customer'
$$;
create or replace function public.is_admin() returns boolean language sql stable as $$
  select public.my_role() in ('super_admin','admin')
$$;
create or replace function public.is_manager() returns boolean language sql stable as $$
  select public.my_role() in ('super_admin','admin','manager')
$$;
create or replace function public.has_role(variadic roles text[]) returns boolean language sql stable as $$
  select public.my_role()::text = any(roles)
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.raw_user_meta_data->>'phone', new.email)
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- clientes
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete set null,
  name text not null,
  phone text,
  whatsapp text,
  email text,
  location text,
  birth_date date,
  notes text,
  status text not null default 'activo',
  tier public.loyalty_tier not null default 'regular',
  loyalty_points integer not null default 0,
  total_spent numeric(14,2) not null default 0,
  orders_count integer not null default 0,
  last_order_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index customers_phone_idx on public.customers (phone) where phone is not null and profile_id is null;
create index customers_name_idx on public.customers using gin (to_tsvector('simple', name));
create trigger trg_customers_updated before update on public.customers for each row execute function public.set_updated_at();

create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  label text,
  province text,
  municipality text,
  address text not null,
  reference_point text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- catálogo
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  logo_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0
);
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  parent_id uuid references public.categories(id) on delete set null,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sku text not null unique,
  brand_id uuid references public.brands(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  model text,
  description text,
  price numeric(14,2) not null check (price >= 0),
  promo_price numeric(14,2) check (promo_price is null or promo_price >= 0),
  cost_price numeric(14,2) check (cost_price is null or cost_price >= 0),
  min_stock integer not null default 1,
  stock_total integer not null default 0,
  condition public.product_condition not null default 'novo',
  color text,
  storage text,
  ram text,
  battery_health integer check (battery_health is null or (battery_health between 0 and 100)),
  warranty_months integer default 0,
  video_url text,
  specs jsonb not null default '{}'::jsonb,
  device_details jsonb not null default '{}'::jsonb,
  internal_notes text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_promo boolean not null default false,
  rating_avg numeric(3,2) not null default 0,
  rating_count integer not null default 0,
  sold_count integer not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products (category_id);
create index products_brand_idx on public.products (brand_id);
create index products_active_idx on public.products (is_active, is_featured, is_promo);
create index products_search_idx on public.products using gin (to_tsvector('simple', coalesce(name,'')||' '||coalesce(model,'')||' '||coalesce(sku,'')));
create trigger trg_products_updated before update on public.products for each row execute function public.set_updated_at();

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt text,
  sort_order integer not null default 0,
  is_primary boolean not null default false
);
create index product_images_product_idx on public.product_images (product_id, sort_order);

-- ---------------------------------------------------------------- armazém
create table public.inventory_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  kind text not null default 'armazem',
  sells boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0
);
create table public.inventory (
  product_id uuid not null references public.products(id) on delete cascade,
  location_id uuid not null references public.inventory_locations(id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now(),
  primary key (product_id, location_id)
);
create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  location_id uuid references public.inventory_locations(id),
  to_location_id uuid references public.inventory_locations(id),
  type public.movement_type not null,
  quantity integer not null check (quantity > 0),
  reason text,
  reference_type text,
  reference_id uuid,
  notes text,
  user_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create index inventory_movements_product_idx on public.inventory_movements (product_id, created_at desc);
create index inventory_movements_created_idx on public.inventory_movements (created_at desc);

create or replace function public.sync_product_stock() returns trigger language plpgsql security definer set search_path = public as $$
declare pid uuid;
begin
  pid := coalesce(new.product_id, old.product_id);
  update public.products p set stock_total = coalesce((
    select sum(i.quantity) from public.inventory i join public.inventory_locations l on l.id = i.location_id
    where i.product_id = pid and l.sells), 0)
  where p.id = pid;
  return null;
end $$;
create trigger trg_inventory_sync after insert or update or delete on public.inventory for each row execute function public.sync_product_stock();

-- ---------------------------------------------------------------- pedidos
create sequence public.order_number_seq;
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  channel public.order_channel not null default 'website',
  status public.order_status not null default 'pendente',
  payment_status public.payment_status not null default 'pendente',
  payment_method text,
  delivery_method public.delivery_method not null default 'levantamento',
  delivery_address text,
  delivery_fee numeric(14,2) not null default 0,
  subtotal numeric(14,2) not null default 0,
  discount numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  coupon_code text,
  seller_id uuid references public.profiles(id),
  notes text,
  internal_notes text,
  stock_deducted boolean not null default false,
  points_awarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_customer_idx on public.orders (customer_id);
create index orders_status_idx on public.orders (status, created_at desc);
create index orders_created_idx on public.orders (created_at desc);
create trigger trg_orders_updated before update on public.orders for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  sku text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(14,2) not null,
  unit_cost numeric(14,2),
  discount numeric(14,2) not null default 0,
  total numeric(14,2) not null
);
create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  note text,
  user_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- avaliações e wishlist
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text not null,
  image_url text,
  is_verified boolean not null default false,
  is_featured boolean not null default false,
  status public.review_status not null default 'pendente',
  admin_response text,
  responded_at timestamptz,
  moderated_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create index reviews_product_idx on public.reviews (product_id, status);

create table public.wishlists (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, product_id)
);

-- ---------------------------------------------------------------- trocas (trade-in)
create table public.trade_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  phone text not null,
  brand text not null,
  model text not null,
  storage text,
  condition text,
  battery_health integer,
  accessories text,
  photos text[] not null default '{}',
  expected_value numeric(14,2),
  notes text,
  desired_product_id uuid references public.products(id) on delete set null,
  status public.trade_status not null default 'novo',
  estimated_value numeric(14,2),
  final_offer numeric(14,2),
  inspection_condition text,
  inspection_result text,
  evaluated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index trade_requests_status_idx on public.trade_requests (status, created_at desc);
create trigger trg_trade_updated before update on public.trade_requests for each row execute function public.set_updated_at();

create table public.trade_exchanges (
  id uuid primary key default gen_random_uuid(),
  trade_request_id uuid not null references public.trade_requests(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  device_value numeric(14,2) not null,
  new_product_id uuid references public.products(id) on delete set null,
  new_product_price numeric(14,2) not null default 0,
  difference numeric(14,2) not null default 0,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- funcionários
create table public.employees (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete set null,
  employee_code text unique,
  full_name text not null,
  department text not null default 'Vendas',
  position text,
  phone text,
  email text,
  hire_date date,
  status text not null default 'activo',
  schedule_start time not null default '08:30',
  schedule_end time not null default '18:00',
  work_days integer[] not null default '{1,2,3,4,5,6}',
  late_tolerance_minutes integer not null default 10,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_employees_updated before update on public.employees for each row execute function public.set_updated_at();

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  work_date date not null default (now() at time zone 'Africa/Luanda')::date,
  check_in timestamptz,
  check_out timestamptz,
  status public.attendance_status not null default 'presente',
  late_minutes integer not null default 0,
  early_leave_minutes integer not null default 0,
  overtime_minutes integer not null default 0,
  worked_minutes integer not null default 0,
  device_info text,
  notes text,
  recorded_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (employee_id, work_date)
);
create index attendance_date_idx on public.attendance (work_date desc);

create table public.employee_kpis (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  name text not null,
  unit text not null default 'Kz',
  target numeric(14,2) not null default 0,
  actual numeric(14,2) not null default 0,
  period_start date not null,
  period_end date not null,
  auto_metric text,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_kpis_updated before update on public.employee_kpis for each row execute function public.set_updated_at();

create table public.employee_goals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  kind text not null default 'objectivo',
  employee_id uuid references public.employees(id) on delete set null,
  department text,
  start_date date,
  deadline date,
  priority public.priority_level not null default 'media',
  status public.work_status not null default 'nao_iniciada',
  target text,
  actual_result text,
  progress integer not null default 0 check (progress between 0 and 100),
  manager_notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_goals_updated before update on public.employee_goals for each row execute function public.set_updated_at();

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  employee_id uuid references public.employees(id) on delete set null,
  deadline date,
  priority public.priority_level not null default 'media',
  status public.work_status not null default 'nao_iniciada',
  progress integer not null default 0 check (progress between 0 and 100),
  notes text,
  created_by uuid references public.profiles(id),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_tasks_updated before update on public.tasks for each row execute function public.set_updated_at();

create table public.performance_reviews (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  reviewer_id uuid references public.profiles(id),
  period text not null,
  score integer check (score between 1 and 5),
  strengths text,
  improvements text,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- fornecedores e compras
create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  phone text,
  email text,
  location text,
  products_supplied text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create sequence public.po_number_seq;
create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  po_number text not null unique default ('PO-' || lpad(nextval('public.po_number_seq')::text, 5, '0')),
  supplier_id uuid references public.suppliers(id) on delete set null,
  location_id uuid references public.inventory_locations(id),
  status public.po_status not null default 'rascunho',
  expected_date date,
  notes text,
  total numeric(14,2) not null default 0,
  created_by uuid references public.profiles(id),
  received_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_po_updated before update on public.purchase_orders for each row execute function public.set_updated_at();
create table public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  received_quantity integer not null default 0,
  unit_cost numeric(14,2) not null default 0
);

-- ---------------------------------------------------------------- devoluções
create table public.returns (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  order_item_id uuid references public.order_items(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  quantity integer not null default 1,
  reason text not null,
  condition text,
  resolution text,
  refund_amount numeric(14,2),
  status public.return_status not null default 'pendente',
  decision_notes text,
  restocked boolean not null default false,
  restock_location_id uuid references public.inventory_locations(id),
  processed_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_returns_updated before update on public.returns for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- marketing
create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  discount_type public.discount_type not null default 'percentual',
  discount_value numeric(14,2) not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create table public.promotion_products (
  promotion_id uuid not null references public.promotions(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  primary key (promotion_id, product_id)
);
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type public.discount_type not null default 'percentual',
  discount_value numeric(14,2) not null,
  min_order numeric(14,2) not null default 0,
  max_uses integer,
  uses integer not null default 0,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  is_active boolean not null default true,
  customer_id uuid references public.customers(id) on delete cascade,
  source text not null default 'manual',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create index coupons_customer_idx on public.coupons (customer_id);
create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  link_url text,
  cta_label text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- fidelização e roleta
create table public.loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  points integer not null,
  kind text not null,
  reference text,
  description text,
  created_at timestamptz not null default now()
);
create index loyalty_tx_customer_idx on public.loyalty_transactions (customer_id, created_at desc);

create table public.wheel_prizes (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  kind text not null check (kind in ('pontos','cupao_percentual','cupao_fixo','nada')),
  value numeric(14,2) not null default 0,
  weight integer not null default 1 check (weight >= 0),
  color text not null default '#1F5AE0',
  coupon_days integer not null default 14,
  is_active boolean not null default true,
  sort_order integer not null default 0
);
create table public.wheel_spins (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  prize_id uuid references public.wheel_prizes(id) on delete set null,
  prize_label text not null,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index wheel_spins_customer_idx on public.wheel_spins (customer_id, created_at desc);

-- ---------------------------------------------------------------- chat
create table public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  type public.chat_room_type not null,
  name text,
  product_id uuid references public.products(id) on delete cascade,
  customer_profile_id uuid references public.profiles(id) on delete cascade,
  created_by uuid references public.profiles(id),
  last_message_at timestamptz,
  last_message_preview text,
  created_at timestamptz not null default now()
);
create unique index chat_rooms_product_idx on public.chat_rooms (product_id) where type = 'produto';
create unique index chat_rooms_support_idx on public.chat_rooms (customer_profile_id) where type = 'suporte';
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  sender_name text not null default '',
  is_staff boolean not null default false,
  body text,
  audio_url text,
  audio_seconds integer,
  attachment_url text,
  created_at timestamptz not null default now(),
  check (body is not null or audio_url is not null or attachment_url is not null)
);
create index chat_messages_room_idx on public.chat_messages (room_id, created_at);

-- ---------------------------------------------------------------- notificações, auditoria, definições
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  kind text not null default 'geral',
  priority public.notification_priority not null default 'normal',
  link text,
  user_id uuid references public.profiles(id) on delete cascade,
  target_roles public.user_role[],
  created_at timestamptz not null default now()
);
create index notifications_created_idx on public.notifications (created_at desc);
create table public.notification_reads (
  notification_id uuid not null references public.notifications(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (notification_id, user_id)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  user_name text,
  action text not null,
  entity text not null,
  entity_id text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_created_idx on public.audit_logs (created_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity, entity_id);

create table public.store_settings (
  key text primary key,
  value jsonb not null,
  is_public boolean not null default true,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);
