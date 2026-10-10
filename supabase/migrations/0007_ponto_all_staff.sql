-- Check-in para TODO o staff com acesso ao painel:
-- a ficha de funcionário é criada automaticamente no primeiro uso e
-- cada marcação (entrada/saída) notifica a administração.

create or replace function public.ensure_my_employee() returns public.employees
language plpgsql security definer set search_path = public as $$
declare
  p public.profiles; e public.employees;
begin
  select * into p from public.profiles where id = auth.uid();
  if p is null or not (p.role = any(array['super_admin','admin','manager','sales','warehouse','customer_service','marketing','delivery','technician']::public.user_role[])) then
    raise exception 'Sem permissão para registo de ponto';
  end if;
  select * into e from public.employees where profile_id = p.id and status = 'activo';
  if e is null then
    insert into public.employees (full_name, department, position, email, profile_id, status)
    values (
      coalesce(nullif(p.full_name, ''), split_part(coalesce(p.email, ''), '@', 1), 'Funcionário'),
      case p.role
        when 'super_admin' then 'Direcção' when 'admin' then 'Direcção' when 'manager' then 'Direcção'
        when 'sales' then 'Vendas' when 'warehouse' then 'Armazém' when 'customer_service' then 'Apoio ao Cliente'
        when 'marketing' then 'Marketing' when 'delivery' then 'Entregas' when 'technician' then 'Técnico'
        else 'Vendas' end,
      case p.role
        when 'super_admin' then 'Administrador' when 'admin' then 'Administrador' when 'manager' then 'Gerente'
        when 'sales' then 'Vendedor' when 'warehouse' then 'Gestor de stock' when 'customer_service' then 'Apoio ao Cliente'
        when 'marketing' then 'Marketing' when 'delivery' then 'Estafeta' when 'technician' then 'Técnico'
        else null end,
      p.email, p.id, 'activo')
    returning * into e;
  end if;
  return e;
end $$;

create or replace function public.clock_in(p_device text default null, p_photo text default null) returns public.attendance
language plpgsql security definer set search_path = public as $$
declare e public.employees; v_now timestamptz := now(); v_local timestamp; v_late integer := 0; v_row public.attendance; v_status public.attendance_status;
begin
  e := public.ensure_my_employee();
  v_local := v_now at time zone 'Africa/Luanda';
  v_late := greatest(0, (extract(epoch from (v_local::time - e.schedule_start)) / 60)::integer - e.late_tolerance_minutes);
  v_status := case when v_late > 0 then 'atrasado' else 'presente' end;
  insert into public.attendance (employee_id, work_date, check_in, status, late_minutes, device_info, recorded_by, check_in_photo)
  values (e.id, v_local::date, v_now, v_status, v_late, p_device, auth.uid(), p_photo)
  on conflict (employee_id, work_date) do update set check_in = coalesce(public.attendance.check_in, excluded.check_in),
    check_in_photo = coalesce(public.attendance.check_in_photo, excluded.check_in_photo)
  returning * into v_row;
  perform public.notify_staff('Ponto marcado: ' || e.full_name,
    'Entrada às ' || to_char(v_local, 'HH24:MI') || case when v_late > 0 then format(' · %s min de atraso', v_late) else '' end,
    'pontualidade', case when v_late > 0 then 'alta'::public.notification_priority else 'normal'::public.notification_priority end,
    '/admin/pontualidade', array['super_admin','admin','manager']::public.user_role[]);
  return v_row;
end $$;

create or replace function public.clock_out(p_photo text default null) returns public.attendance
language plpgsql security definer set search_path = public as $$
declare e public.employees; v_row public.attendance; v_local timestamp := now() at time zone 'Africa/Luanda'; v_early integer; v_over integer;
begin
  e := public.ensure_my_employee();
  select * into v_row from public.attendance where employee_id = e.id and work_date = v_local::date;
  if v_row is null or v_row.check_in is null then raise exception 'Ainda não registou entrada hoje'; end if;
  v_early := greatest(0, (extract(epoch from (e.schedule_end - v_local::time)) / 60)::integer);
  v_over := greatest(0, (extract(epoch from (v_local::time - e.schedule_end)) / 60)::integer);
  update public.attendance set check_out = now(), early_leave_minutes = v_early, overtime_minutes = v_over,
    worked_minutes = (extract(epoch from (now() - check_in)) / 60)::integer, check_out_photo = coalesce(p_photo, check_out_photo)
  where id = v_row.id returning * into v_row;
  perform public.notify_staff('Saída registada: ' || e.full_name,
    'Check-out às ' || to_char(v_local, 'HH24:MI') || format(' · %sh%s trabalhadas', v_row.worked_minutes / 60, lpad((v_row.worked_minutes % 60)::text, 2, '0')),
    'pontualidade', 'normal', '/admin/pontualidade', array['super_admin','admin','manager']::public.user_role[]);
  return v_row;
end $$;
