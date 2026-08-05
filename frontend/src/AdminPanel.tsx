import React, { useState } from 'react';
import axios from 'axios';
import { FuncionarioFormData } from './types/funcionario';
// Define dinamicamente a URL base dependendo do ambiente
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

  // Iniciar Modo de Edição
  const handleIniciarEdicao = (func: FuncionarioFormData) => {
    setFuncionarioDetalhe(func);
    setFormEdicao({ ...func });
    setModoEdicao(true);
  };

  // Alterar campos do formulário de edição
  const handleInputChange = (campo: keyof FuncionarioFormData, valor: any) => {
    if (!formEdicao) return;
    setFormEdicao({ ...formEdicao, [campo]: valor });
  };

  // Salvar Edição no Backend
  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEdicao || !formEdicao.id) return;

    setSalvandoEdicao(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/api/funcionarios/${formEdicao.id}`, formEdicao);
      
      const funcionarioAtualizado = response.data.funcionario || formEdicao;

      // Atualiza na lista do estado principal
      setFuncionarios(prev => prev.map(f => f.id === formEdicao.id ? funcionarioAtualizado : f));
      
      // Atualiza a visualização de detalhes
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

  const funcionariosFiltrados = funcionarios.filter(f =>
    f.nome_completo?.toLowerCase().includes(busca.toLowerCase()) ||
    f.cpf?.includes(busca)
  );

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

                  <td style={{ padding: '10px', textAlign: 'center', display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="btn-adicionar"
                      style={{ padding: '6px 10px', marginBottom: 0, fontSize: '0.8rem' }}
                      onClick={() => {
                        setFuncionarioDetalhe(func);
                        setModoEdicao(false);
                      }}
                    >
                      Detalhes
                    </button>

                    <button
                      type="button"
                      style={{ 
                        padding: '6px 10px', 
                        fontSize: '0.8rem',
                        backgroundColor: '#3182ce',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleIniciarEdicao(func)}
                    >
                      Editar
                    </button>
                    
                    <button
                      type="button"
                      className={func.ativo !== false ? 'btn-remover' : 'btn-adicionar'}
                      style={{ 
                        marginTop: 0, 
                        padding: '6px 10px', 
                        fontSize: '0.8rem',
                        backgroundColor: func.ativo !== false ? '#e53e3e' : '#48bb78',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleToggleStatus(func.id, func.ativo)}
                    >
                      {func.ativo !== false ? 'Desativar' : 'Ativar'}
                    </button>
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
              {modoEdicao ? ` Editando: ${formEdicao?.nome_completo}` : `Detalhes do Servidor: ${funcionarioDetalhe.nome_completo}`}
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

          {/* MODO VISUALIZAÇÃO */}
          {!modoEdicao ? (
            <>
              {/* 1. DADOS PESSOAIS */}
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

              {/* 2. TURNOS E MATRÍCULAS */}
              <h4 style={{ color: '#2b6cb0', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginTop: '20px' }}>2. Turnos e Matrícula(s)</h4>
              <div className="grid">
                <div><strong>Turno Manhã:</strong> {funcionarioDetalhe.turno_manha ? 'Sim' : 'Não'} {funcionarioDetalhe.matricula_manha ? `(Matrícula: ${funcionarioDetalhe.matricula_manha})` : ''}</div>
                <div><strong>Turno Tarde:</strong> {funcionarioDetalhe.turno_tarde ? 'Sim' : 'Não'} {funcionarioDetalhe.matricula_tarde ? `(Matrícula: ${funcionarioDetalhe.matricula_tarde})` : ''}</div>
              </div>

              {/* 3. ENDEREÇO RESIDENCIAL */}
              <h4 style={{ color: '#2b6cb0', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginTop: '20px' }}>3. Endereço Residencial</h4>
              <div className="grid">
                <div><strong>CEP:</strong> {funcionarioDetalhe.cep || 'Não informado'}</div>
                <div><strong>Endereço:</strong> {funcionarioDetalhe.endereco || 'Não informado'}, Nº {funcionarioDetalhe.numero || 'S/N'}</div>
                <div><strong>Complemento:</strong> {funcionarioDetalhe.complemento || 'Nenhum'}</div>
                <div><strong>Bairro:</strong> {funcionarioDetalhe.bairro || 'Não informado'}</div>
                <div><strong>Município/UF:</strong> {funcionarioDetalhe.municipio || 'N/A'} / {funcionarioDetalhe.uf || 'N/A'}</div>
                <div><strong>Zona Residencial:</strong> {funcionarioDetalhe.zona_residencial || 'Não informada'}</div>
              </div>

              {/* 4. ESCOLARIDADE E DIPLOMAS */}
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
                          📄 Visualizar Diploma (PDF)
                        </a>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="instrucao">Nenhum curso superior cadastrado.</p>
              )}

              {/* 5. SITUAÇÃO FUNCIONAL */}
              <h4 style={{ color: '#2b6cb0', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginTop: '20px' }}>5. Situação Funcional</h4>
              <div><strong>Regime de Contratação:</strong> {funcionarioDetalhe.situacao_funcional || 'Não informado'}</div>
            </>
          ) : (
            /* MODO DE EDIÇÃO */
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

              {/* BOTÕES DE AÇÃO DA EDIÇÃO */}
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