import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { FuncionarioFormData } from './types/funcionario';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3001'
  : 'https://cadastro-funcionarios-eight.vercel.app';

export const AdminPanel: React.FC = () => {
  const [autenticado, setAutenticado] = useState<boolean>(false);
  const [senha, setSenha] = useState('');
  const [erroLogin, setErroLogin] = useState('');
  const [carregandoLogin, setCarregandoLogin] = useState(false);

  const [funcionarios, setFuncionarios] = useState<FuncionarioFormData[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  // Estados para Detalhes e Edição
  const [funcionarioDetalhe, setFuncionarioDetalhe] = useState<FuncionarioFormData | null>(null);
  const [modoEdicao, setModoEdicao] = useState<boolean>(false);
  const [formEdicao, setFormEdicao] = useState<FuncionarioFormData | null>(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroLogin('');
    setCarregandoLogin(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/login`, { senha });
      
      if (response.data.sucesso) {
        setAutenticado(true);
        carregarFuncionarios();
      }
    } catch (err: any) {
      setErroLogin(err.response?.data?.error || 'Erro ao realizar login.');
    } finally {
      setCarregandoLogin(false);
    }
  };

  const carregarFuncionarios = async () => {
    setCarregando(true);
    setErro('');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/funcionarios`);
      setFuncionarios(response.data);
    } catch (err: any) {
      console.error('Erro ao buscar funcionários:', err);
      setErro('Não foi possível carregar a lista de funcionários.');
    } finally {
      setCarregando(false);
    }
  };

  const handleToggleStatus = async (id: string | undefined, statusAtual: boolean | undefined) => {
    if (!id) return;
    
    const ehAtivo = statusAtual !== false; 
    
    if (!window.confirm(`Tem certeza que deseja ${ehAtivo ? 'DESATIVAR' : 'ATIVAR'} este funcionário?`)) {
      return;
    }

    try {
      await axios.patch(`${API_BASE_URL}/api/funcionarios/${id}/status`, {
        ativo: !ehAtivo
      });
      
      setFuncionarios(prev => prev.map(f => 
        f.id === id ? { ...f, ativo: !ehAtivo } : f
      ));

      if (funcionarioDetalhe?.id === id) {
        setFuncionarioDetalhe(prev => prev ? { ...prev, ativo: !ehAtivo } : null);
      }
      if (formEdicao?.id === id) {
        setFormEdicao(prev => prev ? { ...prev, ativo: !ehAtivo } : null);
      }
    } catch (err) {
      alert('Erro ao atualizar o status do funcionário.');
    }
  };

  const handleIniciarEdicao = (func: FuncionarioFormData) => {
    setFuncionarioDetalhe(func);
    setFormEdicao({ ...func });
    setModoEdicao(true);
  };

  const handleInputChange = (campo: keyof FuncionarioFormData, valor: any) => {
    if (!formEdicao) return;
    setFormEdicao({ ...formEdicao, [campo]: valor });
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEdicao || !formEdicao.id) return;

    setSalvandoEdicao(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/api/funcionarios/${formEdicao.id}`, formEdicao);
      
      const funcionarioAtualizado = response.data.funcionario || formEdicao;

      setFuncionarios(prev => prev.map(f => f.id === formEdicao.id ? funcionarioAtualizado : f));
      setFuncionarioDetalhe(funcionarioAtualizado);
      setModoEdicao(false);
      alert('Dados do funcionário atualizados com sucesso!');
    } catch (err: any) {
      console.error('Erro ao atualizar funcionário:', err);
      alert(err.response?.data?.error || 'Erro ao salvar alterações do funcionário.');
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const exportarPDFFuncionario = (func: FuncionarioFormData) => {
    const doc = new jsPDF();
    let y = 15;

    // Cabeçalho
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('FICHA CADASTRAL DO FUNCIONÁRIO - SME', 14, y);
    y += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Documento gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, y);
    y += 10;

    const addSectionHeader = (titulo: string) => {
      if (y > 270) { doc.addPage(); y = 15; }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(235, 238, 242);
      doc.rect(14, y - 4, 182, 7, 'F');
      doc.text(titulo, 16, y);
      y += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
    };

    const addLine = (rotulo: string, valor: string | undefined | null) => {
      if (y > 280) { doc.addPage(); y = 15; }
      doc.setFont('helvetica', 'bold');
      doc.text(`${rotulo}: `, 14, y);
      const larguraRotulo = doc.getTextWidth(`${rotulo}: `);
      doc.setFont('helvetica', 'normal');
      doc.text(`${valor || 'Não informado'}`, 14 + larguraRotulo, y);
      y += 5.5;
    };

    // 1. Dados Pessoais & Contatos
    addSectionHeader('1. DADOS PESSOAIS E CONTATOS');
    addLine('Nome Completo', func.nome_completo);
    addLine('CPF', func.cpf);
    addLine('Data de Nascimento', func.data_nascimento);
    addLine('Sexo', func.sexo);
    addLine('Cor / Raça', func.cor_raca);
    addLine('E-mail', func.email);
    addLine('Telefone Celular', func.telefone_celular);
    addLine('Nome da Mãe', func.nome_mae);
    addLine('Nacionalidade', func.nacionalidade);
    addLine('País de Origem', func.pais_origem);
    addLine('Naturalidade', `${func.municipio_naturalidade || 'N/A'} - ${func.uf_naturalidade || 'N/A'}`);
    addLine('Contato Emergência', `${func.contato_emergencia_nome || 'N/A'} (${func.contato_emergencia_telefone || 'Sem fone'})`);
    y += 4;

    // 2. Turnos e Matrículas
    addSectionHeader('2. TURNOS E MATRÍCULAS');
    addLine('Turno Manhã', func.turno_manha ? `Sim ${func.matricula_manha ? `(Matrícula: ${func.matricula_manha})` : ''}` : 'Não');
    addLine('Turno Tarde', func.turno_tarde ? `Sim ${func.matricula_tarde ? `(Matrícula: ${func.matricula_tarde})` : ''}` : 'Não');
    y += 4;

    // 3. Endereço
    addSectionHeader('3. ENDEREÇO RESIDENCIAL');
    addLine('CEP', func.cep);
    addLine('Endereço', `${func.endereco || ''}, Nº ${func.numero || 'S/N'}`);
    addLine('Complemento', func.complemento);
    addLine('Bairro', func.bairro);
    addLine('Município / UF', `${func.municipio || 'N/A'} / ${func.uf || 'N/A'}`);
    addLine('Zona Residencial', func.zona_residencial);
    y += 4;

    // 4. Escolaridade
    addSectionHeader('4. ESCOLARIDADE E CURSOS');
    addLine('Nível de Escolaridade', func.escolaridade_nivel);
    if (func.cursos_superiores && func.cursos_superiores.length > 0) {
      func.cursos_superiores.forEach((c, idx) => {
        addLine(`Curso ${idx + 1}`, `${c.nome_curso || 'N/A'} - ${c.instituicao || 'N/A'} (${c.situacao || 'N/A'})`);
      });
    }
    y += 4;

    // 5. Situação Funcional
    addSectionHeader('5. SITUAÇÃO FUNCIONAL');
    addLine('Regime de Contratação', func.situacao_funcional);
    addLine('Status no Sistema', func.ativo !== false ? 'Ativo' : 'Inativo');

    // Nome do arquivo PDF utilizando o Nome Completo
    const nomeArquivo = `${func.nome_completo || 'funcionario'}_cadastro.pdf`;
    doc.save(nomeArquivo);
  };

  const funcionariosFiltrados = funcionarios.filter(f =>
    f.nome_completo?.toLowerCase().includes(busca.toLowerCase()) ||
    f.cpf?.includes(busca)
  );

  const exportarParaExcel = () => {
    if (funcionarios.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }

    const dadosFormatados = funcionarios.map(f => ({
      'Nome Completo': f.nome_completo || '',
      'CPF': f.cpf || '',
      'Telefone': f.telefone_celular || '',
      'Matrícula (Manhã)': f.matricula_manha || '',
      'Matrícula (Tarde)': f.matricula_tarde || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Funcionários');

    worksheet['!cols'] = [
      { wch: 35 },
      { wch: 16 },
      { wch: 16 },
      { wch: 20 },
      { wch: 20 }
    ];

    XLSX.writeFile(workbook, `funcionarios_sme_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (!autenticado) {
    return (
      <div className="container" style={{ maxWidth: '400px', marginTop: '40px', textAlign: 'center' }}>
        <h2>Acesso Restrito</h2>
        <p className="instrucao">Digite a senha do administrador para visualizar os dados.</p>
        
        {erroLogin && <div className="alerta erro">{erroLogin}</div>}
        
        <form onSubmit={handleLogin} style={{ marginTop: '20px' }}>
          <div className="grid">
            <div className="span-2">
              <input
                type="password"
                placeholder="Senha de acesso..."
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                style={{ textAlign: 'center' }}
              />
            </div>
          </div>
          <button type="submit" className="btn-submit" disabled={carregandoLogin} style={{ marginTop: '16px' }}>
            {carregandoLogin ? 'Validando...' : 'Entrar no Painel'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Painel do Administrador - SME</h2>

      {erro && <div className="alerta erro">{erro}</div>}

      <div className="grid" style={{ marginBottom: '24px' }}>
        <div className="span-2">
          <label>Buscar Funcionário (Nome ou CPF)</label>
          <input
            type="text"
            placeholder="Digite o nome ou CPF para filtrar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={exportarParaExcel}
          style={{
            backgroundColor: '#276749',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Exportar para Excel (.xlsx)
        </button>
      </div>

      {carregando ? (
        <p className="instrucao">Carregando dados dos servidores...</p>
      ) : funcionariosFiltrados.length === 0 ? (
        <p className="instrucao">Nenhum funcionário encontrado.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-primary-darker)' }}>
                <th style={{ padding: '10px' }}>Nome</th>
                <th style={{ padding: '10px' }}>CPF</th>
                <th style={{ padding: '10px' }}>Regime</th>
                <th style={{ padding: '10px' }}>Status</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {funcionariosFiltrados.map((func) => (
                <tr key={func.cpf} style={{ borderBottom: '1px solid var(--color-border)', opacity: func.ativo !== false ? 1 : 0.6 }}>
                  <td style={{ padding: '10px', fontWeight: 600 }}>{func.nome_completo}</td>
                  <td style={{ padding: '10px' }}>{func.cpf}</td>
                  <td style={{ padding: '10px' }}>{func.situacao_funcional || 'N/A'}</td>
                  
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      backgroundColor: func.ativo !== false ? '#c6f6d5' : '#fed7d7',
                      color: func.ativo !== false ? '#22543d' : '#822727',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {func.ativo !== false ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>

                  {/* COLUNA DE AÇÕES COM BOTÃO DE EXPORTAR PDF */}
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                      {/* Botão Seta (Detalhes) */}
                      <button
                        type="button"
                        title="Exibir detalhes"
                        aria-label="Exibir detalhes"
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e0',
                          backgroundColor: '#edf2f7',
                          color: '#2d3748',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={() => {
                          setFuncionarioDetalhe(func);
                          setModoEdicao(false);
                        }}
                      >
                        ▼
                      </button>

                      {/* Botão Lápis (Editar) */}
                      <button
                        type="button"
                        title="Editar cadastro"
                        aria-label="Editar cadastro"
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: '#ebf8ff',
                          color: '#3182ce',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={() => handleIniciarEdicao(func)}
                      >
                        ✏️
                      </button>

                      {/* Botão PDF */}
                      <button
                        type="button"
                        title="Exportar PDF do funcionário"
                        aria-label="Exportar PDF do funcionário"
                        style={{
                          padding: '0 8px',
                          height: '32px',
                          fontSize: '0.75rem',
                          borderRadius: '6px',
                          backgroundColor: '#d7e8fe',
                          color: '#2c309b',
                          border: 'none',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={() => exportarPDFFuncionario(func)}
                      >
                        Salvar PDF
                      </button>

                      {/* Botão Ativar/Desativar */}
                      <button
                        type="button"
                        title={func.ativo !== false ? 'Desativar funcionário' : 'Ativar funcionário'}
                        style={{
                          padding: '0 8px',
                          height: '32px',
                          fontSize: '0.75rem',
                          borderRadius: '6px',
                          backgroundColor: func.ativo !== false ? '#fed7d7' : '#c6f6d5',
                          color: func.ativo !== false ? '#9b2c2c' : '#22543d',
                          border: 'none',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={() => handleToggleStatus(func.id, func.ativo)}
                      >
                        {func.ativo !== false ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CARD DE DETALHES / MODO DE EDIÇÃO */}
      {funcionarioDetalhe && (
        <div className="curso-card" style={{ marginTop: '30px', borderColor: modoEdicao ? '#dd6b20' : '#3182ce', backgroundColor: '#ffffff', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>
              {modoEdicao ? `Editando: ${formEdicao?.nome_completo}` : `Detalhes do Servidor: ${funcionarioDetalhe.nome_completo}`}
              {funcionarioDetalhe.ativo === false && <span style={{ color: 'red', marginLeft: '10px' }}>(INATIVO)</span>}
            </h3>

            <div style={{ display: 'flex', gap: '8px' }}>
              {!modoEdicao && (
                <button
                  type="button"
                  style={{ backgroundColor: '#3182ce', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                  onClick={() => handleIniciarEdicao(funcionarioDetalhe)}
                >
                  Editar
                </button>
              )}
              <button
                type="button"
                className="btn-remover"
                style={{ marginTop: 0 }}
                onClick={() => {
                  setFuncionarioDetalhe(null);
                  setModoEdicao(false);
                  setFormEdicao(null);
                }}
              >
                Fechar
              </button>
            </div>
          </div>

          {!modoEdicao ? (
            <>
              <h4 style={{ color: '#2b6cb0', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginTop: '16px' }}>1. Dados Pessoais & Contatos</h4>
              <div className="grid">
                <div><strong>Nome Completo:</strong> {funcionarioDetalhe.nome_completo}</div>
                <div><strong>CPF:</strong> {funcionarioDetalhe.cpf}</div>
                <div><strong>Data Nasc.:</strong> {funcionarioDetalhe.data_nascimento || 'Não informada'}</div>
                <div><strong>Sexo:</strong> {funcionarioDetalhe.sexo || 'Não informado'}</div>
                <div><strong>Cor/Raça:</strong> {funcionarioDetalhe.cor_raca || 'Não informada'}</div>
                <div><strong>E-mail:</strong> {funcionarioDetalhe.email}</div>
                <div><strong>Celular:</strong> {funcionarioDetalhe.telefone_celular || 'Não informado'}</div>
                <div><strong>Mãe:</strong> {funcionarioDetalhe.nome_mae || 'Não informado'}</div>
                <div><strong>Nacionalidade:</strong> {funcionarioDetalhe.nacionalidade || 'Não informada'}</div>
                <div><strong>País de Origem:</strong> {funcionarioDetalhe.pais_origem || 'Não informado'}</div>
                <div><strong>Naturalidade:</strong> {funcionarioDetalhe.municipio_naturalidade || 'N/A'} - {funcionarioDetalhe.uf_naturalidade || 'N/A'}</div>
                <div><strong>Contato Emergência:</strong> {funcionarioDetalhe.contato_emergencia_nome || 'Não informado'} ({funcionarioDetalhe.contato_emergencia_telefone || 'Sem fone'})</div>
              </div>

              <h4 style={{ color: '#2b6cb0', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginTop: '20px' }}>2. Turnos e Matrícula(s)</h4>
              <div className="grid">
                <div><strong>Turno Manhã:</strong> {funcionarioDetalhe.turno_manha ? 'Sim' : 'Não'} {funcionarioDetalhe.matricula_manha ? `(Matrícula: ${funcionarioDetalhe.matricula_manha})` : ''}</div>
                <div><strong>Turno Tarde:</strong> {funcionarioDetalhe.turno_tarde ? 'Sim' : 'Não'} {funcionarioDetalhe.matricula_tarde ? `(Matrícula: ${funcionarioDetalhe.matricula_tarde})` : ''}</div>
              </div>

              <h4 style={{ color: '#2b6cb0', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginTop: '20px' }}>3. Endereço Residencial</h4>
              <div className="grid">
                <div><strong>CEP:</strong> {funcionarioDetalhe.cep || 'Não informado'}</div>
                <div><strong>Endereço:</strong> {funcionarioDetalhe.endereco || 'Não informado'}, Nº {funcionarioDetalhe.numero || 'S/N'}</div>
                <div><strong>Complemento:</strong> {funcionarioDetalhe.complemento || 'Nenhum'}</div>
                <div><strong>Bairro:</strong> {funcionarioDetalhe.bairro || 'Não informado'}</div>
                <div><strong>Município/UF:</strong> {funcionarioDetalhe.municipio || 'N/A'} / {funcionarioDetalhe.uf || 'N/A'}</div>
                <div><strong>Zona Residencial:</strong> {funcionarioDetalhe.zona_residencial || 'Não informada'}</div>
              </div>

              <h4 style={{ color: '#2b6cb0', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginTop: '20px' }}>4. Escolaridade & Diplomas</h4>
              <p><strong>Nível:</strong> {funcionarioDetalhe.escolaridade_nivel || 'Não informado'}</p>

              {funcionarioDetalhe.cursos_superiores && funcionarioDetalhe.cursos_superiores.length > 0 ? (
                funcionarioDetalhe.cursos_superiores.map((curso, idx) => (
                  <div key={idx} style={{ backgroundColor: '#f7fafc', padding: '12px', borderRadius: '6px', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: '0 0 6px 0', fontWeight: 'bold' }}>Curso {idx + 1}: {curso.nome_curso || 'Não informado'}</p>
                    <div className="grid">
                      <div><strong>Instituição:</strong> {curso.instituicao || 'N/A'} ({curso.tipo_instituicao || 'N/A'})</div>
                      <div><strong>Situação:</strong> {curso.situacao || 'N/A'}</div>
                    </div>
                    {curso.diploma_url && (
                      <div style={{ marginTop: '8px' }}>
                        <a href={curso.diploma_url} target="_blank" rel="noopener noreferrer" style={{ color: '#3182ce', fontWeight: 'bold' }}>
                          Visualizar Diploma (PDF)
                        </a>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="instrucao">Nenhum curso superior cadastrado.</p>
              )}

              <h4 style={{ color: '#2b6cb0', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginTop: '20px' }}>5. Situação Funcional</h4>
              <div><strong>Regime de Contratação:</strong> {funcionarioDetalhe.situacao_funcional || 'Não informado'}</div>
            </>
          ) : (
            <form onSubmit={handleSalvarEdicao}>
              <h4 style={{ color: '#dd6b20', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Dados Pessoais & Contato</h4>
              <div className="grid">
                <div>
                  <label>Nome Completo</label>
                  <input
                    type="text"
                    value={formEdicao?.nome_completo || ''}
                    onChange={(e) => handleInputChange('nome_completo', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>CPF</label>
                  <input
                    type="text"
                    value={formEdicao?.cpf || ''}
                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>E-mail</label>
                  <input
                    type="email"
                    value={formEdicao?.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <label>Telefone Celular</label>
                  <input
                    type="text"
                    value={formEdicao?.telefone_celular || ''}
                    onChange={(e) => handleInputChange('telefone_celular', e.target.value)}
                  />
                </div>
                <div>
                  <label>Data de Nascimento</label>
                  <input
                    type="date"
                    value={formEdicao?.data_nascimento || ''}
                    onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                  />
                </div>
                <div>
                  <label>Nome da Mãe</label>
                  <input
                    type="text"
                    value={formEdicao?.nome_mae || ''}
                    onChange={(e) => handleInputChange('nome_mae', e.target.value)}
                  />
                </div>
              </div>

              <h4 style={{ color: '#dd6b20', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginTop: '20px' }}>Endereço & Localização</h4>
              <div className="grid">
                <div>
                  <label>CEP</label>
                  <input
                    type="text"
                    value={formEdicao?.cep || ''}
                    onChange={(e) => handleInputChange('cep', e.target.value)}
                  />
                </div>
                <div>
                  <label>Endereço</label>
                  <input
                    type="text"
                    value={formEdicao?.endereco || ''}
                    onChange={(e) => handleInputChange('endereco', e.target.value)}
                  />
                </div>
                <div>
                  <label>Número</label>
                  <input
                    type="text"
                    value={formEdicao?.numero || ''}
                    onChange={(e) => handleInputChange('numero', e.target.value)}
                  />
                </div>
                <div>
                  <label>Bairro</label>
                  <input
                    type="text"
                    value={formEdicao?.bairro || ''}
                    onChange={(e) => handleInputChange('bairro', e.target.value)}
                  />
                </div>
                <div>
                  <label>Município</label>
                  <input
                    type="text"
                    value={formEdicao?.municipio || ''}
                    onChange={(e) => handleInputChange('municipio', e.target.value)}
                  />
                </div>
                <div>
                  <label>UF</label>
                  <input
                    type="text"
                    value={formEdicao?.uf || ''}
                    onChange={(e) => handleInputChange('uf', e.target.value)}
                  />
                </div>
              </div>

              <h4 style={{ color: '#dd6b20', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginTop: '20px' }}>Situação Funcional & Contatos</h4>
              <div className="grid">
                <div>
                  <label>Situação Funcional</label>
                  <input
                    type="text"
                    value={formEdicao?.situacao_funcional || ''}
                    onChange={(e) => handleInputChange('situacao_funcional', e.target.value)}
                  />
                </div>
                <div>
                  <label>Contato de Emergência (Nome)</label>
                  <input
                    type="text"
                    value={formEdicao?.contato_emergencia_nome || ''}
                    onChange={(e) => handleInputChange('contato_emergencia_nome', e.target.value)}
                  />
                </div>
                <div>
                  <label>Contato de Emergência (Telefone)</label>
                  <input
                    type="text"
                    value={formEdicao?.contato_emergencia_telefone || ''}
                    onChange={(e) => handleInputChange('contato_emergencia_telefone', e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  style={{ backgroundColor: '#718096', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '4px', cursor: 'pointer' }}
                  onClick={() => setModoEdicao(false)}
                >
                  Cancelar Edição
                </button>
                <button
                  type="submit"
                  disabled={salvandoEdicao}
                  style={{ backgroundColor: '#38a169', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {salvandoEdicao ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;