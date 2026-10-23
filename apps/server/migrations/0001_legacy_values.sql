-- MIG-4; ADR-002. Original values and anomalies are preserved.

-- Text collation and legacy referential enforcement remain unresolved.

CREATE SCHEMA app;

CREATE SCHEMA import_audit;

REVOKE ALL ON SCHEMA import_audit FROM PUBLIC;

CREATE TABLE import_audit.runs (id uuid PRIMARY KEY, source_sha256 text NOT NULL, mapping_version integer NOT NULL, completed_at timestamptz NOT NULL DEFAULT clock_timestamp());

CREATE TABLE import_audit.rows (run_id uuid NOT NULL REFERENCES import_audit.runs(id), table_name text NOT NULL, source_row bigint NOT NULL, original_values jsonb NOT NULL, PRIMARY KEY (run_id, table_name, source_row));

CREATE TABLE import_audit.quarantine (run_id uuid NOT NULL REFERENCES import_audit.runs(id), table_name text NOT NULL, source_row bigint NOT NULL, reason text NOT NULL, original_values jsonb NOT NULL, PRIMARY KEY (run_id, table_name, source_row));

CREATE TABLE app."Clientes" (
  _row_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  _import_id uuid REFERENCES import_audit.runs(id),
  _source_row bigint,
  "ClientesID" numeric(20,0),
  "Codigo" numeric(20,0),
  "Descricao" text,
  "Morada1" text,
  "Morada2" text,
  "codpostal" text,
  "Telefone1" text,
  "Telemovel" text,
  "observacao" text,
  UNIQUE (_import_id, _source_row)
);

CREATE UNIQUE INDEX "ix_c82a3b0071197d6d" ON app."Clientes" ("ClientesID");

CREATE UNIQUE INDEX "ix_4f4b84259e533b8d" ON app."Clientes" ("Codigo");

CREATE INDEX "ix_7d0f0d79cf04d360" ON app."Clientes" ("Descricao");

CREATE TABLE app."Viaturas" (
  _row_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  _import_id uuid REFERENCES import_audit.runs(id),
  _source_row bigint,
  "ViaturasID" numeric(20,0),
  "matricula" text,
  "Cliente" numeric(20,0),
  "marca" text,
  "modelo" text,
  "Ano" integer,
  "mes" smallint,
  UNIQUE (_import_id, _source_row)
);

CREATE UNIQUE INDEX "ix_65fd9bcf7da5c225" ON app."Viaturas" ("ViaturasID");

CREATE INDEX "ix_f486fc0ac891b840" ON app."Viaturas" ("matricula");

CREATE INDEX "ix_8e71271465439779" ON app."Viaturas" ("Cliente");

CREATE TABLE app."mecanicos" (
  _row_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  _import_id uuid REFERENCES import_audit.runs(id),
  _source_row bigint,
  "mecanicosID" numeric(20,0),
  "Codigo" smallint,
  "Descricao" text,
  "palavra_passe" text,
  "inativo" boolean,
  UNIQUE (_import_id, _source_row)
);

CREATE UNIQUE INDEX "ix_4c957ba21ebee4b2" ON app."mecanicos" ("mecanicosID");

CREATE UNIQUE INDEX "ix_def9a2203abf0b62" ON app."mecanicos" ("Codigo");

CREATE INDEX "ix_2025e3aa96b152cf" ON app."mecanicos" ("Descricao");

CREATE INDEX "ix_89a59e780da262e2" ON app."mecanicos" ("inativo");

CREATE TABLE app."artigos" (
  _row_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  _import_id uuid REFERENCES import_audit.runs(id),
  _source_row bigint,
  "artigosID" numeric(20,0),
  "Codigo" text,
  "Descricao" text,
  "codbarras" text,
  "unidade" text,
  "preco" numeric,
  "inativo" boolean,
  "stock" numeric,
  UNIQUE (_import_id, _source_row)
);

CREATE UNIQUE INDEX "ix_a1f330450687ece0" ON app."artigos" ("artigosID");

CREATE INDEX "ix_1e1fd7966352947f" ON app."artigos" ("Codigo");

CREATE INDEX "ix_1a71da727de890d0" ON app."artigos" ("Descricao");

