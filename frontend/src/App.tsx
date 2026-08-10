import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import { FuncionarioFormData } from './types/funcionario';
import AdminPanel from './AdminPanel';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3001'
  : 'https://cadastro-funcionarios-eight.vercel.app';
const OPCOES_DEFICIENCIAS = [
  'Cegueira', 'Baixa visão', 'Surdez', 'Deficiência auditiva',
  'Surdocegueira', 'Deficiência Física', 'Deficiência Intelectual',
  'Deficiência múltipla', 'Altas Habilidades/Superdotação',
  'Transtorno do Espectro Autista', 'NÃO TEM'
];

const OPCOES_FORMACAO_PEDAGOGICA = [
  'Química', 'Física', 'Matemática', 'Biologia', 'Ciências',
  'Língua/Literatura Portuguesa', 'Língua/Literatura estrangeira - Inglês',
  'Língua/Literatura estrangeira – Espanhol', 'Língua/Literatura estrangeira – outra',
  'Arte (Educação Artística, Teatro, Dança, Música, Arte Plásticas e outras)',
  'Educação Física', 'História', 'Geografia', 'Filosofia',
  'Informática/Computação', 'Áreas do conhecimento profissionalizantes',
  'Libras', 'Áreas do conhecimento pedagógicas', 'Ensino religioso',
  'Língua indígena', 'Estudos Sociais', 'Sociologia',
  'Língua/Literatura estrangeira – Francês', 'Língua Portuguesa como Segunda Língua',
  'Estágio curricular supervisionado', 'Outras Áreas do conhecimento'
];

const OPCOES_CURSOS_ESPECIFICOS = [
  'Creche (0 a 3 anos)', 'Pré-Escola(4 e 5 anos)', 'Anos iniciais do ensino fundamental',
  'Anos finais do ensino fundamental', 'Ensino Médio', 'Educação de jovens e adultos',
  'Educação Especial', 'Educação Indígena', 'Educação do campo',
  'Educação ambiental', 'Educação em direitos humanos', 'Gênero e diversidade sexual',
  'Direitos da criança e adolescentes', 'Educ. p/ as rel.étnico-raciais e hist..cult,Afro-Brasileira/Africana',
  'Gestão escolar', 'Outros', 'Nenhum'
];

const estadoInicial: FuncionarioFormData = {
  nome_completo: '',
  data_nascimento: '',
  sexo: '',
  cor_raca: '',
  email: '',
  turno_manha: false,
  turno_tarde: false,
  matricula_manha: '',
  matricula_tarde: '',
  telefone_celular: '',
  nome_mae: '',
  nacionalidade: 'Brasileira',
  pais_origem: 'Brasil',
  uf_naturalidade: '',
  municipio_naturalidade: '',
  deficiencias: ['NÃO TEM'],
  cep: '',
  uf: '',
  municipio: '',
  endereco: '',
  bairro: '',
  numero: '',
  complemento: '',
  zona_residencial: 'Urbana',
  localizacao_diferenciada: 'Não está em localização diferenciada',
  rg_numero: '',
  rg_data_expedicao: '',
  rg_complemento: '',
  rg_uf: '',
  rg_orgao_emissor: '',
  cpf: '',
  escolaridade_nivel: '',
  ensino_medio_tipo: '',
  cursos_superiores: [{ uf: '', instituicao: '', situacao: '', tipo_instituicao: '', nome_curso: '', ano_inicio: '', ano_conclusao: '' }],
  formacao_pedagogica: [],
  pos_graduacao_tipo: 'Não tem pós-graduação concluída',
  pos_graduacao_area: '',
  pos_graduacao_ano_conclusao: '',
  cursos_especificos: [],
  situacao_funcional: '',
  contato_emergencia_nome: '',
  contato_emergencia_telefone: '',
};

