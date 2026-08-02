import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import { FuncionarioFormData, CursoSuperior } from './types/funcionario';

const API_URL = 'http://localhost:3001/api/funcionarios';

const initialFormState: FuncionarioFormData = {
  nome_completo: '',
  data_nascimento: '',
  sexo: '',
  cor_raca: '',
  email: '',
  matricula: '',
  turno: '',
  telefone_celular: '',
  nome_mae: '',
  nacionalidade: 'Brasileira',
  pais_origem: 'Brasil',
  uf_naturalidade: '',
  municipio_naturalidade: '',
  deficiencias: [],
  cep: '',
  uf: '',
  municipio: '',
  endereco: '',
  bairro: '',
  numero: '',
  complemento: '',
  zona_residencial: '',
  localizacao_diferenciada: 'Não está em localização diferenciada',
  rg_numero: '',
  rg_data_expedicao: '',
  rg_complemento: '',
  rg_uf: '',
  rg_orgao_emissor: '',
  cpf: '',
  escolaridade_nivel: '',
  ensino_medio_tipo: '',
  formacao_pedagogica: [],
  pos_graduacao_tipo: '',
  pos_graduacao_area: '',
  pos_graduacao_ano_conclusao: '',
  cursos_especificos: [],
  situacao_funcional: '',
  cursos_superiores: []
};

