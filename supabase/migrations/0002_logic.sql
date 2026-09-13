-- GILBERTO AQUI TEM — lógica de negócio (funções, triggers)

-- ---------------------------------------------------------------- auditoria genérica
create or replace function public.audit_trigger() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_old jsonb; v_new jsonb; v_id text; v_name text;
begin
  if tg_op = 'INSERT' then v_new := to_jsonb(new); v_id := (v_new->>'id');
  elsif tg_op = 'UPDATE' then
    v_old := to_jsonb(old); v_new := to_jsonb(new); v_id := (v_new->>'id');
    -- ignora alterações puramente técnicas
    if (v_old - 'updated_at') = (v_new - 'updated_at') then return null; end if;
  else v_old := to_jsonb(old); v_id := (v_old->>'id');
  end if;
  select full_name into v_name from public.profiles where id = auth.uid();
  insert into public.audit_logs (user_id, user_name, action, entity, entity_id, old_data, new_data)
  values (auth.uid(), v_name, lower(tg_op), tg_table_name, v_id, v_old, v_new);
  return null;
end $$;

do $$ declare t text;
begin
  foreach t in array array['products','orders','inventory_movements','trade_requests','employees','employee_kpis',
    'employee_goals','store_settings','promotions','coupons','purchase_orders','returns','reviews','profiles','wheel_prizes']
  loop
    execute format('create trigger trg_audit_%1$s after insert or update or delete on public.%1$s for each row execute function public.audit_trigger()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------- notificações internas
create or replace function public.notify_staff(p_title text, p_body text, p_kind text, p_priority public.notification_priority, p_link text, p_roles public.user_role[] default null)
returns void language sql security definer set search_path = public as $$
  insert into public.notifications (title, body, kind, priority, link, target_roles) values (p_title, p_body, p_kind, p_priority, p_link, p_roles)
$$;

-- ---------------------------------------------------------------- stock
create or replace function public.apply_inventory_movement(
  p_product_id uuid, p_type public.movement_type, p_quantity integer,
  p_location_id uuid default null, p_to_location_id uuid default null,
  p_reason text default null, p_reference_type text default null, p_reference_id uuid default null, p_notes text default null,
  p_user_id uuid default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_loc uuid; v_id uuid; v_current integer; v_user uuid; v_prod record;
begin
  if p_quantity is null or p_quantity <= 0 then raise exception 'Quantidade inválida'; end if;
  v_user := coalesce(p_user_id, auth.uid());
  v_loc := coalesce(p_location_id, (select id from public.inventory_locations where slug = 'loja-principal'));
  if v_loc is null then raise exception 'Localização não encontrada'; end if;

  if p_type in ('entrada','devolucao') then
    insert into public.inventory (product_id, location_id, quantity) values (p_product_id, v_loc, p_quantity)
    on conflict (product_id, location_id) do update set quantity = public.inventory.quantity + excluded.quantity, updated_at = now();
  elsif p_type in ('saida','venda','troca','danificado','perdido') then
    select quantity into v_current from public.inventory where product_id = p_product_id and location_id = v_loc for update;
    if coalesce(v_current,0) < p_quantity then raise exception 'Stock insuficiente na localização (disponível: %)', coalesce(v_current,0); end if;
    update public.inventory set quantity = quantity - p_quantity, updated_at = now() where product_id = p_product_id and location_id = v_loc;
  elsif p_type = 'transferencia' then
    if p_to_location_id is null or p_to_location_id = v_loc then raise exception 'Localização de destino inválida'; end if;
    select quantity into v_current from public.inventory where product_id = p_product_id and location_id = v_loc for update;
    if coalesce(v_current,0) < p_quantity then raise exception 'Stock insuficiente para transferir (disponível: %)', coalesce(v_current,0); end if;
    update public.inventory set quantity = quantity - p_quantity, updated_at = now() where product_id = p_product_id and location_id = v_loc;
    insert into public.inventory (product_id, location_id, quantity) values (p_product_id, p_to_location_id, p_quantity)
    on conflict (product_id, location_id) do update set quantity = public.inventory.quantity + excluded.quantity, updated_at = now();
  elsif p_type = 'ajuste' then
    -- ajuste define a quantidade absoluta na localização
    insert into public.inventory (product_id, location_id, quantity) values (p_product_id, v_loc, p_quantity)
    on conflict (product_id, location_id) do update set quantity = excluded.quantity, updated_at = now();
  end if;

  insert into public.inventory_movements (product_id, location_id, to_location_id, type, quantity, reason, reference_type, reference_id, notes, user_id)
  values (p_product_id, v_loc, p_to_location_id, p_type, p_quantity, p_reason, p_reference_type, p_reference_id, p_notes, v_user)
  returning id into v_id;

  select name, stock_total, min_stock into v_prod from public.products where id = p_product_id;
  if v_prod.stock_total = 0 then
    perform public.notify_staff('Sem stock: ' || v_prod.name, 'O produto ficou sem stock disponível.', 'stock', 'alta', '/admin/armazem', array['super_admin','admin','manager','warehouse']::public.user_role[]);
  elsif v_prod.stock_total <= v_prod.min_stock then
    perform public.notify_staff('Stock baixo: ' || v_prod.name, format('Restam %s unidades (mínimo %s).', v_prod.stock_total, v_prod.min_stock), 'stock', 'normal', '/admin/armazem', array['super_admin','admin','manager','warehouse']::public.user_role[]);
  end if;
  return v_id;
end $$;

create or replace function public.staff_apply_movement(
  p_product_id uuid, p_type public.movement_type, p_quantity integer,
  p_location_id uuid default null, p_to_location_id uuid default null,
  p_reason text default null, p_notes text default null
) returns uuid language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role('super_admin','admin','manager','warehouse','technician') then raise exception 'Sem permissão'; end if;
  return public.apply_inventory_movement(p_product_id, p_type, p_quantity, p_location_id, p_to_location_id, p_reason, 'manual', null, p_notes, auth.uid());
end $$;

-- ---------------------------------------------------------------- preços e cupões
create or replace function public.effective_price(p public.products) returns numeric language sql stable as $$
  select case when p.is_promo and p.promo_price is not null and p.promo_price < p.price then p.promo_price else p.price end
$$;

create or replace function public.validate_coupon(p_code text, p_subtotal numeric, p_customer_id uuid default null)
returns table (valid boolean, message text, discount numeric, coupon_id uuid)
language plpgsql security definer set search_path = public as $$
declare c record;
begin
  select * into c from public.coupons where upper(code) = upper(trim(p_code)) and is_active;
  if c is null then return query select false, 'Cupão não encontrado', 0::numeric, null::uuid; return; end if;
  if c.starts_at > now() then return query select false, 'Cupão ainda não está activo', 0::numeric, null::uuid; return; end if;
  if c.expires_at is not null and c.expires_at < now() then return query select false, 'Cupão expirado', 0::numeric, null::uuid; return; end if;
  if c.max_uses is not null and c.uses >= c.max_uses then return query select false, 'Cupão esgotado', 0::numeric, null::uuid; return; end if;
  if c.min_order > p_subtotal then return query select false, format('Compra mínima de %s Kz', c.min_order), 0::numeric, null::uuid; return; end if;
  if c.customer_id is not null and (p_customer_id is null or c.customer_id <> p_customer_id) then return query select false, 'Cupão pessoal de outro cliente', 0::numeric, null::uuid; return; end if;
  return query select true, 'Cupão aplicado', least(p_subtotal, case when c.discount_type = 'percentual' then round(p_subtotal * c.discount_value / 100, 2) else c.discount_value end), c.id;
end $$;

-- ---------------------------------------------------------------- clientes
create or replace function public.upsert_customer(p_profile_id uuid, p_name text, p_phone text, p_email text, p_location text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_phone text;
begin
  v_phone := nullif(regexp_replace(coalesce(p_phone,''), '[^0-9+]', '', 'g'), '');
  if p_profile_id is not null then
    select id into v_id from public.customers where profile_id = p_profile_id;
    if v_id is null then
      -- liga um cliente convidado existente com o mesmo telefone
      select id into v_id from public.customers where profile_id is null and phone = v_phone limit 1;
      if v_id is not null then
        update public.customers set profile_id = p_profile_id, email = coalesce(email, p_email), name = coalesce(nullif(p_name,''), name) where id = v_id;
      else
        insert into public.customers (profile_id, name, phone, whatsapp, email, location) values (p_profile_id, coalesce(nullif(p_name,''),'Cliente'), v_phone, v_phone, p_email, p_location) returning id into v_id;
      end if;
    else
      update public.customers set phone = coalesce(v_phone, phone), whatsapp = coalesce(v_phone, whatsapp), email = coalesce(p_email, email), location = coalesce(p_location, location), name = coalesce(nullif(p_name,''), name) where id = v_id;
    end if;
    return v_id;
  end if;
  if v_phone is null then raise exception 'Telefone obrigatório'; end if;
  select id into v_id from public.customers where phone = v_phone limit 1;
  if v_id is null then
    insert into public.customers (name, phone, whatsapp, email, location) values (coalesce(nullif(p_name,''),'Cliente'), v_phone, v_phone, p_email, p_location) returning id into v_id;
  else
    update public.customers set email = coalesce(p_email, email), location = coalesce(p_location, location) where id = v_id;
  end if;
  return v_id;
end $$;

create or replace function public.ensure_my_customer() returns uuid language plpgsql security definer set search_path = public as $$
declare p record;
begin
  if auth.uid() is null then raise exception 'Autenticação necessária'; end if;
  select * into p from public.profiles where id = auth.uid();
  return public.upsert_customer(p.id, p.full_name, p.phone, p.email);
end $$;

-- ---------------------------------------------------------------- pedidos
create or replace function public.next_order_number() returns text language sql as $$
  select 'GAT-' || to_char(now() at time zone 'Africa/Luanda', 'YYMMDD') || '-' || lpad(nextval('public.order_number_seq')::text, 4, '0')
$$;

-- payload: { name, phone, email, delivery_method, address, notes, coupon, channel, items:[{product_id, quantity}] }
create or replace function public.place_order(payload jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_item jsonb; v_prod public.products; v_qty integer; v_price numeric; v_subtotal numeric := 0; v_discount numeric := 0;
  v_order_id uuid; v_number text; v_customer uuid; v_profile uuid := auth.uid(); v_coupon record; v_fee numeric := 0;
  v_channel public.order_channel := coalesce((payload->>'channel')::public.order_channel, 'website');
  v_delivery public.delivery_method := coalesce((payload->>'delivery_method')::public.delivery_method, 'levantamento');
  v_items jsonb := coalesce(payload->'items', '[]'::jsonb);
begin
  if jsonb_array_length(v_items) = 0 then raise exception 'O carrinho está vazio'; end if;
  if coalesce(trim(payload->>'name'),'') = '' then raise exception 'Nome obrigatório'; end if;
  if coalesce(trim(payload->>'phone'),'') = '' then raise exception 'Telefone obrigatório'; end if;
  if v_channel <> 'website' and not public.is_staff() then raise exception 'Canal inválido'; end if;

  v_customer := public.upsert_customer(v_profile, payload->>'name', payload->>'phone', payload->>'email', payload->>'address');

  for v_item in select * from jsonb_array_elements(v_items) loop
    v_qty := coalesce((v_item->>'quantity')::integer, 1);
    if v_qty <= 0 then raise exception 'Quantidade inválida'; end if;
    select * into v_prod from public.products where id = (v_item->>'product_id')::uuid and is_active;
    if v_prod is null then raise exception 'Produto indisponível'; end if;
    if v_prod.stock_total < v_qty then raise exception 'Stock insuficiente para %', v_prod.name; end if;
    v_subtotal := v_subtotal + public.effective_price(v_prod) * v_qty;
  end loop;

  if v_delivery = 'entrega' then
    v_fee := coalesce((select (value->>'delivery_fee')::numeric from public.store_settings where key = 'checkout'), 0);
  end if;

  if coalesce(trim(payload->>'coupon'),'') <> '' then
    select * into v_coupon from public.validate_coupon(payload->>'coupon', v_subtotal, v_customer);
    if not v_coupon.valid then raise exception '%', v_coupon.message; end if;
    v_discount := v_coupon.discount;
    update public.coupons set uses = uses + 1 where id = v_coupon.coupon_id;
  end if;

  v_number := public.next_order_number();
  insert into public.orders (order_number, customer_id, customer_name, customer_phone, customer_email, channel, delivery_method, delivery_address,
    delivery_fee, subtotal, discount, total, coupon_code, notes, seller_id, payment_method)
  values (v_number, v_customer, trim(payload->>'name'), trim(payload->>'phone'), nullif(trim(payload->>'email'),''), v_channel, v_delivery, payload->>'address',
    v_fee, v_subtotal, v_discount, v_subtotal - v_discount + v_fee, upper(nullif(trim(payload->>'coupon'),'')), payload->>'notes',
    case when public.is_staff() then auth.uid() else null end, payload->>'payment_method')
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(v_items) loop
    v_qty := coalesce((v_item->>'quantity')::integer, 1);
    select * into v_prod from public.products where id = (v_item->>'product_id')::uuid;
    v_price := public.effective_price(v_prod);
    insert into public.order_items (order_id, product_id, product_name, sku, quantity, unit_price, unit_cost, total)
    values (v_order_id, v_prod.id, v_prod.name, v_prod.sku, v_qty, v_price, v_prod.cost_price, v_price * v_qty);
  end loop;

  insert into public.order_status_history (order_id, status, note, user_id) values (v_order_id, 'pendente', 'Pedido criado (' || v_channel::text || ')', v_profile);
  perform public.notify_staff('Novo pedido ' || v_number, format('%s — %s Kz', trim(payload->>'name'), to_char(v_subtotal - v_discount + v_fee, 'FM999G999G999G990')), 'pedido', 'alta', '/admin/pedidos/' || v_order_id,
    array['super_admin','admin','manager','sales','customer_service']::public.user_role[]);

  return jsonb_build_object('order_id', v_order_id, 'order_number', v_number, 'total', v_subtotal - v_discount + v_fee);
end $$;

create or replace function public.lookup_order(p_number text, p_phone text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare o record; items jsonb; hist jsonb;
begin
  select * into o from public.orders where upper(order_number) = upper(trim(p_number))
    and regexp_replace(customer_phone, '[^0-9]', '', 'g') like '%' || right(regexp_replace(p_phone, '[^0-9]', '', 'g'), 9);
  if o is null then return null; end if;
  select coalesce(jsonb_agg(jsonb_build_object('name', product_name, 'quantity', quantity, 'unit_price', unit_price, 'total', total)), '[]') into items from public.order_items where order_id = o.id;
  select coalesce(jsonb_agg(jsonb_build_object('status', status, 'note', note, 'at', created_at) order by created_at), '[]') into hist from public.order_status_history where order_id = o.id;
  return jsonb_build_object('order_number', o.order_number, 'status', o.status, 'payment_status', o.payment_status, 'total', o.total, 'subtotal', o.subtotal,
    'discount', o.discount, 'delivery_fee', o.delivery_fee, 'delivery_method', o.delivery_method, 'created_at', o.created_at, 'customer_name', o.customer_name, 'items', items, 'history', hist);
end $$;

-- estado do pedido: stock, pontos, totais do cliente
create or replace function public.on_order_status_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare it record; v_loc uuid; v_points integer; v_rate numeric; v_tier public.loyalty_tier; v_cfg jsonb;
begin
  if new.status = old.status then return new; end if;
  insert into public.order_status_history (order_id, status, user_id) values (new.id, new.status, auth.uid());
  v_loc := (select id from public.inventory_locations where slug = 'loja-principal');

  -- deduz stock na confirmação/pagamento
  if new.status in ('confirmado','pago','em_preparacao','enviado','entregue','concluido') and not old.stock_deducted then
    for it in select * from public.order_items where order_id = new.id and product_id is not null loop
      perform public.apply_inventory_movement(it.product_id, 'venda', it.quantity, v_loc, null, 'Venda ' || new.order_number, 'order', new.id, null, auth.uid());
      update public.products set sold_count = sold_count + it.quantity where id = it.product_id;
    end loop;
    new.stock_deducted := true;
  end if;

  -- devolve stock em cancelamento/devolução total
  if new.status in ('cancelado') and old.stock_deducted then
    for it in select * from public.order_items where order_id = new.id and product_id is not null loop
      perform public.apply_inventory_movement(it.product_id, 'devolucao', it.quantity, v_loc, null, 'Cancelamento ' || new.order_number, 'order', new.id, null, auth.uid());
      update public.products set sold_count = greatest(0, sold_count - it.quantity) where id = it.product_id;
    end loop;
    new.stock_deducted := false;
  end if;

  if new.status in ('pago','entregue','concluido') and new.payment_status = 'pendente' then new.payment_status := 'pago'; end if;

  -- pontos e totais do cliente
  if new.status in ('entregue','concluido') and not old.points_awarded and new.customer_id is not null then
    select value into v_cfg from public.store_settings where key = 'loyalty';
    v_rate := coalesce((v_cfg->>'points_per_1000')::numeric, 0);
    v_points := floor(new.total / 1000 * v_rate);
    update public.customers set total_spent = total_spent + new.total, orders_count = orders_count + 1, last_order_at = now(),
      loyalty_points = loyalty_points + v_points where id = new.customer_id;
    if v_points > 0 then
      insert into public.loyalty_transactions (customer_id, points, kind, reference, description) values (new.customer_id, v_points, 'compra', new.order_number, 'Pontos da compra ' || new.order_number);
    end if;
    -- nível
    update public.customers c set tier = case
        when c.total_spent >= coalesce((v_cfg->>'vip_threshold')::numeric, 1e15) then 'vip'
        when c.total_spent >= coalesce((v_cfg->>'gold_threshold')::numeric, 1e15) then 'gold'
        when c.total_spent >= coalesce((v_cfg->>'silver_threshold')::numeric, 1e15) then 'silver'
        else 'regular' end::public.loyalty_tier
      where c.id = new.customer_id;
    new.points_awarded := true;
  end if;
  return new;
end $$;
create trigger trg_order_status before update on public.orders for each row execute function public.on_order_status_change();

-- venda manual (loja/whatsapp) criada por staff usa place_order com channel

-- ---------------------------------------------------------------- avaliações
create or replace function public.on_review_insert() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.profile_id is not null then
    select id into new.customer_id from public.customers where profile_id = new.profile_id;
    if exists (select 1 from public.orders o join public.order_items i on i.order_id = o.id
      where o.customer_id = new.customer_id and i.product_id = new.product_id and o.status in ('entregue','concluido')) then
      new.is_verified := true;
    end if;
  end if;
  perform public.notify_staff('Nova avaliação', format('%s avaliou com %s estrelas', new.author_name, new.rating), 'avaliacao', 'normal', '/admin/avaliacoes',
    array['super_admin','admin','manager','marketing','customer_service']::public.user_role[]);
  return new;
end $$;
create trigger trg_review_insert before insert on public.reviews for each row execute function public.on_review_insert();

create or replace function public.refresh_product_rating() returns trigger language plpgsql security definer set search_path = public as $$
declare pid uuid;
begin
  pid := coalesce(new.product_id, old.product_id);
  update public.products set rating_avg = coalesce((select round(avg(rating)::numeric, 2) from public.reviews where product_id = pid and status = 'aprovada'), 0),
    rating_count = (select count(*) from public.reviews where product_id = pid and status = 'aprovada') where id = pid;
  return null;
end $$;
create trigger trg_review_rating after insert or update or delete on public.reviews for each row execute function public.refresh_product_rating();

-- ---------------------------------------------------------------- trocas
create or replace function public.on_trade_insert() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.profile_id is null and auth.uid() is not null then new.profile_id := auth.uid(); end if;
  new.customer_id := public.upsert_customer(new.profile_id, new.name, new.phone, null);
  perform public.notify_staff('Novo pedido de troca', format('%s — %s %s', new.name, new.brand, new.model), 'troca', 'alta', '/admin/trocas',
    array['super_admin','admin','manager','sales','technician']::public.user_role[]);
  return new;
end $$;
create trigger trg_trade_insert before insert on public.trade_requests for each row execute function public.on_trade_insert();

-- ---------------------------------------------------------------- pontualidade
create or replace function public.clock_in(p_device text default null) returns public.attendance
language plpgsql security definer set search_path = public as $$
declare e public.employees; v_now timestamptz := now(); v_local timestamp; v_late integer := 0; v_row public.attendance; v_status public.attendance_status;
begin
  select * into e from public.employees where profile_id = auth.uid() and status = 'activo';
  if e is null then raise exception 'Não existe ficha de funcionário activa para este utilizador'; end if;
  v_local := v_now at time zone 'Africa/Luanda';
  v_late := greatest(0, (extract(epoch from (v_local::time - e.schedule_start)) / 60)::integer - e.late_tolerance_minutes);
  v_status := case when v_late > 0 then 'atrasado' else 'presente' end;
  insert into public.attendance (employee_id, work_date, check_in, status, late_minutes, device_info, recorded_by)
  values (e.id, v_local::date, v_now, v_status, v_late, p_device, auth.uid())
  on conflict (employee_id, work_date) do update set check_in = coalesce(public.attendance.check_in, excluded.check_in)
  returning * into v_row;
  if v_late > 0 then
    perform public.notify_staff('Atraso: ' || e.full_name, format('Entrou com %s minutos de atraso.', v_late), 'pontualidade', 'baixa', '/admin/pontualidade',
      array['super_admin','admin','manager']::public.user_role[]);
  end if;
  return v_row;
end $$;

create or replace function public.clock_out() returns public.attendance
language plpgsql security definer set search_path = public as $$
declare e public.employees; v_row public.attendance; v_local timestamp := now() at time zone 'Africa/Luanda'; v_early integer; v_over integer;
begin
  select * into e from public.employees where profile_id = auth.uid() and status = 'activo';
  if e is null then raise exception 'Sem ficha de funcionário'; end if;
  select * into v_row from public.attendance where employee_id = e.id and work_date = v_local::date;
  if v_row is null or v_row.check_in is null then raise exception 'Ainda não registou entrada hoje'; end if;
  if v_row.check_out is not null then raise exception 'Saída já registada'; end if;
  v_early := greatest(0, (extract(epoch from (e.schedule_end - v_local::time)) / 60)::integer);
  v_over := greatest(0, (extract(epoch from (v_local::time - e.schedule_end)) / 60)::integer);
  update public.attendance set check_out = now(), early_leave_minutes = v_early, overtime_minutes = v_over,
    worked_minutes = (extract(epoch from (now() - check_in)) / 60)::integer
  where id = v_row.id returning * into v_row;
  return v_row;
end $$;

-- ---------------------------------------------------------------- compras
create or replace function public.receive_purchase_order(p_po_id uuid, p_items jsonb default null)
returns void language plpgsql security definer set search_path = public as $$
declare po public.purchase_orders; it record; v_qty integer; v_all boolean := true; v_loc uuid;
begin
  if not public.has_role('super_admin','admin','manager','warehouse') then raise exception 'Sem permissão'; end if;
  select * into po from public.purchase_orders where id = p_po_id for update;
  if po is null then raise exception 'Ordem de compra não encontrada'; end if;
  if po.status in ('recebido','cancelado') then raise exception 'Ordem já fechada'; end if;
  v_loc := coalesce(po.location_id, (select id from public.inventory_locations where slug = 'armazem'), (select id from public.inventory_locations where slug = 'loja-principal'));
  for it in select * from public.purchase_order_items where purchase_order_id = p_po_id loop
    v_qty := coalesce((select (e->>'received')::integer from jsonb_array_elements(coalesce(p_items,'[]'::jsonb)) e where (e->>'item_id')::uuid = it.id), it.quantity - it.received_quantity);
    v_qty := least(v_qty, it.quantity - it.received_quantity);
    if v_qty > 0 then
      perform public.apply_inventory_movement(it.product_id, 'entrada', v_qty, v_loc, null, 'Recepção ' || po.po_number, 'purchase_order', po.id, null, auth.uid());
      update public.purchase_order_items set received_quantity = received_quantity + v_qty where id = it.id;
      update public.products set cost_price = it.unit_cost where id = it.product_id and it.unit_cost > 0;
    end if;
    if it.received_quantity + v_qty < it.quantity then v_all := false; end if;
  end loop;
  update public.purchase_orders set status = case when v_all then 'recebido' else 'parcialmente_recebido' end, received_at = case when v_all then now() else received_at end where id = p_po_id;
  perform public.notify_staff('Compra recebida ' || po.po_number, case when v_all then 'Totalmente recebida.' else 'Recepção parcial.' end, 'compra', 'normal', '/admin/compras',
    array['super_admin','admin','manager','warehouse']::public.user_role[]);
end $$;

-- ---------------------------------------------------------------- devoluções
create or replace function public.process_return(p_return_id uuid, p_status public.return_status, p_resolution text, p_refund numeric, p_restock boolean, p_location_id uuid, p_notes text)
returns void language plpgsql security definer set search_path = public as $$
declare r public.returns;
begin
  if not public.has_role('super_admin','admin','manager','customer_service') then raise exception 'Sem permissão'; end if;
  select * into r from public.returns where id = p_return_id for update;
  if r is null then raise exception 'Devolução não encontrada'; end if;
  update public.returns set status = p_status, resolution = p_resolution, refund_amount = p_refund, decision_notes = p_notes, processed_by = auth.uid() where id = p_return_id;
  if p_status in ('aprovada','concluida') and p_restock and not r.restocked and r.product_id is not null then
    perform public.apply_inventory_movement(r.product_id, 'devolucao', r.quantity, p_location_id, null, 'Devolução aprovada', 'return', r.id, p_notes, auth.uid());
    update public.returns set restocked = true, restock_location_id = p_location_id where id = p_return_id;
  end if;
  if p_status in ('aprovada','concluida') then
    update public.orders set status = case when p_resolution = 'reembolso' then 'devolvido' else status end, payment_status = case when p_resolution = 'reembolso' then 'reembolsado' else payment_status end where id = r.order_id;
  end if;
end $$;

-- ---------------------------------------------------------------- roleta e pontos
create or replace function public.spin_wheel() returns jsonb language plpgsql security definer set search_path = public as $$
declare v_customer uuid; v_cfg jsonb; v_cooldown integer; v_last timestamptz; v_total integer; v_rand integer; v_acc integer := 0; p record; v_code text; v_result jsonb;
begin
  if auth.uid() is null then raise exception 'Inicie sessão para girar a roleta'; end if;
  select value into v_cfg from public.store_settings where key = 'wheel';
  if not coalesce((v_cfg->>'enabled')::boolean, false) then raise exception 'A roleta está desactivada de momento'; end if;
  v_customer := public.ensure_my_customer();
  v_cooldown := coalesce((v_cfg->>'cooldown_hours')::integer, 24);
  select max(created_at) into v_last from public.wheel_spins where customer_id = v_customer;
  if v_last is not null and v_last + make_interval(hours => v_cooldown) > now() then
    raise exception 'Já girou a roleta. Volte em %', to_char(v_last + make_interval(hours => v_cooldown), 'DD/MM HH24:MI');
  end if;
  if coalesce((v_cfg->>'requires_purchase')::boolean, false) and not exists (select 1 from public.orders where customer_id = v_customer and status in ('entregue','concluido')) then
    raise exception 'A roleta é exclusiva para clientes com compras concluídas';
  end if;
  select coalesce(sum(weight),0) into v_total from public.wheel_prizes where is_active and weight > 0;
  if v_total = 0 then raise exception 'Sem prémios configurados'; end if;
  v_rand := floor(random() * v_total)::integer;
  for p in select * from public.wheel_prizes where is_active and weight > 0 order by sort_order, id loop
    v_acc := v_acc + p.weight;
    if v_rand < v_acc then exit; end if;
  end loop;

  if p.kind = 'pontos' then
    update public.customers set loyalty_points = loyalty_points + p.value::integer where id = v_customer;
    insert into public.loyalty_transactions (customer_id, points, kind, description) values (v_customer, p.value::integer, 'roleta', 'Prémio da roleta: ' || p.label);
    v_result := jsonb_build_object('kind', p.kind, 'points', p.value);
  elsif p.kind in ('cupao_percentual','cupao_fixo') then
    v_code := 'ROLETA-' || upper(substr(md5(random()::text), 1, 6));
    insert into public.coupons (code, description, discount_type, discount_value, expires_at, customer_id, source, max_uses)
    values (v_code, 'Prémio da roleta: ' || p.label, case when p.kind = 'cupao_percentual' then 'percentual' else 'fixo' end, p.value, now() + make_interval(days => p.coupon_days), v_customer, 'roleta', 1);
    v_result := jsonb_build_object('kind', p.kind, 'code', v_code, 'value', p.value, 'expires_days', p.coupon_days);
  else
    v_result := jsonb_build_object('kind', 'nada');
  end if;
  insert into public.wheel_spins (customer_id, profile_id, prize_id, prize_label, result) values (v_customer, auth.uid(), p.id, p.label, v_result);
  return v_result || jsonb_build_object('prize_id', p.id, 'label', p.label);
end $$;

create or replace function public.redeem_points(p_points integer) returns jsonb language plpgsql security definer set search_path = public as $$
declare v_customer uuid; v_cfg jsonb; v_rate numeric; v_min integer; c public.customers; v_code text; v_value numeric;
begin
  v_customer := public.ensure_my_customer();
  select value into v_cfg from public.store_settings where key = 'loyalty';
  v_rate := coalesce((v_cfg->>'kz_per_point')::numeric, 0);
  v_min := coalesce((v_cfg->>'min_redeem_points')::integer, 100);
  if v_rate <= 0 then raise exception 'O resgate de pontos não está activo'; end if;
  if p_points < v_min then raise exception 'Mínimo de % pontos para resgatar', v_min; end if;
  select * into c from public.customers where id = v_customer for update;
  if c.loyalty_points < p_points then raise exception 'Pontos insuficientes'; end if;
  v_value := round(p_points * v_rate, 2);
  v_code := 'PONTOS-' || upper(substr(md5(random()::text), 1, 6));
  update public.customers set loyalty_points = loyalty_points - p_points where id = v_customer;
  insert into public.loyalty_transactions (customer_id, points, kind, description) values (v_customer, -p_points, 'resgate', 'Resgate em cupão ' || v_code);
  insert into public.coupons (code, description, discount_type, discount_value, expires_at, customer_id, source, max_uses)
  values (v_code, format('Resgate de %s pontos', p_points), 'fixo', v_value, now() + interval '90 days', v_customer, 'loyalty', 1);
  return jsonb_build_object('code', v_code, 'value', v_value);
end $$;

-- ---------------------------------------------------------------- chat
create or replace function public.get_or_create_room(p_type public.chat_room_type, p_product_id uuid default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_name text;
begin
  if auth.uid() is null then raise exception 'Autenticação necessária'; end if;
  if p_type = 'produto' then
    select id into v_id from public.chat_rooms where type = 'produto' and product_id = p_product_id;
    if v_id is null then
      select name into v_name from public.products where id = p_product_id;
      insert into public.chat_rooms (type, product_id, name, created_by) values ('produto', p_product_id, v_name, auth.uid()) returning id into v_id;
    end if;
  elsif p_type = 'suporte' then
    select id into v_id from public.chat_rooms where type = 'suporte' and customer_profile_id = auth.uid();
    if v_id is null then
      select full_name into v_name from public.profiles where id = auth.uid();
      insert into public.chat_rooms (type, customer_profile_id, name, created_by) values ('suporte', auth.uid(), v_name, auth.uid()) returning id into v_id;
    end if;
  elsif p_type = 'equipa' then
    if not public.is_staff() then raise exception 'Apenas equipa'; end if;
    select id into v_id from public.chat_rooms where type = 'equipa' order by created_at limit 1;
    if v_id is null then
      insert into public.chat_rooms (type, name, created_by) values ('equipa', 'Equipa Gilberto Aqui Tem', auth.uid()) returning id into v_id;
    end if;
  end if;
  return v_id;
end $$;

create or replace function public.on_chat_message() returns trigger language plpgsql security definer set search_path = public as $$
declare r public.chat_rooms;
begin
  select full_name, (role <> 'customer') into new.sender_name, new.is_staff from public.profiles where id = new.sender_id;
  new.sender_name := coalesce(nullif(new.sender_name,''), 'Cliente');
  update public.chat_rooms set last_message_at = now(), last_message_preview = coalesce(left(new.body, 80), case when new.audio_url is not null then 'Mensagem de voz' else 'Anexo' end) where id = new.room_id returning * into r;
  if not new.is_staff then
    perform public.notify_staff('Mensagem de cliente', format('%s: %s', new.sender_name, coalesce(left(new.body, 60), 'mensagem de voz')), 'chat', 'normal',
      case when r.type = 'produto' then '/admin/chat?room=' || r.id else '/admin/chat?room=' || r.id end,
      array['super_admin','admin','manager','sales','customer_service']::public.user_role[]);
  end if;
  return new;
end $$;
create trigger trg_chat_message before insert on public.chat_messages for each row execute function public.on_chat_message();

-- ---------------------------------------------------------------- tarefas (notifica atribuição)
create or replace function public.on_task_change() returns trigger language plpgsql security definer set search_path = public as $$
declare v_profile uuid;
begin
  if new.status = 'concluida' and (old is null or old.status <> 'concluida') then new.completed_at := now(); new.progress := 100; end if;
  if tg_op = 'INSERT' and new.employee_id is not null then
    select profile_id into v_profile from public.employees where id = new.employee_id;
    if v_profile is not null then
      insert into public.notifications (title, body, kind, priority, link, user_id) values ('Nova tarefa: ' || new.title, coalesce('Prazo: ' || to_char(new.deadline, 'DD/MM/YYYY'), ''), 'tarefa', case when new.priority in ('alta','urgente') then 'alta' else 'normal' end::public.notification_priority, '/admin/tarefas', v_profile);
    end if;
  end if;
  return new;
end $$;
create trigger trg_task_change before insert or update on public.tasks for each row execute function public.on_task_change();

-- ---------------------------------------------------------------- vista pública de produtos (sem custos/notas internas)
create view public.storefront_products with (security_invoker = false) as
  select p.id, p.name, p.slug, p.sku, p.brand_id, p.category_id, p.model, p.description, p.price, p.promo_price,
    p.stock_total, p.condition, p.color, p.storage, p.ram, p.battery_health, p.warranty_months, p.video_url, p.specs,
    p.device_details - 'internal_notes' as device_details, p.is_featured, p.is_promo, p.rating_avg, p.rating_count, p.sold_count, p.created_at,
    b.name as brand_name, b.slug as brand_slug, c.name as category_name, c.slug as category_slug,
    (select url from public.product_images i where i.product_id = p.id order by is_primary desc, sort_order asc limit 1) as image_url
  from public.products p
  left join public.brands b on b.id = p.brand_id
  left join public.categories c on c.id = p.category_id
  where p.is_active;
grant select on public.storefront_products to anon, authenticated;

-- ---------------------------------------------------------------- relatórios (agregados para staff)
create or replace function public.dashboard_stats() returns jsonb language plpgsql security definer set search_path = public as $$
declare v jsonb; today date := (now() at time zone 'Africa/Luanda')::date;
begin
  if not public.is_staff() then raise exception 'Sem permissão'; end if;
  select jsonb_build_object(
    'revenue_today', coalesce((select sum(total) from public.orders where status not in ('cancelado','devolvido','pendente') and (created_at at time zone 'Africa/Luanda')::date = today), 0),
    'revenue_month', coalesce((select sum(total) from public.orders where status not in ('cancelado','devolvido','pendente') and date_trunc('month', created_at at time zone 'Africa/Luanda') = date_trunc('month', today::timestamp)), 0),
    'orders_today', (select count(*) from public.orders where (created_at at time zone 'Africa/Luanda')::date = today),
    'orders_pending', (select count(*) from public.orders where status = 'pendente'),
    'products_in_stock', (select count(*) from public.products where is_active and stock_total > 0),
    'stock_units', coalesce((select sum(stock_total) from public.products where is_active), 0),
    'stock_value', coalesce((select sum(stock_total * coalesce(cost_price, 0)) from public.products where is_active), 0),
    'stock_retail_value', coalesce((select sum(stock_total * price) from public.products where is_active), 0),
    'low_stock', (select count(*) from public.products where is_active and stock_total > 0 and stock_total <= min_stock),
    'out_of_stock', (select count(*) from public.products where is_active and stock_total = 0),
    'customers', (select count(*) from public.customers),
    'employees_present', (select count(*) from public.attendance where work_date = today and check_in is not null),
    'employees_late', (select count(*) from public.attendance where work_date = today and status = 'atrasado'),
    'employees_total', (select count(*) from public.employees where status = 'activo'),
    'trades_pending', (select count(*) from public.trade_requests where status in ('novo','em_avaliacao')),
    'reviews_pending', (select count(*) from public.reviews where status = 'pendente'),
    'tasks_pending', (select count(*) from public.tasks where status in ('nao_iniciada','em_progresso','atrasada')),
    'pos_pending', (select count(*) from public.purchase_orders where status in ('encomendado','parcialmente_recebido')),
    'returns_pending', (select count(*) from public.returns where status = 'pendente')
  ) into v;
  return v;
end $$;

create or replace function public.revenue_series(p_days integer default 30)
returns table (day date, revenue numeric, orders bigint) language sql security definer set search_path = public as $$
  select d::date, coalesce(sum(o.total), 0), count(o.id)
  from generate_series((now() at time zone 'Africa/Luanda')::date - (p_days - 1), (now() at time zone 'Africa/Luanda')::date, '1 day') d
  left join public.orders o on (o.created_at at time zone 'Africa/Luanda')::date = d::date and o.status not in ('cancelado','devolvido','pendente')
  where public.is_staff()
  group by d order by d
$$;

create or replace function public.sales_by_category(p_from date, p_to date)
returns table (category text, revenue numeric, units bigint) language sql security definer set search_path = public as $$
  select coalesce(c.name, 'Sem categoria'), sum(i.total), sum(i.quantity)
  from public.order_items i join public.orders o on o.id = i.order_id
  left join public.products p on p.id = i.product_id left join public.categories c on c.id = p.category_id
  where public.is_staff() and o.status not in ('cancelado','devolvido','pendente') and (o.created_at at time zone 'Africa/Luanda')::date between p_from and p_to
  group by 1 order by 2 desc
$$;

create or replace function public.top_products(p_from date, p_to date, p_limit integer default 10)
returns table (product_id uuid, name text, revenue numeric, units bigint) language sql security definer set search_path = public as $$
  select i.product_id, i.product_name, sum(i.total), sum(i.quantity)
  from public.order_items i join public.orders o on o.id = i.order_id
  where public.is_staff() and o.status not in ('cancelado','devolvido','pendente') and (o.created_at at time zone 'Africa/Luanda')::date between p_from and p_to
  group by 1, 2 order by 3 desc limit p_limit
$$;

create or replace function public.sales_by_employee(p_from date, p_to date)
returns table (seller_id uuid, seller text, revenue numeric, orders bigint) language sql security definer set search_path = public as $$
  select o.seller_id, coalesce(pr.full_name, 'Website'), sum(o.total), count(*)
  from public.orders o left join public.profiles pr on pr.id = o.seller_id
  where public.is_staff() and o.status not in ('cancelado','devolvido','pendente') and (o.created_at at time zone 'Africa/Luanda')::date between p_from and p_to
  group by 1, 2 order by 3 desc
$$;

create or replace function public.financial_summary(p_from date, p_to date) returns jsonb language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'revenue', coalesce(sum(o.total), 0),
    'discounts', coalesce(sum(o.discount), 0),
    'cogs', coalesce((select sum(i.quantity * coalesce(i.unit_cost, 0)) from public.order_items i join public.orders o2 on o2.id = i.order_id
        where o2.status not in ('cancelado','devolvido','pendente') and (o2.created_at at time zone 'Africa/Luanda')::date between p_from and p_to), 0),
    'returns', coalesce((select sum(refund_amount) from public.returns where status in ('aprovada','concluida') and (created_at at time zone 'Africa/Luanda')::date between p_from and p_to), 0),
    'orders', count(*)
  ) from public.orders o where public.is_manager() and o.status not in ('cancelado','devolvido','pendente') and (o.created_at at time zone 'Africa/Luanda')::date between p_from and p_to
$$;

-- pesquisa global
create or replace function public.global_search(q text) returns jsonb language sql security definer set search_path = public as $$
  select case when public.is_staff() then jsonb_build_object(
    'products', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', name, 'sku', sku, 'stock', stock_total)), '[]') from (select * from public.products where name ilike '%'||q||'%' or sku ilike '%'||q||'%' or model ilike '%'||q||'%' limit 6) s),
    'customers', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', name, 'phone', phone)), '[]') from (select * from public.customers where name ilike '%'||q||'%' or phone ilike '%'||q||'%' or email ilike '%'||q||'%' limit 5) s),
    'orders', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'number', order_number, 'customer', customer_name, 'status', status)), '[]') from (select * from public.orders where order_number ilike '%'||q||'%' or customer_name ilike '%'||q||'%' or customer_phone ilike '%'||q||'%' limit 5) s),
    'employees', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', full_name, 'department', department)), '[]') from (select * from public.employees where full_name ilike '%'||q||'%' or department ilike '%'||q||'%' or position ilike '%'||q||'%' limit 5) s)
  ) else '{}'::jsonb end
$$;

-- promoção de utilizador a funcionário (apenas admins)
create or replace function public.set_user_role(p_user_id uuid, p_role public.user_role) returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Sem permissão'; end if;
  if p_role = 'super_admin' and public.my_role() <> 'super_admin' then raise exception 'Apenas o super admin pode atribuir esse papel'; end if;
  update public.profiles set role = p_role where id = p_user_id;
end $$;

create or replace function public.find_profile_by_email(p_email text) returns jsonb language sql security definer set search_path = public as $$
  select case when public.is_admin() then (select jsonb_build_object('id', id, 'full_name', full_name, 'email', email, 'role', role) from public.profiles where lower(email) = lower(trim(p_email))) else null end
$$;
