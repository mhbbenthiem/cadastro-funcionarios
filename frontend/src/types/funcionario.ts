export interface CursoSuperior {
  uf?: string;
  instituicao?: string;
  situacao?: string;
  tipo_instituicao?: string;
  nome_curso?: string;
  ano_inicio?: number | string;
  ano_conclusao?: number | string;
}

export interface FuncionarioFormData {
  nome_completo: string;
  data_nascimento?: string;
  sexo?: string;
  cor_raca?: string;
  email?: string;
  matricula?: string;
  turno?: string;
  telefone_celular?: string;
  nome_mae?: string;
  nacionalidade?: string;
  pais_origem?: string;
  uf_naturalidade?: string;
  municipio_naturalidade?: string;

  deficiencias: string[];

  cep?: string;
  uf?: string;
  municipio?: string;
  endereco?: string;
  bairro?: string;
  numero?: string;
  complemento?: string;
  zona_residencial?: string;
  localizacao_diferenciada?: string;

  rg_numero?: string;
  rg_data_expedicao?: string;
  rg_complemento?: string;
  rg_uf?: string;
  rg_orgao_emissor?: string;
  cpf: string;

  escolaridade_nivel?: string;
  ensino_medio_tipo?: string;

  formacao_pedagogica: string[];

  pos_graduacao_tipo?: string;
  pos_graduacao_area?: string;
  pos_graduacao_ano_conclusao?: number | string;

  cursos_especificos: string[];

  situacao_funcional?: string;

  cursos_superiores: CursoSuperior[];
}