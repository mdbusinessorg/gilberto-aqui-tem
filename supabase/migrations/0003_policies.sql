-- GILBERTO AQUI TEM — segurança (RLS), storage, configuração inicial

do $$ declare t text;
begin
  foreach t in array array['profiles','customers','customer_addresses','brands','categories','products','product_images','inventory_locations','inventory',
    'inventory_movements','orders','order_items','order_status_history','reviews','wishlists','trade_requests','trade_exchanges','employees','attendance',
    'employee_kpis','employee_goals','tasks','performance_reviews','suppliers','purchase_orders','purchase_order_items','returns','promotions','promotion_products',
    'coupons','banners','loyalty_transactions','wheel_prizes','wheel_spins','chat_rooms','chat_messages','notifications','notification_reads','audit_logs','store_settings']
  loop execute format('alter table public.%I enable row level security', t); end loop;
end $$;

-- perfis
create policy "profiles: próprio" on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy "profiles: actualizar próprio" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = public.my_role());
create policy "profiles: admin" on public.profiles for update using (public.is_admin());

-- clientes
create policy "customers: staff" on public.customers for all using (public.is_staff()) with check (public.is_staff());
create policy "customers: próprio" on public.customers for select using (profile_id = auth.uid());
create policy "addresses: staff" on public.customer_addresses for all using (public.is_staff());
create policy "addresses: próprio" on public.customer_addresses for all using (customer_id in (select id from public.customers where profile_id = auth.uid()))
  with check (customer_id in (select id from public.customers where profile_id = auth.uid()));

-- catálogo (leitura pública; escrita staff com papéis de catálogo)
create policy "brands: público" on public.brands for select using (true);
create policy "brands: gestão" on public.brands for all using (public.has_role('super_admin','admin','manager','warehouse','marketing'));
create policy "categories: público" on public.categories for select using (true);
create policy "categories: gestão" on public.categories for all using (public.has_role('super_admin','admin','manager','warehouse','marketing'));
-- produtos: tabela completa apenas para staff (custos/notas internas). Público usa a vista storefront_products.
create policy "products: staff" on public.products for select using (public.is_staff());
create policy "products: gestão" on public.products for insert with check (public.has_role('super_admin','admin','manager','warehouse'));
create policy "products: editar" on public.products for update using (public.has_role('super_admin','admin','manager','warehouse','marketing'));
create policy "products: apagar" on public.products for delete using (public.is_admin());
create policy "images: público" on public.product_images for select using (true);
create policy "images: gestão" on public.product_images for all using (public.has_role('super_admin','admin','manager','warehouse','marketing'));

-- armazém
create policy "locations: público" on public.inventory_locations for select using (true);
create policy "locations: gestão" on public.inventory_locations for all using (public.is_manager());
create policy "inventory: staff" on public.inventory for select using (public.is_staff());
create policy "movements: staff" on public.inventory_movements for select using (public.is_staff());

-- pedidos
create policy "orders: staff" on public.orders for select using (public.is_staff());
create policy "orders: editar" on public.orders for update using (public.has_role('super_admin','admin','manager','sales','customer_service','delivery'));
create policy "orders: próprio" on public.orders for select using (customer_id in (select id from public.customers where profile_id = auth.uid()));
create policy "order_items: staff" on public.order_items for select using (public.is_staff());
create policy "order_items: próprio" on public.order_items for select using (order_id in (select o.id from public.orders o join public.customers c on c.id = o.customer_id where c.profile_id = auth.uid()));
create policy "order_history: staff" on public.order_status_history for select using (public.is_staff());
create policy "order_history: inserir" on public.order_status_history for insert with check (public.is_staff());
create policy "order_history: próprio" on public.order_status_history for select using (order_id in (select o.id from public.orders o join public.customers c on c.id = o.customer_id where c.profile_id = auth.uid()));

-- avaliações
create policy "reviews: público aprovadas" on public.reviews for select using (status = 'aprovada' or profile_id = auth.uid() or public.is_staff());
create policy "reviews: criar" on public.reviews for insert with check (auth.uid() is not null and profile_id = auth.uid());
create policy "reviews: moderar" on public.reviews for update using (public.has_role('super_admin','admin','manager','marketing','customer_service'));
create policy "reviews: apagar" on public.reviews for delete using (public.is_admin());
create policy "wishlist: próprio" on public.wishlists for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- trocas
create policy "trades: criar" on public.trade_requests for insert with check (true);
create policy "trades: próprio" on public.trade_requests for select using (profile_id = auth.uid() or public.is_staff());
create policy "trades: gestão" on public.trade_requests for update using (public.has_role('super_admin','admin','manager','sales','technician'));
create policy "trades: cliente responde" on public.trade_requests for update using (profile_id = auth.uid() and status = 'proposta_enviada') with check (profile_id = auth.uid() and status in ('aceite','rejeitado'));
create policy "exchanges: staff" on public.trade_exchanges for all using (public.has_role('super_admin','admin','manager','sales'));
create policy "exchanges: próprio" on public.trade_exchanges for select using (trade_request_id in (select id from public.trade_requests where profile_id = auth.uid()));

