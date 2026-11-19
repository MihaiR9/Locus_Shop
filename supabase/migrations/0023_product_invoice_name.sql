-- Denumirea vinului pe factura FGO, ca în nomenclatorul firmei:
-- „VIN ROSU FETEASCA NEAGRA DEMISEC, 0.75 L CUVINTE".
-- Se editează din admin, pe pagina produsului. Goală = se compune automat
-- din tip, soi, dulceață și gamă (lib/fgo/build-invoice.ts).

alter table public.products
  add column if not exists invoice_name text;

update public.products set invoice_name = 'VIN ALB FETEASCA REGALA DEMISEC, 0.75 L CUVINTE' where code = 'LC01';
update public.products set invoice_name = 'VIN ROSU FETEASCA NEAGRA DEMISEC, 0.75 L CUVINTE' where code = 'LC02';
update public.products set invoice_name = 'VIN ALB RIESLING ITALIAN SEC, 0.75 L CUVINTE' where code = 'LC04';
update public.products set invoice_name = 'VIN ALB FETEASCA REGALA DEMISEC, 0.75 L SEMNE' where code = 'LS01';
update public.products set invoice_name = 'VIN ROSU FETEASCA NEAGRA DEMISEC, 0.75 L SEMNE' where code = 'LS02';
update public.products set invoice_name = 'VIN ALB RIESLING ITALIAN SEC, 0.75 L SEMNE' where code = 'LS04';