CREATE INDEX "ix_8acd4aa7e79c9c66" ON app."artigos" ("unidade");

CREATE TABLE app."ordem_reparacao" (
  _row_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  _import_id uuid REFERENCES import_audit.runs(id),
  _source_row bigint,
  "ordem_reparacaoID" numeric(20,0),
  "numero" numeric(20,0),
  "matricula" text,
  "km_viatura" numeric(20,0),
  "recepcao_util" smallint,
  "recepcao_datahora" text,
  "recepcao_cliente" numeric(20,0),
  "recepcao_terceiro" numeric(20,0),
  "recepacao_contatos" text,
  "recepcao_servico" text,
  "recepcao_obs" text,
  "recepcao_entrega_prevista" text,
  "recepcao_prioridade" smallint,
  "reparacao_mecanico" smallint,
  "reparacao_estado" text,
  "reparacao_estado_obs" text,
  "reparacao_servico" text,
  "reparacao_estado_data" text,
  "reparacao_estado_historico" text,
  "totaL_mao_obra" numeric,
  "total_pecas" numeric,
  "total_desconto" numeric,
  "total_reparacao" numeric,
  "faturado" boolean,
  "total_pago" numeric,
  "Estados_reparacaoID" numeric(20,0),
  "numero_fatura" text,
  "data_pagamento" text,
  UNIQUE (_import_id, _source_row)
);

CREATE UNIQUE INDEX "ix_85c29a07d7537b09" ON app."ordem_reparacao" ("ordem_reparacaoID");

CREATE UNIQUE INDEX "ix_9c1d015c1ce94b89" ON app."ordem_reparacao" ("numero");

CREATE INDEX "ix_e644721af21b7575" ON app."ordem_reparacao" ("matricula");

CREATE INDEX "ix_1c90b3fbdd6ba026" ON app."ordem_reparacao" ("recepcao_util");

CREATE INDEX "ix_437fe897b11bbac9" ON app."ordem_reparacao" ("recepcao_datahora");

CREATE INDEX "ix_ed57b03e82fbbe6f" ON app."ordem_reparacao" ("recepcao_cliente");

CREATE INDEX "ix_e602f1902e70c9a9" ON app."ordem_reparacao" ("recepcao_terceiro");

CREATE INDEX "ix_9a24b1a67263edba" ON app."ordem_reparacao" ("reparacao_mecanico");

CREATE INDEX "ix_69d5790905c379c7" ON app."ordem_reparacao" ("reparacao_estado");

CREATE INDEX "ix_eb3b5d0926d5a7d3" ON app."ordem_reparacao" ("Estados_reparacaoID");

CREATE INDEX "ix_b422cf9dfc17de6d" ON app."ordem_reparacao" ("data_pagamento");

CREATE TABLE app."tempos_reparacao" (
  _row_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  _import_id uuid REFERENCES import_audit.runs(id),
  _source_row bigint,
  "tempos_reparacaoID" numeric(20,0),
  "numero" numeric(20,0),
  "mecanico" smallint,
  "inicio" text,
  "fim" text,
  "Inicio_reparacao_estado" text,
  "fim_reparacao_estado" text,
  UNIQUE (_import_id, _source_row)
);

CREATE INDEX "ix_d7cfa655de1fd99b" ON app."tempos_reparacao" ("tempos_reparacaoID");

CREATE INDEX "ix_f368c2eee75b6077" ON app."tempos_reparacao" ("numero");

CREATE INDEX "ix_58741cb2fb3cc1a8" ON app."tempos_reparacao" ("mecanico");

CREATE INDEX "ix_a9e0829ac38cfab5" ON app."tempos_reparacao" ("inicio");

CREATE INDEX "ix_5a5868f34277e8a9" ON app."tempos_reparacao" ("fim");

CREATE INDEX "ix_2c65d28d02bdd14e" ON app."tempos_reparacao" ("Inicio_reparacao_estado");

CREATE INDEX "ix_ea0f2ad08656f515" ON app."tempos_reparacao" ("fim_reparacao_estado");

CREATE INDEX "ix_8e06c555e09a3504" ON app."tempos_reparacao" ("numero", "mecanico");