-- funcionários
create policy "employees: gestão" on public.employees for all using (public.is_manager());
create policy "employees: equipa vê lista básica" on public.employees for select using (public.is_staff());
create policy "attendance: gestão" on public.attendance for all using (public.is_manager());
create policy "attendance: próprio" on public.attendance for select using (employee_id in (select id from public.employees where profile_id = auth.uid()));
create policy "kpis: gestão" on public.employee_kpis for all using (public.is_manager());
create policy "kpis: próprio" on public.employee_kpis for select using (employee_id in (select id from public.employees where profile_id = auth.uid()));
create policy "goals: gestão" on public.employee_goals for all using (public.is_manager());
create policy "goals: próprio" on public.employee_goals for select using (employee_id in (select id from public.employees where profile_id = auth.uid()));
create policy "goals: próprio actualiza" on public.employee_goals for update using (employee_id in (select id from public.employees where profile_id = auth.uid()));
create policy "tasks: gestão" on public.tasks for all using (public.is_manager());
create policy "tasks: próprio" on public.tasks for select using (employee_id in (select id from public.employees where profile_id = auth.uid()));
create policy "tasks: próprio actualiza" on public.tasks for update using (employee_id in (select id from public.employees where profile_id = auth.uid()));
create policy "perf: gestão" on public.performance_reviews for all using (public.is_manager());
create policy "perf: próprio" on public.performance_reviews for select using (employee_id in (select id from public.employees where profile_id = auth.uid()));

-- fornecedores e compras
create policy "suppliers: gestão" on public.suppliers for all using (public.has_role('super_admin','admin','manager','warehouse'));
create policy "po: gestão" on public.purchase_orders for all using (public.has_role('super_admin','admin','manager','warehouse'));
create policy "po_items: gestão" on public.purchase_order_items for all using (public.has_role('super_admin','admin','manager','warehouse'));

-- devoluções
create policy "returns: gestão" on public.returns for all using (public.has_role('super_admin','admin','manager','customer_service','sales'));
create policy "returns: próprio" on public.returns for select using (customer_id in (select id from public.customers where profile_id = auth.uid()));
create policy "returns: cliente pede" on public.returns for insert with check (auth.uid() is not null and order_id in (select o.id from public.orders o join public.customers c on c.id = o.customer_id where c.profile_id = auth.uid()));

-- marketing
create policy "promotions: público" on public.promotions for select using (is_active or public.is_staff());
create policy "promotions: gestão" on public.promotions for all using (public.has_role('super_admin','admin','manager','marketing'));
create policy "promo_products: público" on public.promotion_products for select using (true);
create policy "promo_products: gestão" on public.promotion_products for all using (public.has_role('super_admin','admin','manager','marketing'));
create policy "coupons: gestão" on public.coupons for all using (public.has_role('super_admin','admin','manager','marketing'));
create policy "coupons: próprio" on public.coupons for select using (customer_id in (select id from public.customers where profile_id = auth.uid()));
create policy "banners: público" on public.banners for select using (is_active or public.is_staff());
create policy "banners: gestão" on public.banners for all using (public.has_role('super_admin','admin','manager','marketing'));

-- fidelização
create policy "loyalty: staff" on public.loyalty_transactions for select using (public.is_staff());
create policy "loyalty: próprio" on public.loyalty_transactions for select using (customer_id in (select id from public.customers where profile_id = auth.uid()));
create policy "prizes: público" on public.wheel_prizes for select using (is_active or public.is_staff());
create policy "prizes: gestão" on public.wheel_prizes for all using (public.has_role('super_admin','admin','manager','marketing'));
create policy "spins: staff" on public.wheel_spins for select using (public.is_staff());
create policy "spins: próprio" on public.wheel_spins for select using (profile_id = auth.uid());

-- chat
create policy "rooms: ver" on public.chat_rooms for select using (
  auth.uid() is not null and (
    type = 'produto' or (type = 'equipa' and public.is_staff()) or (type = 'suporte' and (customer_profile_id = auth.uid() or public.is_staff()))
  ));
create policy "messages: ver" on public.chat_messages for select using (
  room_id in (select id from public.chat_rooms));
create policy "messages: enviar" on public.chat_messages for insert with check (
  auth.uid() is not null and sender_id = auth.uid() and room_id in (select id from public.chat_rooms));
create policy "messages: apagar" on public.chat_messages for delete using (sender_id = auth.uid() or public.is_manager());

-- notificações
create policy "notifications: destinatário" on public.notifications for select using (
  public.is_staff() and (user_id = auth.uid() or (user_id is null and (target_roles is null or public.my_role() = any(target_roles)))));
create policy "notifications: criar" on public.notifications for insert with check (public.is_manager());
create policy "notifications: apagar" on public.notifications for delete using (public.is_admin());
create policy "reads: próprio" on public.notification_reads for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- auditoria e definições
create policy "audit: admin" on public.audit_logs for select using (public.is_manager());
create policy "settings: ler" on public.store_settings for select using (is_public or public.is_staff());
create policy "settings: gestão" on public.store_settings for all using (public.is_admin());

