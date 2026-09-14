-- Dados de demonstração: produtos, imagens (picsum), stock, funcionários e ponto de hoje.
do $$
declare
  c_iphone uuid := (select id from public.categories where slug='iphone');
  c_samsung uuid := (select id from public.categories where slug='samsung');
  c_android uuid := (select id from public.categories where slug='android');
  c_laptops uuid := (select id from public.categories where slug='laptops');
  c_mac uuid := (select id from public.categories where slug='macbook');
  c_ps uuid := (select id from public.categories where slug='playstation');
  c_airpods uuid := (select id from public.categories where slug='airpods');
  c_watch uuid := (select id from public.categories where slug='apple-watch');
  c_ac uuid := (select id from public.categories where slug='acessorios');
  b_apple uuid := (select id from public.brands where slug='apple');
  b_samsung uuid := (select id from public.brands where slug='samsung');
  b_sony uuid := (select id from public.brands where slug='sony');
  b_xiaomi uuid := (select id from public.brands where slug='xiaomi');
  b_hp uuid := (select id from public.brands where slug='hp');
  b_jbl uuid := (select id from public.brands where slug='jbl');
  loc uuid := (select id from public.inventory_locations where slug='loja-principal');
begin
  with p as (
    insert into public.products (name, slug, sku, brand_id, category_id, model, description, price, promo_price, cost_price, stock_total, min_stock, condition, color, storage, ram, battery_health, warranty_months, is_featured, is_promo, specs)
    values
    ('iPhone 15 Pro Max 256GB', 'iphone-15-pro-max-256', 'GAT-IP15PM-256', b_apple, c_iphone, 'A2849',
      'O topo de gama da Apple com chip A17 Pro, câmara de 48MP e estrutura em titânio.', 1650000, NULL, 1380000, 4, 1, 'novo', 'Titânio Natural', '256 GB', '8 GB', 100, 12, true, false,
      '{"Ecrã":"6.7\" Super Retina XDR","Câmara":"48MP + 12MP + 12MP","Chip":"A17 Pro"}'),
    ('iPhone 13 128GB — Recondicionado', 'iphone-13-128-recond', 'GAT-IP13-128R', b_apple, c_iphone, 'A2633',
      'iPhone 13 recondicionado, inspeccionado e com garantia. Excelente relação qualidade/preço.', 520000, 465000, 390000, 6, 2, 'recondicionado', 'Meia-Noite', '128 GB', '4 GB', 89, 6, true, true,
      '{"Ecrã":"6.1\" Super Retina XDR","Câmara":"12MP dupla","Chip":"A15 Bionic"}'),
    ('Samsung Galaxy A55 5G 128GB', 'samsung-a55-128', 'GAT-A55-128', b_samsung, c_samsung, 'SM-A556',
      'Galaxy A55 com ecrã AMOLED 120Hz e bateria de 5000 mAh.', 385000, NULL, 320000, 9, 2, 'novo', 'Azul', '128 GB', '8 GB', 100, 12, true, false,
      '{"Ecrã":"6.6\" AMOLED 120Hz","Bateria":"5000 mAh","Câmara":"50MP"}'),
    ('Samsung Galaxy S24 Ultra 256GB', 'samsung-s24u-256', 'GAT-S24U-256', b_samsung, c_samsung, 'SM-S928',
      'O Galaxy mais completo: S Pen integrada, zoom 100x e Galaxy AI.', 1480000, NULL, 1250000, 3, 1, 'novo', 'Cinza Titânio', '256 GB', '12 GB', 100, 12, true, false,
      '{"Ecrã":"6.8\" QHD+ 120Hz","Câmara":"200MP","S Pen":"Incluída"}'),
    ('Xiaomi Redmi Note 13 128GB', 'redmi-note-13-128', 'GAT-RN13-128', b_xiaomi, c_android, '2312DRAABC',
      'O best-seller acessível: AMOLED 120Hz e câmara de 108MP por pouco.', 195000, 175000, 155000, 12, 3, 'novo', 'Preto', '128 GB', '8 GB', 100, 12, false, true,
      '{"Ecrã":"6.67\" AMOLED 120Hz","Câmara":"108MP","Bateria":"5000 mAh"}'),
    ('MacBook Air M2 13" 256GB', 'macbook-air-m2-256', 'GAT-MBA-M2-256', b_apple, c_mac, 'MLXY3',
      'Portátil leve e potente com chip M2. Bateria para o dia inteiro.', 1250000, NULL, 1080000, 2, 1, 'novo', 'Meia-Noite', '256 GB', '8 GB', 100, 12, true, false,
      '{"Ecrã":"13.6\" Liquid Retina","Chip":"Apple M2","Bateria":"até 18h"}'),
    ('HP 15 i5 8GB 512GB SSD', 'hp-15-i5-512', 'GAT-HP15-I5', b_hp, c_laptops, '15-fd',
      'Portátil fiável para trabalho e estudo, com SSD rápido.', 620000, NULL, 540000, 5, 1, 'novo', 'Prata', '512 GB', '8 GB', 100, 12, false, false,
      '{"Processador":"Intel i5-1235U","Ecrã":"15.6\" FHD","Disco":"512GB SSD"}'),
    ('PlayStation 5 Slim 1TB', 'ps5-slim-1tb', 'GAT-PS5-1TB', b_sony, c_ps, 'CFI-2016',
      'A consola mais vendida do mundo, versão Slim com 1TB. Inclui 1 comando.', 890000, 845000, 760000, 4, 1, 'novo', 'Branco', '1 TB', NULL, NULL, 12, true, true,
      '{"Armazenamento":"1TB SSD","Resolução":"4K até 120Hz","Inclui":"1 comando DualSense"}'),
    ('AirPods Pro 2ª Geração USB-C', 'airpods-pro-2-usbc', 'GAT-APP2-USBC', b_apple, c_airpods, 'MTJV3',
      'Cancelamento activo de ruído e áudio espacial personalizado.', 285000, NULL, 240000, 8, 2, 'novo', 'Branco', NULL, NULL, 100, 12, true, false,
      '{"ANC":"Sim","Carregamento":"USB-C / MagSafe","Resistência":"IP54"}'),
    ('Apple Watch SE 44mm GPS', 'apple-watch-se-44', 'GAT-AWSE-44', b_apple, c_watch, 'MRE13',
      'O smartwatch essencial da Apple: notificações, treino e segurança.', 340000, NULL, 295000, 5, 1, 'novo', 'Meia-Noite', NULL, NULL, 100, 12, false, false,
      '{"Ecrã":"44mm Retina","GPS":"Sim","Resistência":"50m"}'),
    ('JBL Charge 5 — Coluna Bluetooth', 'jbl-charge-5', 'GAT-JBL-C5', b_jbl, c_ac, 'Charge 5',
      'Som potente, 20h de bateria e à prova de água IP67.', 165000, NULL, 132000, 10, 2, 'novo', 'Preto', NULL, NULL, NULL, 12, false, false,
      '{"Bateria":"20h","Resistência":"IP67","Powerbank":"Sim"}'),
    ('iPhone 11 64GB — Usado A', 'iphone-11-64-usado', 'GAT-IP11-64U', b_apple, c_iphone, 'A2111',
      'Usado em óptimo estado, bateria a 84%. Ideal entrada de gama Apple.', 265000, NULL, 205000, 3, 1, 'usado', 'Branco', '64 GB', '4 GB', 84, 3, false, true,
      '{"Ecrã":"6.1\" Liquid Retina","Câmara":"12MP dupla","Chip":"A13 Bionic"}')
    returning id, sku, name
  )
  insert into public.product_images (product_id, url, alt, is_primary, sort_order)
    select p.id, 'https://picsum.photos/seed/gat-' || p.sku || '/900/900', p.name, true, 0 from p;

  -- inventário na loja principal
  insert into public.inventory (product_id, location_id, quantity)
    select id, loc, stock_total from public.products where sku like 'GAT-%'
    on conflict (product_id, location_id) do update set quantity = excluded.quantity;

  -- 3 funcionários de exemplo
  insert into public.employees (full_name, employee_code, department, position, phone, schedule_start, schedule_end)
  values
    ('Domingos Cassule','FUNC-001','Vendas','Vendedor sénior','+244 923 000 001','08:30','18:00'),
    ('Marta Sebastião','FUNC-002','Armazém','Gestora de stock','+244 923 000 002','08:30','18:00'),
    ('Paulo António','FUNC-003','Técnico','Técnico de reparações','+244 923 000 003','09:00','18:00')
  on conflict (employee_code) do nothing;

  -- ponto de hoje: 1 presente a horas, 1 atrasado, 1 sem registo (exemplo)
  insert into public.attendance (employee_id, work_date, check_in, status, late_minutes)
  select e.id, (now() at time zone 'Africa/Luanda')::date,
         ((now() at time zone 'Africa/Luanda')::date + v.t) at time zone 'Africa/Luanda',
         v.st, v.lm
  from (values ('FUNC-001', time '08:32', 'presente'::public.attendance_status, 0), ('FUNC-002', time '08:55', 'atrasado', 15)) v(code, t, st, lm)
  join public.employees e on e.employee_code = v.code
  on conflict (employee_id, work_date) do nothing;
end $$;
