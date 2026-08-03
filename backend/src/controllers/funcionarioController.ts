import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { FuncionarioInput } from '../types/funcionario';

const limparCamposVazios = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(limparCamposVazios);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      acc[key] = limparCamposVazios(obj[key]);
      return acc;
    }, {});
  } else if (obj === '') {
    return null;
  }
  return obj;
};

// 1. Cadastrar Funcionário
export const cadastrarFuncionario = async (req: Request, res: Response): Promise<void> => {
  try {
    const dataTratada: FuncionarioInput = limparCamposVazios(req.body);
    const { cursos_superiores, ...dadosFuncionario } = dataTratada;

    const { data: novoFuncionario, error: errFuncionario } = await supabase
      .from('funcionarios')
      .insert([{ ...dadosFuncionario, ativo: true }])
      .select()
      .single();

    if (errFuncionario) {
      if (errFuncionario.code === '23505') {
        res.status(400).json({ error: 'Já existe um funcionário cadastrado com este CPF.' });
        return;
      }
      throw errFuncionario;
    }

    if (cursos_superiores && cursos_superiores.length > 0) {
      const cursosComId = cursos_superiores.map(curso => ({
        ...curso,
        funcionario_id: novoFuncionario.id
      }));

      const { error: errCursos } = await supabase
        .from('cursos_superiores')
        .insert(cursosComId);

      if (errCursos) throw errCursos;
    }

    res.status(201).json({
      message: 'Funcionário cadastrado com sucesso!',
      id: novoFuncionario.id
    });
  } catch (error: any) {
    console.error('Erro ao cadastrar funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao salvar dados.' });
  }
};

// 2. Listar todos os Funcionários (Painel Admin)
export const listarFuncionarios = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('funcionarios')
      .select('*, cursos_superiores(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error: any) {
    console.error('Erro ao listar funcionários:', error);
    res.status(500).json({ error: 'Erro ao buscar registros.' });
  }
};

// 3. Atualizar Status (Ativo / Inativo)
export const atualizarStatusFuncionario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { ativo } = req.body;

    const { error } = await supabase
      .from('funcionarios')
      .update({ ativo })
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'Status atualizado com sucesso!' });
  } catch (error: any) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status do funcionário.' });
  }
};

// 4. Autenticação de Admin
export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  const { senha } = req.body;
  const senhaCorreta = process.env.ADMIN_PASSWORD || 'admin123';

  if (senha === senhaCorreta) {
    res.status(200).json({ sucesso: true, token: 'admin_autenticado' });
  } else {
    res.status(401).json({ error: 'Senha incorreta!' });
  }
};