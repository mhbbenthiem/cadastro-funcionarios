import React, { useState } from 'react';
import axios from 'axios';
import { FuncionarioFormData } from './types/funcionario';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3001'
  : 'https://cadastro-funcionarios-eight.vercel.app';

export const AtualizarCadastro: React.FC = () => {
  const [cpfBusca, setCpfBusca] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [funcionario, setFuncionario] = useState<FuncionarioFormData | null>(null);

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem(null);
    
    const cpfLimpo = cpfBusca.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      setMensagem({ tipo: 'erro', texto: 'Informe um CPF válido com 11 dígitos.' });
      return;
    }

    setCarregando(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/funcionarios/cpf/${cpfLimpo}`);
      setFuncionario(response.data);
      setMensagem(null);
    } catch (err: any) {
      setFuncionario(null);
      setMensagem({
        tipo: 'erro',
        texto: err.response?.data?.error || 'Cadastro não encontrado para o CPF informado.'
      });
    } finally {
      setCarregando(false);
    }
  };

  const handleInputChange = (campo: keyof FuncionarioFormData, valor: any) => {
    if (!funcionario) return;
    setFuncionario({ ...funcionario, [campo]: valor });
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!funcionario || !funcionario.id) return;

    setSalvando(true);
    setMensagem(null);

    try {
      await axios.put(`${API_BASE_URL}/api/funcionarios/${funcionario.id}`, funcionario);
      setMensagem({ tipo: 'sucesso', texto: 'Seus dados foram atualizados com sucesso!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setMensagem({
        tipo: 'erro',
        texto: err.response?.data?.error || 'Erro ao atualizar dados. Tente novamente.'
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="container">
      <h2>Atualizar Cadastro - Servidor</h2>
      <p className="instrucao">Digite seu CPF para consultar e atualizar seus dados cadastrais.</p>

      {/* Form de Busca */}
      <form onSubmit={handleBuscar} style={{ marginBottom: '30px' }}>
        <div className="grid">
          <div className="span-2">
            <label>CPF do Servidor</label>
            <input
              type="text"
              placeholder="000.000.000-00"
              value={cpfBusca}
              onChange={(e) => setCpfBusca(e.target.value)}
              required
            />
          </div>
        </div>
        <button type="submit" className="btn-submit" disabled={carregando} style={{ marginTop: '10px' }}>
          {carregando ? 'Buscando...' : 'Consultar Cadastro'}
        </button>
      </form>

      {mensagem && (
        <div className={`alerta ${mensagem.tipo}`} style={{ marginBottom: '20px' }}>
          {mensagem.texto}
        </div>
      )}

      {/* Formulário de Edição (exibido apenas quando encontrar o funcionário) */}
      {funcionario && (
        <form onSubmit={handleSalvar} className="curso-card" style={{ backgroundColor: '#fff', padding: '20px' }}>
          <h3 style={{ color: '#2b6cb0', marginTop: 0 }}>Cadastro Encontrado: {funcionario.nome_completo}</h3>

          <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginTop: '20px' }}>1. Contatos e Dados Pessoais</h4>
          <div className="grid">
            <div>
              <label>Nome Completo</label>
              <input
                type="text"
                value={funcionario.nome_completo || ''}
                onChange={(e) => handleInputChange('nome_completo', e.target.value)}
                required
              />
            </div>
            <div>
              <label>E-mail</label>
              <input
                type="email"
                value={funcionario.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            <div>
              <label>Telefone Celular</label>
              <input
                type="text"
                value={funcionario.telefone_celular || ''}
                onChange={(e) => handleInputChange('telefone_celular', e.target.value)}
              />
            </div>
          </div>

          <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginTop: '20px' }}>2. Endereço Residencial</h4>
          <div className="grid">
            <div>
              <label>CEP</label>
              <input
                type="text"
                value={funcionario.cep || ''}
                onChange={(e) => handleInputChange('cep', e.target.value)}
              />
            </div>
            <div>
              <label>Endereço</label>
              <input
                type="text"
                value={funcionario.endereco || ''}
                onChange={(e) => handleInputChange('endereco', e.target.value)}
              />
            </div>
            <div>
              <label>Número</label>
              <input
                type="text"
                value={funcionario.numero || ''}
                onChange={(e) => handleInputChange('numero', e.target.value)}
              />
            </div>
            <div>
              <label>Bairro</label>
              <input
                type="text"
                value={funcionario.bairro || ''}
                onChange={(e) => handleInputChange('bairro', e.target.value)}
              />
            </div>
          </div>

          <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginTop: '20px' }}>3. Contato de Emergência</h4>
          <div className="grid">
            <div>
              <label>Nome do Contato</label>
              <input
                type="text"
                value={funcionario.contato_emergencia_nome || ''}
                onChange={(e) => handleInputChange('contato_emergencia_nome', e.target.value)}
              />
            </div>
            <div>
              <label>Telefone do Contato</label>
              <input
                type="text"
                value={funcionario.contato_emergencia_telefone || ''}
                onChange={(e) => handleInputChange('contato_emergencia_telefone', e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <button
              type="submit"
              disabled={salvando}
              style={{ backgroundColor: '#38a169', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {salvando ? 'Salvando Alterações...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};