export const App: React.FC = () => {
  const [abaAtiva, setAbaAtiva] = useState<'formulario' | 'admin'>('formulario');

  const [formData, setFormData] = useState<FuncionarioFormData>(estadoInicial);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [carregando, setCarregando] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Gerenciador de Deficiências
  const handleDeficienciaChange = (opcao: string) => {
    const atuais = formData.deficiencias || [];
    if (opcao === 'NÃO TEM') {
      setFormData({ ...formData, deficiencias: ['NÃO TEM'] });
      return;
    }
    const semNaoTem = atuais.filter(item => item !== 'NÃO TEM');
    if (semNaoTem.includes(opcao)) {
      const novas = semNaoTem.filter(item => item !== opcao);
      setFormData({ ...formData, deficiencias: novas.length === 0 ? ['NÃO TEM'] : novas });
    } else {
      setFormData({ ...formData, deficiencias: [...semNaoTem, opcao] });
    }
  };

  // Gerenciador de Formação Pedagógica (Máximo 3)
  const handleFormacaoPedagogicaChange = (opcao: string) => {
    const atuais = formData.formacao_pedagogica || [];
    if (atuais.includes(opcao)) {
      setFormData({ ...formData, formacao_pedagogica: atuais.filter(item => item !== opcao) });
    } else {
      if (atuais.length >= 3) {
        alert('Você só pode selecionar no máximo 3 opções de Formação Pedagógica.');
        return;
      }
      setFormData({ ...formData, formacao_pedagogica: [...atuais, opcao] });
    }
  };

  // Gerenciador de Cursos Específicos
  const handleCursosEspecificosChange = (opcao: string) => {
    const atuais = formData.cursos_especificos || [];
    if (opcao === 'Nenhum') {
      setFormData({ ...formData, cursos_especificos: ['Nenhum'] });
      return;
    }
    const semNenhum = atuais.filter(item => item !== 'Nenhum');
    if (semNenhum.includes(opcao)) {
      setFormData({ ...formData, cursos_especificos: semNenhum.filter(item => item !== opcao) });
    } else {
      setFormData({ ...formData, cursos_especificos: [...semNenhum, opcao] });
    }
  };

  // Cursos Superiores Dinâmicos
  const handleCursoChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const novosCursos = [...formData.cursos_superiores];
    novosCursos[index] = { ...novosCursos[index], [name]: value };
    setFormData({ ...formData, cursos_superiores: novosCursos });
  };

  // GERENCIADOR DE SELEÇÃO DE ARQUIVO PDF DO DIPLOMA (NOVO)
  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Por favor, selecione um arquivo no formato PDF.');
        e.target.value = '';
        return;
      }
      const novosCursos = [...formData.cursos_superiores];
      novosCursos[index] = { ...novosCursos[index], diploma_file: file };
      setFormData({ ...formData, cursos_superiores: novosCursos });
    }
  };

  const adicionarCurso = () => {
    if (formData.cursos_superiores.length < 3) {
      setFormData({
        ...formData,
        cursos_superiores: [
          ...formData.cursos_superiores,
          { uf: '', instituicao: '', situacao: '', tipo_instituicao: '', nome_curso: '', ano_inicio: '', ano_conclusao: '' }
        ]
      });
    }
  };

  const removerCurso = (index: number) => {
    const novosCursos = formData.cursos_superiores.filter((_, i) => i !== index);
    setFormData({ ...formData, cursos_superiores: novosCursos });
  };

  // Busca do endereço via ViaCEP
  const buscarCep = async (cepDigitado: string) => {
    const cepLimpo = cepDigitado.replace(/\D/g, '');

    if (cepLimpo.length === 8) {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        
        if (!response.data.erro) {
          setFormData(prev => ({
            ...prev,
            endereco: response.data.logradouro || prev.endereco,
            bairro: response.data.bairro || prev.bairro,
            municipio: response.data.localidade || prev.municipio,
            uf: response.data.uf || prev.uf
          }));
        } else {
          alert('CEP não encontrado. Por favor, verifique o número digitado.');
        }
      } catch (error) {
        console.error('Erro ao consultar o ViaCEP:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setMensagem(null);
      setCarregando(true);

      try {
        const formDataPayload = new FormData();

        // Envia os dados textuais no campo 'dados'
        formDataPayload.append('dados', JSON.stringify(formData));

        // Anexa os arquivos dos diplomas
        formData.cursos_superiores.forEach((curso) => {
          if (curso.diploma_file) {
            formDataPayload.append('diplomas', curso.diploma_file);
          } else {
            formDataPayload.append('diplomas', new Blob([]), '');
          }
        });

        // Axios ajusta os cabeçalhos automaticamente quando recebe FormData (NÃO passe headers manuais)
        const response = await axios.post(
          `${API_BASE_URL}/api/funcionarios`,
          formDataPayload
        );

        setMensagem({ tipo: 'sucesso', texto: response.data.message || 'Funcionário cadastrado com sucesso!' });
        setFormData(estadoInicial);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error: any) {
        setMensagem({
          tipo: 'erro',
          texto: error.response?.data?.error || 'Erro ao cadastrar funcionário. Verifique os dados.'
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } finally {
        setCarregando(false);
      }
    };
  return (
    <div className="container">
      {/* BARRA DE NAVEGAÇÃO DE ABAS */}
      <nav className="nav-tabs">
        <button
          type="button"
          className={`tab-button ${abaAtiva === 'formulario' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('formulario')}
        >
           Novo Cadastro
        </button>
        <button
          type="button"
          className={`tab-button ${abaAtiva === 'admin' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('admin')}
        >
           Painel do Administrador
        </button>
      </nav>

      {/* RENDERIZAÇÃO CONDICIONAL */}
      {abaAtiva === 'admin' ? (
        <AdminPanel />
      ) : (
        <>
          <h2>Cadastro de Funcionários - SME</h2>

          {mensagem && (
            <div className={`alerta ${mensagem.tipo}`}>
              {mensagem.texto}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 1. DADOS PESSOAIS */}
            <h3>1. Dados Pessoais</h3>
            <div className="grid">
              <div className="span-2">
                <label>Nome Completo *</label>
                <input type="text" name="nome_completo" value={formData.nome_completo} onChange={handleChange} required />
              </div>
              <div>
                <label>Data de Nascimento *</label>
                <input type="date" name="data_nascimento" value={formData.data_nascimento || ''} onChange={handleChange} required />
              </div>
              <div>
                <label>Sexo</label>
                <select name="sexo" value={formData.sexo || ''} onChange={handleChange}>
                  <option value="">Selecione...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>
              <div>
                <label>Cor / Raça</label>
                <select name="cor_raca" value={formData.cor_raca || ''} onChange={handleChange}>
                  <option value="">Selecione...</option>
                  <option value="Branca">Branca</option>
                  <option value="Preta">Preta</option>
                  <option value="Parda">Parda</option>
                  <option value="Amarela">Amarela</option>
                  <option value="Indígena">Indígena</option>
                </select>
              </div>
              <div>
                <label>E-mail *</label>
                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required />
              </div>
              <div>
                <label>Telefone Celular</label>
                <input type="text" name="telefone_celular" value={formData.telefone_celular || ''} onChange={handleChange} />
              </div>
              <div className="span-2">
                <label>Nome Completo da Mãe</label>
                <input type="text" name="nome_mae" value={formData.nome_mae || ''} onChange={handleChange} />
              </div>
              <div>
                <label>Nacionalidade</label>
                <input type="text" name="nacionalidade" value={formData.nacionalidade || ''} onChange={handleChange} />
              </div>
              <div>
                <label>País de Origem</label>
                <input type="text" name="pais_origem" value={formData.pais_origem || ''} onChange={handleChange} />
              </div>
              <div>
                <label>UF Naturalidade (Estado)</label>
                <input type="text" name="uf_naturalidade" value={formData.uf_naturalidade || ''} onChange={handleChange} />
              </div>
              <div>
                <label>Naturalidade (Município)</label>
                <input type="text" name="municipio_naturalidade" value={formData.municipio_naturalidade || ''} onChange={handleChange} />
              </div>
            </div>

            {/* CONTATO DE EMERGÊNCIA */}
            <h4>Contato de Emergência</h4>
            <div className="grid">
              <div>
                <label>Nome do Contato de Emergência</label>
                <input 
                  type="text" 
                  name="contato_emergencia_nome" 
                  value={formData.contato_emergencia_nome || ''} 
                  onChange={handleChange} 
                />
              </div>
              <div>
                <label>Telefone do Contato</label>
                <input 
                  type="text" 
                  name="contato_emergencia_telefone" 
                  value={formData.contato_emergencia_telefone || ''} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            {/* TURNOS E MATRÍCULAS */}
            <h4>Turno de Atuação e Matrícula(s)</h4>
            <div className="grid">
              <div>
                <label>Turno(s)</label>
                <div className="checkbox-group">
                  <label className="checkbox-item">
                    <input type="checkbox" name="turno_manha" checked={formData.turno_manha || false} onChange={handleChange} />
                    Manhã
                  </label>
                  <label className="checkbox-item">
                    <input type="checkbox" name="turno_tarde" checked={formData.turno_tarde || false} onChange={handleChange} />
                    Tarde
                  </label>
                </div>
              </div>
              {formData.turno_manha && (
                <div>
                  <label>Matrícula (Turno Manhã)</label>
                  <input type="text" name="matricula_manha" value={formData.matricula_manha || ''} onChange={handleChange} />
                </div>
              )}
              {formData.turno_tarde && (
                <div>
                  <label>Matrícula (Turno Tarde)</label>
                  <input type="text" name="matricula_tarde" value={formData.matricula_tarde || ''} onChange={handleChange} />
                </div>
              )}
            </div>

            {/* DEFICIÊNCIAS */}
            <h4>Tipo de Deficiência do Funcionário</h4>
            <div className="checkbox-grid">
              {OPCOES_DEFICIENCIAS.map(item => (
                <label key={item} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={(formData.deficiencias || []).includes(item)}
                    onChange={() => handleDeficienciaChange(item)}
                  />
                  {item}
                </label>
              ))}
            </div>

            {/* 2. ENDEREÇO E LOCALIZAÇÃO */}
            <h3>2. Endereço Residencial</h3>
            <div className="grid">
              <div>
                <label>CEP</label>
                <input
                  type="text"
                  name="cep"
                  maxLength={9}
                  placeholder="00000-000"
                  value={formData.cep || ''}
                  onChange={(e) => {
                    handleChange(e);
                    const valor = e.target.value.replace(/\D/g, '');
                    if (valor.length === 8) {
                      buscarCep(valor);
                    }
                  }}
                  onBlur={(e) => buscarCep(e.target.value)}
                />
              </div>
              <div className="span-2">
                <label>Endereço</label>
                <input type="text" name="endereco" value={formData.endereco || ''} onChange={handleChange} />
              </div>
              <div>
                <label>Número</label>
                <input type="text" name="numero" value={formData.numero || ''} onChange={handleChange} />
              </div>
              <div>
                <label>Complemento</label>
                <input type="text" name="complemento" value={formData.complemento || ''} onChange={handleChange} />
              </div>
              <div>
                <label>Bairro</label>
                <input type="text" name="bairro" value={formData.bairro || ''} onChange={handleChange} />
              </div>
              <div>
                <label>Município</label>
                <input type="text" name="municipio" value={formData.municipio || ''} onChange={handleChange} />
              </div>
              <div>
                <label>UF</label>
                <input type="text" name="uf" value={formData.uf || ''} onChange={handleChange} />
              </div>
              <div>
                <label>Zona Residencial</label>
                <select name="zona_residencial" value={formData.zona_residencial || ''} onChange={handleChange}>
                  <option value="Urbana">Urbana</option>
                  <option value="Rural">Rural</option>
                </select>
              </div>
              <div className="span-2">
                <label>Localização Diferenciada</label>
                <select name="localizacao_diferenciada" value={formData.localizacao_diferenciada || ''} onChange={handleChange}>
                  <option value="Não está em localização diferenciada">Não está em localização diferenciada</option>
                  <option value="Área de Assentamento">Área de Assentamento</option>
                  <option value="Terra Indígena">Terra Indígena</option>
                  <option value="Área Remanescente de Quilombos">Área Remanescente de Quilombos</option>
                </select>
              </div>
            </div>

            {/* 3. DOCUMENTAÇÃO */}
            <h3>3. Documentação</h3>
            <div className="grid">
              <div>
                <label>CPF *</label>
                <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} required />
              </div>
              <div>
                <label>Nº Identidade (RG)</label>
                <input type="text" name="rg_numero" value={formData.rg_numero || ''} onChange={handleChange} />
              </div>
              <div>
                <label>Data de Expedição</label>
                <input type="date" name="rg_data_expedicao" value={formData.rg_data_expedicao || ''} onChange={handleChange} />
              </div>
              <div>
                <label>Órgão Emissor</label>
                <input type="text" name="rg_orgao_emissor" value={formData.rg_orgao_emissor || ''} onChange={handleChange} />
              </div>
              <div>
                <label>UF da Identidade</label>
                <input type="text" name="rg_uf" value={formData.rg_uf || ''} onChange={handleChange} />
              </div>
              <div>
                <label>Complemento Identidade</label>
                <input type="text" name="rg_complemento" value={formData.rg_complemento || ''} onChange={handleChange} />
              </div>
            </div>

            {/* 4. ESCOLARIDADE E CURSOS */}
            <h3>4. Escolaridade e Formação</h3>
            <div className="grid">
              <div>
                <label>Maior Nível de Escolaridade</label>
                <select name="escolaridade_nivel" value={formData.escolaridade_nivel || ''} onChange={handleChange}>
                  <option value="">Selecione...</option>
                  <option value="Não concluiu o Ensino Fundamental">Não concluiu o Ensino Fundamental</option>
                  <option value="Fundamental Completo">Fundamental Completo</option>
                  <option value="Ensino Médio">Ensino Médio</option>
                  <option value="Superior">Superior</option>
                </select>
              </div>
              <div>
                <label>Tipo de Ensino Médio Cursado</label>
                <select name="ensino_medio_tipo" value={formData.ensino_medio_tipo || ''} onChange={handleChange}>
                  <option value="">Selecione...</option>
                  <option value="Formação Geral">Formação Geral</option>
                  <option value="Modalidade normal/magistério">Modalidade normal/magistério</option>
                  <option value="Curso técnico">Curso técnico</option>
                  <option value="Magistério indígena – modalidade normal">Magistério indígena – modalidade normal</option>
                </select>
              </div>
            </div>

            {/* CURSOS SUPERIORES DINÂMICOS */}
            <h4>Curso(s) Superior(es)</h4>
            <p className="instrucao">Atenção: Não precisa preencher mais de uma vez caso seja a mesma informação.</p>
            
            {formData.cursos_superiores.map((curso, index) => (
              <div key={index} className="curso-card">
                <h4>Curso Superior {index + 1}</h4>
                <div className="grid">
                  <div className="span-2">
                    <label>Nome do Curso</label>
                    <input type="text" name="nome_curso" value={curso.nome_curso || ''} onChange={(e) => handleCursoChange(index, e)} />
                  </div>
                  <div className="span-2">
                    <label>Instituição</label>
                    <input type="text" name="instituicao" value={curso.instituicao || ''} onChange={(e) => handleCursoChange(index, e)} />
                  </div>
                  <div>
                    <label>Situação</label>
                    <select name="situacao" value={curso.situacao || ''} onChange={(e) => handleCursoChange(index, e)}>
                      <option value="">Selecione...</option>
                      <option value="Concluído">Concluído</option>
                      <option value="Em andamento">Em andamento</option>
                    </select>
                  </div>
                  <div>
                    <label>Tipo de Instituição</label>
                    <select name="tipo_instituicao" value={curso.tipo_instituicao || ''} onChange={(e) => handleCursoChange(index, e)}>
                      <option value="">Selecione...</option>
                      <option value="Pública">Pública</option>
                      <option value="Privada">Privada</option>
                    </select>
                  </div>
                  <div>
                    <label>UF</label>
                    <input type="text" name="uf" value={curso.uf || ''} onChange={(e) => handleCursoChange(index, e)} />
                  </div>
                  <div>
                    <label>Ano Início</label>
                    <input type="number" name="ano_inicio" value={curso.ano_inicio || ''} onChange={(e) => handleCursoChange(index, e)} />
                  </div>
                  <div>
                    <label>Ano Conclusão</label>
                    <input type="number" name="ano_conclusao" value={curso.ano_conclusao || ''} onChange={(e) => handleCursoChange(index, e)} />
                  </div>
                </div>

                <div className="span-2" style={{ marginTop: '12px' }}>
                  <label>Anexar Diploma (Somente PDF)</label>
                  <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={(e) => handleFileChange(index, e)} 
                  />
                  {curso.diploma_file && (
                    <small style={{ color: '#2e7d32', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>
                      ✓ Arquivo selecionado: {curso.diploma_file.name}
                    </small>
                  )}
                </div>

                {formData.cursos_superiores.length > 1 && (
                  <button type="button" className="btn-remover" onClick={() => removerCurso(index)}>Remover este curso</button>
                )}
              </div>
            ))}

            {formData.cursos_superiores.length < 3 && (
              <button type="button" className="btn-adicionar" onClick={adicionarCurso}>+ Adicionar Outro Curso Superior</button>
            )}

            {/* FORMAÇÃO PEDAGÓGICA */}
            <h4>Formação / Complementação Pedagógica (máximo 3 opções)</h4>
            <div className="checkbox-grid">
              {OPCOES_FORMACAO_PEDAGOGICA.map(item => (
                <label key={item} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={(formData.formacao_pedagogica || []).includes(item)}
                    onChange={() => handleFormacaoPedagogicaChange(item)}
                  />
                  {item}
                </label>
              ))}
            </div>

            {/* PÓS-GRADUAÇÃO */}
            <h4>Pós-Graduação</h4>
            <div className="grid">
              <div>
                <label>Nível da Pós-Graduação</label>
                <select name="pos_graduacao_tipo" value={formData.pos_graduacao_tipo || ''} onChange={handleChange}>
                  <option value="Não tem pós-graduação concluída">Não tem pós-graduação concluída</option>
                  <option value="Especialização">Especialização</option>
                  <option value="Mestrado/Doutorado">Mestrado/Doutorado</option>
                </select>
              </div>
              {formData.pos_graduacao_tipo !== 'Não tem pós-graduação concluída' && (
                <>
                  <div>
                    <label>Área</label>
                    <select name="pos_graduacao_area" value={formData.pos_graduacao_area || ''} onChange={handleChange}>
                      <option value="Educação">Educação</option>
                      <option value="Artes e Humanidades">Artes e Humanidades</option>
                      <option value="Ciências Sociais, Jornalismo e Informação">Ciências Sociais, Jornalismo e Informação</option>
                      <option value="Negócios, Administração e Direito">Negócios, Administração e Direito</option>
                      <option value="Ciências Naturais, Matemática e Estatística">Ciências Naturais, Matemática e Estatística</option>
                      <option value="Computação e Tecnologias da Informação e Comunicação">Computação e Tecnologias da Informação e Comunicação</option>
                      <option value="Engenharia, Produção e Construção">Engenharia, Produção e Construção</option>
                      <option value="Agricultura, Sivicultura, Pesca e Veterinária">Agricultura, Sivicultura, Pesca e Veterinária</option>
                      <option value="Saúde e Bem-Estar">Saúde e Bem-Estar</option>
                      <option value="Serviços">Serviços</option>
                      <option value="Não tem especialização concluída">Não tem especialização concluída</option>
                    </select>
                  </div>
                  <div>
                    <label>Ano de Conclusão</label>
                    <input type="number" name="pos_graduacao_ano_conclusao" value={formData.pos_graduacao_ano_conclusao || ''} onChange={handleChange} />
                  </div>
                </>
              )}
            </div>

            {/* OUTROS CURSOS ESPECÍFICOS */}
            <h4>Outros Cursos Específicos (Mínimo de 80h)</h4>
            <div className="checkbox-grid">
              {OPCOES_CURSOS_ESPECIFICOS.map(item => (
                <label key={item} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={(formData.cursos_especificos || []).includes(item)}
                    onChange={() => handleCursosEspecificosChange(item)}
                  />
                  {item}
                </label>
              ))}
            </div>

            {/* 5. SITUAÇÃO FUNCIONAL */}
            <h3>5. Situação Funcional / Regime de Contratação</h3>
            <blockquote className="nota-informativa">
              ℹ️ <strong>Observação:</strong> Todos os servidores da SME são concursados. Estagiários REMUNERADOS são considerados Contratos Temporários.
            </blockquote>

            <div className="grid">
              <div className="span-2">
                <label>Regime de Contratação *</label>
                <select name="situacao_funcional" value={formData.situacao_funcional || ''} onChange={handleChange} required>
                  <option value="">Selecione...</option>
                  <option value="Concursado/efetivo/estável">Concursado / Efetivo / Estável</option>
                  <option value="Contrato temporário">Contrato Temporário</option>
                  <option value="Contrato terceirizado">Contrato Terceirizado</option>
                  <option value="Contrato CLT">Contrato CLT</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={carregando}>
              {carregando ? 'Salvando...' : 'Salvar Cadastro de Funcionário'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default App;