function App() {
  const [formData, setFormData] = useState<FuncionarioFormData>(initialFormState);
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' });
  const [loading, setLoading] = useState(false);

  // Manipulador de inputs simples (text, date, select)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manipulador de checkboxes de múltiplas escolhas (Arrays)
  const handleCheckboxArray = (arrayName: 'deficiencias' | 'formacao_pedagogica' | 'cursos_especificos', value: string) => {
    setFormData(prev => {
      const list = prev[arrayName];
      const updatedList = list.includes(value)
        ? list.filter(item => item !== value)
        : [...list, value];
      return { ...prev, [arrayName]: updatedList };
    });
  };

  // Manipulação de Cursos Superiores (Adicionar, remover e atualizar)
  const handleAddCurso = () => {
    if (formData.cursos_superiores.length < 3) {
      setFormData(prev => ({
        ...prev,
        cursos_superiores: [
          ...prev.cursos_superiores,
          { uf: '', instituicao: '', situacao: '', tipo_instituicao: '', nome_curso: '', ano_inicio: '', ano_conclusao: '' }
        ]
      }));
    }
  };

  const handleRemoveCurso = (index: number) => {
    setFormData(prev => ({
      ...prev,
      cursos_superiores: prev.cursos_superiores.filter((_, i) => i !== index)
    }));
  };

  const handleCursoChange = (index: number, field: keyof CursoSuperior, value: string) => {
    setFormData(prev => {
      const novosCursos = [...prev.cursos_superiores];
      novosCursos[index] = { ...novosCursos[index], [field]: value };
      return { ...prev, cursos_superiores: novosCursos };
    });
  };

  // Envio do Formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ message: '', type: '' });
    setLoading(true);

    try {
      await axios.post(API_URL, formData);
      setStatus({ message: 'Funcionário cadastrado com sucesso!', type: 'success' });
      setFormData(initialFormState);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Erro ao realizar cadastro. Tente novamente.';
      setStatus({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Cadastro de Funcionários</h1>

      <form onSubmit={handleSubmit}>
        {/* DADOS PESSOAIS */}
        <fieldset>
          <legend>Dados Pessoais</legend>
          <div className="grid">
            <div className="field">
              <label>Nome Completo *</label>
              <input type="text" name="nome_completo" value={formData.nome_completo} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Data de Nascimento</label>
              <input type="date" name="data_nascimento" value={formData.data_nascimento} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Sexo</label>
              <select name="sexo" value={formData.sexo} onChange={handleChange}>
                <option value="">Selecione</option>
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
              </select>
            </div>
            <div className="field">
              <label>Cor/Raça</label>
              <input type="text" name="cor_raca" value={formData.cor_raca} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Matrícula</label>
              <input type="text" name="matricula" value={formData.matricula} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Turno</label>
              <select name="turno" value={formData.turno} onChange={handleChange}>
                <option value="">Selecione</option>
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Ambos">Ambos</option>
              </select>
            </div>
            <div className="field">
              <label>Telefone Celular</label>
              <input type="text" name="telefone_celular" value={formData.telefone_celular} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Nome Completo da Mãe</label>
              <input type="text" name="nome_mae" value={formData.nome_mae} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Nacionalidade</label>
              <input type="text" name="nacionalidade" value={formData.nacionalidade} onChange={handleChange} />
            </div>
            <div className="field">
              <label>UF Naturalidade</label>
              <input type="text" name="uf_naturalidade" value={formData.uf_naturalidade} onChange={handleChange} maxLength={2} />
            </div>
            <div className="field">
              <label>Município Naturalidade</label>
              <input type="text" name="municipio_naturalidade" value={formData.municipio_naturalidade} onChange={handleChange} />
            </div>
          </div>
        </fieldset>

        {/* DEFICIÊNCIAS */}
        <fieldset>
          <legend>Tipo de Deficiência do Funcionário</legend>
          <div className="checkbox-group">
            {[
              'Cegueira', 'Baixa visão', 'Surdez', 'Deficiência auditiva', 
              'Surdocegueira', 'Deficiência Física', 'Deficiência Intelectual', 
              'Deficiência múltipla', 'Altas Habilidades/Superdotação', 
              'Transtorno do Espectro Autista', 'NÃO TEM'
            ].map(def => (
              <label key={def} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={formData.deficiencias.includes(def)}
                  onChange={() => handleCheckboxArray('deficiencias', def)}
                />
                {def}
              </label>
            ))}
          </div>
        </fieldset>

        {/* ENDEREÇO */}
        <fieldset>
          <legend>Endereço Residencial</legend>
          <div className="grid">
            <div className="field"><label>CEP</label><input type="text" name="cep" value={formData.cep} onChange={handleChange} /></div>
            <div className="field"><label>UF</label><input type="text" name="uf" value={formData.uf} onChange={handleChange} maxLength={2} /></div>
            <div className="field"><label>Município</label><input type="text" name="municipio" value={formData.municipio} onChange={handleChange} /></div>
            <div className="field"><label>Endereço</label><input type="text" name="endereco" value={formData.endereco} onChange={handleChange} /></div>
            <div className="field"><label>Bairro</label><input type="text" name="bairro" value={formData.bairro} onChange={handleChange} /></div>
            <div className="field"><label>Número</label><input type="text" name="numero" value={formData.numero} onChange={handleChange} /></div>
            <div className="field"><label>Complemento</label><input type="text" name="complemento" value={formData.complemento} onChange={handleChange} /></div>
            <div className="field">
              <label>Zona Residencial</label>
              <select name="zona_residencial" value={formData.zona_residencial} onChange={handleChange}>
                <option value="">Selecione</option>
                <option value="Urbana">Urbana</option>
                <option value="Rural">Rural</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* DOCUMENTAÇÃO */}
        <fieldset>
          <legend>Documentação</legend>
          <div className="grid">
            <div className="field"><label>CPF *</label><input type="text" name="cpf" value={formData.cpf} onChange={handleChange} required /></div>
            <div className="field"><label>Nº Identidade (RG)</label><input type="text" name="rg_numero" value={formData.rg_numero} onChange={handleChange} /></div>
            <div className="field"><label>Data Expedição</label><input type="date" name="rg_data_expedicao" value={formData.rg_data_expedicao} onChange={handleChange} /></div>
            <div className="field"><label>UF RG</label><input type="text" name="rg_uf" value={formData.rg_uf} onChange={handleChange} maxLength={2} /></div>
            <div className="field"><label>Órgão Emissor</label><input type="text" name="rg_orgao_emissor" value={formData.rg_orgao_emissor} onChange={handleChange} /></div>
          </div>
        </fieldset>

        {/* ESCOLARIDADE */}
        <fieldset>
          <legend>Escolaridade</legend>
          <div className="grid">
            <div className="field">
              <label>Maior Nível Concluído</label>
              <select name="escolaridade_nivel" value={formData.escolaridade_nivel} onChange={handleChange}>
                <option value="">Selecione</option>
                <option value="Não concluiu o Ensino Fundamental">Não concluiu o Ensino Fundamental</option>
                <option value="Fundamental Completo">Fundamental Completo</option>
                <option value="Ensino Médio">Ensino Médio</option>
                <option value="Superior">Superior</option>
              </select>
            </div>
            <div className="field">
              <label>Tipo de Ensino Médio Cursado</label>
              <select name="ensino_medio_tipo" value={formData.ensino_medio_tipo} onChange={handleChange}>
                <option value="">Selecione</option>
                <option value="Formação Geral">Formação Geral</option>
                <option value="Modalidade normal/magistério">Modalidade normal/magistério</option>
                <option value="Curso técnico">Curso técnico</option>
                <option value="Magistério indígena – modalidade normal">Magistério indígena – modalidade normal</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* CURSOS SUPERIORES */}
        <fieldset>
          <legend>Cursos Superiores (Máximo 3)</legend>
          {formData.cursos_superiores.map((curso, index) => (
            <div key={index} style={{ borderBottom: '1px solid #ccc', paddingBottom: '15px', marginBottom: '15px' }}>
              <h4>Curso {index + 1}</h4>
              <div className="grid">
                <div className="field"><label>Nome do Curso</label><input type="text" value={curso.nome_curso} onChange={e => handleCursoChange(index, 'nome_curso', e.target.value)} /></div>
                <div className="field"><label>Instituição</label><input type="text" value={curso.instituicao} onChange={e => handleCursoChange(index, 'instituicao', e.target.value)} /></div>
                <div className="field"><label>UF</label><input type="text" value={curso.uf} onChange={e => handleCursoChange(index, 'uf', e.target.value)} maxLength={2} /></div>
                <div className="field">
                  <label>Situação</label>
                  <select value={curso.situacao} onChange={e => handleCursoChange(index, 'situacao', e.target.value)}>
                    <option value="">Selecione</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Em andamento">Em andamento</option>
                  </select>
                </div>
                <div className="field">
                  <label>Tipo de Instituição</label>
                  <select value={curso.tipo_instituicao} onChange={e => handleCursoChange(index, 'tipo_instituicao', e.target.value)}>
                    <option value="">Selecione</option>
                    <option value="Pública">Pública</option>
                    <option value="Privada">Privada</option>
                  </select>
                </div>
                <div className="field"><label>Ano Início</label><input type="number" value={curso.ano_inicio} onChange={e => handleCursoChange(index, 'ano_inicio', e.target.value)} /></div>
                <div className="field"><label>Ano Conclusão</label><input type="number" value={curso.ano_conclusao} onChange={e => handleCursoChange(index, 'ano_conclusao', e.target.value)} /></div>
              </div>
              <button type="button" className="btn-remove" onClick={() => handleRemoveCurso(index)}>Remover Curso</button>
            </div>
          ))}

          {formData.cursos_superiores.length < 3 && (
            <button type="button" className="btn-add" onClick={handleAddCurso}>+ Adicionar Curso Superior</button>
          )}
        </fieldset>

        {/* SITUAÇÃO FUNCIONAL */}
        <fieldset>
          <legend>Situação Funcional / Regime de Contratação</legend>
          <div className="field">
            <select name="situacao_funcional" value={formData.situacao_funcional} onChange={handleChange}>
              <option value="">Selecione</option>
              <option value="Concursado/efetivo/estável">Concursado/efetivo/estável</option>
              <option value="Contrato temporário">Contrato temporário</option>
              <option value="Contrato terceirizado">Contrato terceirizado</option>
              <option value="Contrato CLT">Contrato CLT</option>
            </select>
          </div>
        </fieldset>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar Funcionário'}
        </button>
      </form>

      {status.message && (
        <div className={`status-message ${status.type}`}>
          {status.message}
        </div>
      )}
    </div>
  );
}

export default App;