-- realtime
alter publication supabase_realtime add table public.chat_messages, public.notifications, public.chat_rooms;

-- ---------------------------------------------------------------- storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('products', 'products', true, 8388608, array['image/jpeg','image/png','image/webp','image/avif','video/mp4']),
  ('reviews', 'reviews', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('trade-ins', 'trade-ins', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('chat', 'chat', true, 10485760, array['audio/webm','audio/ogg','audio/mp4','audio/mpeg','audio/wav','image/jpeg','image/png','image/webp']),
  ('brand', 'brand', true, 5242880, array['image/jpeg','image/png','image/webp','image/svg+xml'])
on conflict (id) do nothing;

create policy "storage público ler" on storage.objects for select using (bucket_id in ('products','reviews','trade-ins','chat','brand'));
create policy "storage staff escreve" on storage.objects for insert with check (bucket_id in ('products','brand') and public.is_staff());
create policy "storage staff actualiza" on storage.objects for update using (bucket_id in ('products','brand') and public.is_staff());
create policy "storage staff apaga" on storage.objects for delete using (bucket_id in ('products','brand','reviews','trade-ins','chat') and public.is_staff());
create policy "storage cliente envia" on storage.objects for insert with check (bucket_id in ('reviews','chat') and auth.uid() is not null);
create policy "storage troca envia" on storage.objects for insert with check (bucket_id = 'trade-ins');

-- ---------------------------------------------------------------- configuração inicial (estrutura, não dados de negócio)
insert into public.inventory_locations (name, slug, kind, sells, sort_order) values
  ('Loja Principal', 'loja-principal', 'loja', true, 1),
  ('Armazém', 'armazem', 'armazem', true, 2),
  ('Exposição', 'exposicao', 'loja', true, 3),
  ('Reparação', 'reparacao', 'servico', false, 4),
  ('Reservado', 'reservado', 'reserva', false, 5),
  ('Vendido / Aguarda entrega', 'aguarda-entrega', 'expedicao', false, 6);

insert into public.categories (name, slug, sort_order) values
  ('iPhone', 'iphone', 1), ('Samsung', 'samsung', 2), ('Android', 'android', 3), ('Laptops', 'laptops', 4), ('MacBook', 'macbook', 5),
  ('PlayStation', 'playstation', 6), ('AirPods', 'airpods', 7), ('Apple Watch', 'apple-watch', 8), ('Acessórios', 'acessorios', 9), ('Outros gadgets', 'outros', 10);

insert into public.brands (name, slug, sort_order) values
  ('Apple', 'apple', 1), ('Samsung', 'samsung', 2), ('Sony', 'sony', 3), ('Xiaomi', 'xiaomi', 4), ('Huawei', 'huawei', 5), ('HP', 'hp', 6), ('Dell', 'dell', 7), ('Lenovo', 'lenovo', 8), ('JBL', 'jbl', 9), ('Tecno', 'tecno', 10), ('Infinix', 'infinix', 11);

insert into public.store_settings (key, value, is_public) values
  ('store', '{"name":"Gilberto Aqui Tem","tagline":"Telemóvel & Acessórios","whatsapp":"+244926719714","instagram":"_Gilberto_Aqui_Tem","facebook":"Gilberto Aqui Tem","email":"","address":"Luanda, Angola","hours":"Segunda a Sábado, 08:30 – 18:00"}', true),
  ('checkout', '{"delivery_fee":0,"payment_methods":["Transferência bancária","Multicaixa Express","Dinheiro na entrega"],"guest_checkout":true}', true),
  ('loyalty', '{"enabled":true,"points_per_1000":1,"kz_per_point":0,"min_redeem_points":100,"silver_threshold":500000,"gold_threshold":2000000,"vip_threshold":5000000,"birthday_coupon_percent":0}', true),
  ('wheel', '{"enabled":false,"cooldown_hours":24,"requires_purchase":false}', true),
  ('dashboard', '{"cards":["revenue_today","revenue_month","orders_today","orders_pending","products_in_stock","low_stock","out_of_stock","customers","employees_present","employees_late","trades_pending","reviews_pending","tasks_pending"]}', false),
  ('attendance', '{"default_start":"08:30","default_end":"18:00","tolerance_minutes":10}', false);

insert into public.wheel_prizes (label, kind, value, weight, color, sort_order) values
  ('5% de desconto', 'cupao_percentual', 5, 30, '#1F5AE0', 1),
  ('10% de desconto', 'cupao_percentual', 10, 15, '#0D2A70', 2),
  ('50 pontos', 'pontos', 50, 25, '#4A7EF5', 3),
  ('100 pontos', 'pontos', 100, 10, '#103693', 4),
  ('5.000 Kz de desconto', 'cupao_fixo', 5000, 5, '#1546B8', 5),
  ('Tenta outra vez', 'nada', 0, 15, '#9CA3AF', 6);
