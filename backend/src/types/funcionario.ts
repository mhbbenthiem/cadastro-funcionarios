export interface CursoSuperiorInput {
  uf?: string;
  instituicao?: string;
  situacao?: string;
  tipo_instituicao?: string;
  nome_curso?: string;
  ano_inicio?: number;
  ano_conclusao?: number;
  diploma_url?: string;
  // Propriedade temporária no React para o arquivo selecionado
  diploma_file?: File | null;
}

export interface FuncionarioInput {
  // Dados Pessoais
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

  // Listas de Seleção (Checkboxes)
  deficiencias?: string[];

  // Endereço
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
  formacao_pedagogica?: string[];

  // Pós-Graduação
  pos_graduacao_tipo?: string;
  pos_graduacao_area?: string;
  pos_graduacao_ano_conclusao?: number;

  // Cursos Específicos
  cursos_especificos?: string[];

  // Situação Funcional
  situacao_funcional?: string;

  // Cursos Superiores (Até 3)
  cursos_superiores?: CursoSuperiorInput[];
  // Contato de emergência
  contato_emergencia_nome?: string;
  contato_emergencia_telefone?: string;
}