export interface CursoSuperior {
  id?: string;
  uf?: string;
  instituicao?: string;
  situacao?: string;
  tipo_instituicao?: string;
  nome_curso?: string;
  ano_inicio?: number | string | null;
  ano_conclusao?: number | string | null;
  diploma_file?: File;
  diploma_url?: string;
}

export interface FuncionarioFormData {
  id?: string;
  created_at?: string;
  ativo?: boolean;

  // Dados Pessoais
  nome_completo: string;
  data_nascimento?: string;
  sexo?: string;
  cor_raca?: string;
  email?: string;
  
  // Turnos e Matrículas
  turno_manha?: boolean;
  turno_tarde?: boolean;
  matricula_manha?: string;
  matricula_tarde?: string;

  telefone_celular?: string;
  nome_mae?: string;
  nacionalidade?: string;
  pais_origem?: string;
  uf_naturalidade?: string;
  municipio_naturalidade?: string;

  // Saúde / Deficiência
  deficiencias: string[];

  // Endereço e Localização
  cep?: string;
  uf?: string;
  municipio?: string;
  endereco?: string;
  bairro?: string;
  numero?: string;
  complemento?: string;
  zona_residencial?: string;
  localizacao_diferenciada?: string;

  // Documentação
  rg_numero?: string;
  rg_data_expedicao?: string;
  rg_complemento?: string;
  rg_uf?: string;
  rg_orgao_emissor?: string;
  cpf: string;

  // Escolaridade
  escolaridade_nivel?: string;
  ensino_medio_tipo?: string;

  // Cursos Superiores
  cursos_superiores: CursoSuperior[];

  // Formações / Cursos
  formacao_pedagogica: string[];
  
  pos_graduacao_tipo?: string;
  pos_graduacao_area?: string;
  pos_graduacao_ano_conclusao?: number | string | null;

  cursos_especificos: string[];

  // Situação Funcional
  situacao_funcional?: string;
  // Contato de emergência
  contato_emergencia_nome?: string;
  contato_emergencia_telefone?: string;  
}