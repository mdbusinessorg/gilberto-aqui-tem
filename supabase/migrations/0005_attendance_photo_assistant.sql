-- Ponto com fotografia, visibilidade do próprio ponto e contexto do assistente do administrador
alter table public.attendance add column if not exists check_in_photo text;
alter table public.attendance add column if not exists check_out_photo text;

drop policy if exists "attendance: próprio" on public.attendance;
create policy "attendance: próprio" on public.attendance for select
  using (employee_id in (select id from public.employees where profile_id = auth.uid()));

drop policy if exists "employees: próprio" on public.employees;
create policy "employees: próprio" on public.employees for select using (profile_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('attendance', 'attendance', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
drop policy if exists "storage ponto envia" on storage.objects;
create policy "storage ponto envia" on storage.objects for insert with check (bucket_id = 'attendance' and public.is_staff());

create or replace function public.clock_in(p_device text default null, p_photo text default null) returns public.attendance
language plpgsql security definer set search_path = public as $$
declare e public.employees; v_now timestamptz := now(); v_local timestamp; v_late integer := 0; v_row public.attendance; v_status public.attendance_status;
begin
  select * into e from public.employees where profile_id = auth.uid() and status = 'activo';
  if e is null then raise exception 'Não existe ficha de funcionário activa para este utilizador'; end if;
  v_local := v_now at time zone 'Africa/Luanda';
  v_late := greatest(0, (extract(epoch from (v_local::time - e.schedule_start)) / 60)::integer - e.late_tolerance_minutes);
  v_status := case when v_late > 0 then 'atrasado' else 'presente' end;
  insert into public.attendance (employee_id, work_date, check_in, status, late_minutes, device_info, recorded_by, check_in_photo)
  values (e.id, v_local::date, v_now, v_status, v_late, p_device, auth.uid(), p_photo)
  on conflict (employee_id, work_date) do update set check_in = coalesce(public.attendance.check_in, excluded.check_in),
    check_in_photo = coalesce(public.attendance.check_in_photo, excluded.check_in_photo)
  returning * into v_row;
  if v_late > 0 then
    perform public.notify_staff('Atraso: ' || e.full_name, format('Entrou com %s minutos de atraso.', v_late), 'pontualidade', 'baixa', '/admin/pontualidade',
      array['super_admin','admin','manager']::public.user_role[]);
  end if;
  return v_row;
end $$;

create or replace function public.clock_out(p_photo text default null) returns public.attendance
language plpgsql security definer set search_path = public as $$
declare e public.employees; v_row public.attendance; v_local timestamp := now() at time zone 'Africa/Luanda'; v_early integer; v_over integer;
begin
  select * into e from public.employees where profile_id = auth.uid() and status = 'activo';
  if e is null then raise exception 'Não existe ficha de funcionário activa para este utilizador'; end if;
  select * into v_row from public.attendance where employee_id = e.id and work_date = v_local::date;
  if v_row is null or v_row.check_in is null then raise exception 'Ainda não registou entrada hoje'; end if;
  v_early := greatest(0, (extract(epoch from (e.schedule_end - v_local::time)) / 60)::integer);
  v_over := greatest(0, (extract(epoch from (v_local::time - e.schedule_end)) / 60)::integer);
  update public.attendance set check_out = now(), early_leave_minutes = v_early, overtime_minutes = v_over,
    worked_minutes = (extract(epoch from (now() - check_in)) / 60)::integer, check_out_photo = coalesce(p_photo, check_out_photo)
  where id = v_row.id returning * into v_row;
  return v_row;
end $$;

-- Contexto completo para o assistente (apenas administradores)
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
    'trocas_pendentes', (select count(*) from public.trade_requests where status = 'pendente'),
    'funcionarios', (select coalesce(jsonb_agg(jsonb_build_object('nome', full_name, 'departamento', department, 'cargo', position, 'horario', schedule_start || '-' || schedule_end)), '[]'::jsonb)
      from public.employees where status = 'activo')
  );
end $$;
revoke all on function public.assistant_context() from public;
grant execute on function public.assistant_context() to authenticated;
