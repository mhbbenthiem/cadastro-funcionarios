import React, { useState } from 'react';
import axios from 'axios';
import { FuncionarioFormData } from './types/funcionario';

export const AdminPanel: React.FC = () => {
  const [autenticado, setAutenticado] = useState<boolean>(false);
  const [senha, setSenha] = useState('');
  const [erroLogin, setErroLogin] = useState('');
  const [carregandoLogin, setCarregandoLogin] = useState(false);

  const [funcionarios, setFuncionarios] = useState<FuncionarioFormData[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [funcionarioDetalhe, setFuncionarioDetalhe] = useState<FuncionarioFormData | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroLogin('');
    setCarregandoLogin(true);

    try {
      const response = await axios.post('http://localhost:3001/api/admin/login', { senha });
      
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
      const response = await axios.get('http://localhost:3001/api/funcionarios');
      setFuncionarios(response.data);
    } catch (err: any) {
      console.error('Erro ao buscar funcionários:', err);
      setErro('Não foi possível carregar a lista de funcionários.');
    } finally {
      setCarregando(false);
    }
  };

  // ==========================================
  // NOVA LÓGICA: ATIVAR / DESATIVAR
  // ==========================================
  const handleToggleStatus = async (id: string | undefined, statusAtual: boolean | undefined) => {
    if (!id) return;
    
    // Como o backend salva true por padrão, se não vier definido, consideramos ativo (true)
    const ehAtivo = statusAtual !== false; 
    
    if (!window.confirm(`Tem certeza que deseja ${ehAtivo ? 'DESATIVAR' : 'ATIVAR'} este funcionário?`)) {
      return;
    }

    try {
      await axios.patch(`http://localhost:3001/api/funcionarios/${id}/status`, {
        ativo: !ehAtivo
      });
      
      // Atualiza a lista na tela sem precisar fazer outra requisição ao banco
      setFuncionarios(prev => prev.map(f => 
        f.id === id ? { ...f, ativo: !ehAtivo } : f
      ));

      // Se o detalhe do funcionário estiver aberto, atualiza lá também
      if (funcionarioDetalhe?.id === id) {
        setFuncionarioDetalhe(prev => prev ? { ...prev, ativo: !ehAtivo } : null);
      }
    } catch (err) {
      alert('Erro ao atualizar o status do funcionário.');
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
                <th style={{ padding: '10px' }}>Status</th> {/* NOVA COLUNA */}
                <th style={{ padding: '10px', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {funcionariosFiltrados.map((func) => (
                <tr key={func.cpf} style={{ borderBottom: '1px solid var(--color-border)', opacity: func.ativo !== false ? 1 : 0.6 }}>
                  <td style={{ padding: '10px', fontWeight: 600 }}>{func.nome_completo}</td>
                  <td style={{ padding: '10px' }}>{func.cpf}</td>
                  <td style={{ padding: '10px' }}>{func.situacao_funcional || 'N/A'}</td>
                  
                  {/* BADGE DE STATUS */}
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

                  <td style={{ padding: '10px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="btn-adicionar"
                      style={{ padding: '6px 12px', marginBottom: 0, fontSize: '0.8rem' }}
                      onClick={() => setFuncionarioDetalhe(func)}
                    >
                      Detalhes
                    </button>
                    
                    {/* BOTÃO DINÂMICO DE ATIVAR/DESATIVAR */}
                    <button
                      type="button"
                      className={func.ativo !== false ? 'btn-remover' : 'btn-adicionar'}
                      style={{ 
                        marginTop: 0, 
                        padding: '6px 12px', 
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

      {/* Card de Detalhes Completo */}
      {funcionarioDetalhe && (
        <div className="curso-card" style={{ marginTop: '30px', borderColor: '#3182ce' }}>
          <h3>
            Detalhes do Servidor: {funcionarioDetalhe.nome_completo} 
            {funcionarioDetalhe.ativo === false && <span style={{ color: 'red', marginLeft: '10px' }}>(INATIVO)</span>}
          </h3>
          
          <div className="grid">
            <div><strong>CPF:</strong> {funcionarioDetalhe.cpf}</div>
            <div><strong>Data Nasc.:</strong> {funcionarioDetalhe.data_nascimento}</div>
            <div><strong>E-mail:</strong> {funcionarioDetalhe.email}</div>
            <div><strong>Telefone:</strong> {funcionarioDetalhe.telefone_celular || 'Não informado'}</div>
            <div><strong>Mãe:</strong> {funcionarioDetalhe.nome_mae || 'Não informado'}</div>
            <div><strong>Escolaridade:</strong> {funcionarioDetalhe.escolaridade_nivel || 'Não informada'}</div>
            <div><strong>Regime:</strong> {funcionarioDetalhe.situacao_funcional}</div>
            <div><strong>Cidade/UF:</strong> {funcionarioDetalhe.municipio} - {funcionarioDetalhe.uf}</div>
          </div>

          <h4 style={{ marginTop: '16px' }}>Deficiências Declaradas</h4>
          <p className="instrucao">{funcionarioDetalhe.deficiencias?.join(', ') || 'Nenhuma'}</p>

          <h4>Cursos Específicos</h4>
          <p className="instrucao">{funcionarioDetalhe.cursos_especificos?.join(', ') || 'Nenhum'}</p>

          <button
            type="button"
            className="btn-remover"
            style={{ marginTop: '15px' }}
            onClick={() => setFuncionarioDetalhe(null)}
          >
            Fechar Detalhes
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;