CREATE TABLE app."material_reparacao" (
  _row_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  _import_id uuid REFERENCES import_audit.runs(id),
  _source_row bigint,
  "material_reparacaoID" numeric(20,0),
  "numero" numeric(20,0),
  "mecanico" smallint,
  "artigo" text,
  "descricao_artigo" text,
  "quantidade" numeric,
  "data_hora" text,
  "reparacao_estado" text,
  "preco" numeric,
  "lancado" boolean,
  "extra" boolean,
  UNIQUE (_import_id, _source_row)
);

CREATE UNIQUE INDEX "ix_0477816d098cbefb" ON app."material_reparacao" ("material_reparacaoID");

CREATE INDEX "ix_e0429bab444634c4" ON app."material_reparacao" ("numero");

CREATE INDEX "ix_2809c12c9aa0447f" ON app."material_reparacao" ("mecanico");

CREATE INDEX "ix_1fd934d141499e8e" ON app."material_reparacao" ("artigo");

CREATE TABLE app."utilizadores" (
  _row_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  _import_id uuid REFERENCES import_audit.runs(id),
  _source_row bigint,
  "utilizadoresID" numeric(20,0),
  "Codigo" smallint,
  "Descricao" text,
  "palavra_passe" text,
  UNIQUE (_import_id, _source_row)
);

CREATE UNIQUE INDEX "ix_712e0c3445cd149e" ON app."utilizadores" ("utilizadoresID");

CREATE UNIQUE INDEX "ix_117702271c47b975" ON app."utilizadores" ("Codigo");

CREATE INDEX "ix_bc91c56a598ee210" ON app."utilizadores" ("Descricao");

CREATE TABLE app."unidades" (
  _row_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  _import_id uuid REFERENCES import_audit.runs(id),
  _source_row bigint,
  "unidadesID" numeric(20,0),
  "Codigo" text,
  "Descricao" text,
  UNIQUE (_import_id, _source_row)
);

CREATE UNIQUE INDEX "ix_06a4f455282786ef" ON app."unidades" ("unidadesID");

CREATE INDEX "ix_286dd584090dc90a" ON app."unidades" ("Codigo");

CREATE INDEX "ix_dc4a2d449b583be0" ON app."unidades" ("Descricao");

CREATE TABLE app."documentos" (
  _row_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  _import_id uuid REFERENCES import_audit.runs(id),
  _source_row bigint,
  "documentosID" numeric(20,0),
  "Codigo" text,
  "Descricao" text,
  "stock" smallint,
  "obriga_macanico" boolean,
  UNIQUE (_import_id, _source_row)
);

CREATE UNIQUE INDEX "ix_340e8d4a4f607069" ON app."documentos" ("documentosID");

CREATE INDEX "ix_bd06d5af7ba9ab6e" ON app."documentos" ("Codigo");

CREATE INDEX "ix_b4e1c259f66e8fe4" ON app."documentos" ("Descricao");

CREATE INDEX "ix_cead7ad1f922e86e" ON app."documentos" ("stock");

CREATE TABLE app."cab_stocks" (
  _row_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  _import_id uuid REFERENCES import_audit.runs(id),
  _source_row bigint,
  "cab_stocksID" numeric(20,0),
  "documento_codigo" text,
  "documento_numero" numeric(20,0),
  "Descricao" text,
  "data" text,
  "mecanico" smallint,
  "DocumentosID" numeric(20,0),
  "MecanicosID" numeric(20,0),
  UNIQUE (_import_id, _source_row)
);

CREATE UNIQUE INDEX "ix_09cd7cb321724694" ON app."cab_stocks" ("cab_stocksID");

CREATE INDEX "ix_4f7f637c165d54a4" ON app."cab_stocks" ("documento_codigo");

CREATE INDEX "ix_0bbc41b386a793af" ON app."cab_stocks" ("documento_numero");

CREATE INDEX "ix_f54a45976245d1b3" ON app."cab_stocks" ("data");

CREATE INDEX "ix_23b9cedb9fc6c627" ON app."cab_stocks" ("mecanico");

CREATE INDEX "ix_126b69bafae71fd9" ON app."cab_stocks" ("DocumentosID");

CREATE INDEX "ix_49c27f38f05e59bc" ON app."cab_stocks" ("documento_codigo", "documento_numero");

CREATE INDEX "ix_78598b7684b229c6" ON app."cab_stocks" ("MecanicosID");

