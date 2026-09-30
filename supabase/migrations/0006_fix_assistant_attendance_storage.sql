-- Fotos de ponto: qualquer utilizador autenticado com ficha de funcionário pode enviar/actualizar; leitura pública do bucket
drop policy if exists "storage ponto envia" on storage.objects;
create policy "storage ponto envia" on storage.objects for insert
  with check (bucket_id = 'attendance' and exists (select 1 from public.employees where profile_id = auth.uid()));
drop policy if exists "storage ponto actualiza" on storage.objects;
create policy "storage ponto actualiza" on storage.objects for update
  using (bucket_id = 'attendance' and exists (select 1 from public.employees where profile_id = auth.uid()));
drop policy if exists "storage ponto ler" on storage.objects;
create policy "storage ponto ler" on storage.objects for select using (bucket_id = 'attendance');

-- Assistente: estados de troca corrigidos
create or replace function public.assistant_context() returns jsonb
language plpgsql security definer set search_path = public as $$
declare today date := (now() at time zone 'Africa/Luanda')::date;
begin
  if not public.is_admin() then raise exception 'Apenas administradores'; end if;
  return jsonb_build_object(
    'data_hoje', today,
    'estatisticas', public.dashboard_stats(),
    'pontualidade_hoje', (select coalesce(jsonb_agg(jsonb_build_object('funcionario', e.full_name, 'departamento', e.department,
        'entrada', to_char(a.check_in at time zone 'Africa/Luanda', 'HH24:MI'), 'saida', to_char(a.check_out at time zone 'Africa/Luanda', 'HH24:MI'),
        'estado', a.status, 'atraso_min', a.late_minutes, 'com_foto', a.check_in_photo is not null)), '[]'::jsonb)
      from public.attendance a join public.employees e on e.id = a.employee_id where a.work_date = today),
    'ausentes_hoje', (select coalesce(jsonb_agg(e.full_name), '[]'::jsonb) from public.employees e
      where e.status = 'activo' and not exists (select 1 from public.attendance a where a.employee_id = e.id and a.work_date = today and a.check_in is not null)),
    'atrasos_30_dias', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (select e.full_name as funcionario, count(*) filter (where a.status = 'atrasado') as atrasos,
        sum(a.late_minutes) as minutos_atraso, count(*) as dias_presentes from public.attendance a join public.employees e on e.id = a.employee_id
        where a.work_date >= today - 30 group by e.full_name order by atrasos desc) x),
    'pedidos_recentes', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (select o.order_number, o.customer_name, o.total, o.status, o.payment_status, o.channel,
        to_char(o.created_at at time zone 'Africa/Luanda', 'DD/MM HH24:MI') as data from public.orders o order by o.created_at desc limit 15) x),
    'movimentos_recentes', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (select p.name as produto, m.type as tipo, m.quantity as qtd, l.name as local, m.reason as motivo,
        pr.full_name as utilizador, to_char(m.created_at at time zone 'Africa/Luanda', 'DD/MM HH24:MI') as data
        from public.inventory_movements m join public.products p on p.id = m.product_id left join public.inventory_locations l on l.id = m.location_id
        left join public.profiles pr on pr.id = m.user_id order by m.created_at desc limit 20) x),
    'stock_baixo', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (select name, sku, stock_total, min_stock from public.products
        where is_active and stock_total <= min_stock order by stock_total limit 20) x),
    'top_produtos_mes', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (select oi.product_name as produto, sum(oi.quantity) as unidades, sum(oi.total) as receita
        from public.order_items oi join public.orders o on o.id = oi.order_id where o.created_at >= date_trunc('month', now()) and o.status not in ('cancelado','devolvido')
        group by oi.product_name order by unidades desc limit 10) x),
    'tarefas_pendentes', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (select t.title, e.full_name as responsavel, t.deadline, t.priority, t.status
        from public.tasks t left join public.employees e on e.id = t.employee_id where t.status <> 'concluida' order by t.deadline nulls last limit 15) x),
    'trocas_pendentes', (select count(*) from public.trade_requests where status in ('novo','em_avaliacao','proposta_enviada')),
    'funcionarios', (select coalesce(jsonb_agg(jsonb_build_object('nome', full_name, 'departamento', department, 'cargo', position, 'horario', schedule_start || '-' || schedule_end)), '[]'::jsonb)
      from public.employees where status = 'activo')
  );
end $$;
revoke all on function public.assistant_context() from public;
grant execute on function public.assistant_context() to authenticated;