CREATE TABLE app."lin_stocks" (
  _row_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  _import_id uuid REFERENCES import_audit.runs(id),
  _source_row bigint,
  "lin_stocksID" numeric(20,0),
  "documento_codigo" text,
  "documento_numero" numeric(20,0),
  "linha" bigint,
  "artigo" text,
  "descricao_artigo" text,
  "quantidade" numeric,
  "preco" numeric,
  "Documento_codigodocumento_numero" bytea,
  UNIQUE (_import_id, _source_row)
);

CREATE UNIQUE INDEX "ix_d672ed9a2fee52d6" ON app."lin_stocks" ("lin_stocksID");

CREATE INDEX "ix_7507191e888581a9" ON app."lin_stocks" ("documento_codigo");

CREATE INDEX "ix_b582628006ec9d48" ON app."lin_stocks" ("documento_numero");

CREATE INDEX "ix_026f680b76162b5f" ON app."lin_stocks" ("artigo");

CREATE INDEX "ix_559f04a4fc5fc523" ON app."lin_stocks" ("documento_codigo", "documento_numero", "linha");

CREATE TABLE app."estados_reparacao" (
  _row_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  _import_id uuid REFERENCES import_audit.runs(id),
  _source_row bigint,
  "estados_reparacaoID" numeric(20,0),
  "Codigo" text,
  "Descricao" text,
  "tipo" smallint,
  "Cor" bigint,
  "lancar_defa" boolean,
  "lancar_material" boolean,
  "confirmacao" boolean,
  "pedir_data_entrega" boolean,
  "pedir_data_pag" boolean,
  UNIQUE (_import_id, _source_row)
);

CREATE UNIQUE INDEX "ix_b5c172b3ab952a18" ON app."estados_reparacao" ("estados_reparacaoID");

CREATE INDEX "ix_9ddc1b6bae7450dc" ON app."estados_reparacao" ("Codigo");

CREATE INDEX "ix_c020b5f370fb53fe" ON app."estados_reparacao" ("Descricao");

CREATE INDEX "ix_78e940f0a03b2fd7" ON app."estados_reparacao" ("tipo");

CREATE TABLE app."estados_descritivos" (
  _row_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  _import_id uuid REFERENCES import_audit.runs(id),
  _source_row bigint,
  "estados_descritivosID" numeric(20,0),
  "Codigo" text,
  "Descricao" text,
  UNIQUE (_import_id, _source_row)
);

CREATE UNIQUE INDEX "ix_931990329831a366" ON app."estados_descritivos" ("estados_descritivosID");

CREATE INDEX "ix_a244b0a3ab611723" ON app."estados_descritivos" ("Codigo");

CREATE INDEX "ix_955eee4fb9b28a1c" ON app."estados_descritivos" ("Descricao");

CREATE TABLE app."Terminais" (
  _row_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  _import_id uuid REFERENCES import_audit.runs(id),
  _source_row bigint,
  "Codigo" text,
  "Descricao" text,
  "codbarras_inicio" smallint,
  "codbarras_fim" smallint,
  "quant_inicio" smallint,
  "quant_fim" smallint,
  "pasta_localizacao" text,
  "nome_ficheiro" text,
  UNIQUE (_import_id, _source_row)
);

CREATE INDEX "ix_33e84729d16848af" ON app."Terminais" ("Codigo");

CREATE TABLE app."sistema" (
  _row_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  _import_id uuid REFERENCES import_audit.runs(id),
  _source_row bigint,
  "Tempo_ordem_reparacao" numeric(20,0),
  "Tempo_materiais" numeric(20,0),
  "Tempo_tempos" numeric(20,0),
  "Data_inicio" integer,
  "encerrar_tempos1" text,
  "encerrar_tempos2" text,
  UNIQUE (_import_id, _source_row)
);

CREATE TABLE app."postos" (
  _row_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  _import_id uuid REFERENCES import_audit.runs(id),
  _source_row bigint,
  "Codigo" smallint,
  "Descricao" text,
  "terminal" text,
  "teste" text,
  UNIQUE (_import_id, _source_row)
);

CREATE UNIQUE INDEX "ix_ee7340adaf4f35b6" ON app."postos" ("Codigo");
