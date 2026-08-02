import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { FuncionarioInput } from '../types/funcionario';

// Função auxiliar para converter "" (texto vazio) em null em todo o objeto
const limparCamposVazios = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(limparCamposVazios);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      acc[key] = limparCamposVazios(obj[key]);
      return acc;
    }, {});
  } else if (obj === '') {
    return null; // Converte string vazia em null (aceito pelo PostgreSQL)
  }
  return obj;
};

export const cadastrarFuncionario = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Limpa o formulário limpando todas as strings vazias para 'null'
    const dataTratada: FuncionarioInput = limparCamposVazios(req.body);

    // 2. Separa os cursos superiores dos dados principais
    const { cursos_superiores, ...dadosFuncionario } = dataTratada;

    // 3. Inserir na tabela 'funcionarios'
    const { data: novoFuncionario, error: errFuncionario } = await supabase
      .from('funcionarios')
      .insert([dadosFuncionario])
      .select()
      .single();

    if (errFuncionario) {
      if (errFuncionario.code === '23505') { // Duplicidade de CPF
        res.status(400).json({ error: 'Já existe um funcionário cadastrado com este CPF.' });
        return;
      }
      throw errFuncionario;
    }

    // 4. Se houver cursos superiores informados, inserir na tabela 'cursos_superiores'
    if (cursos_superiores && cursos_superiores.length > 0) {
      const cursosComId = cursos_superiores.map(curso => ({
        ...curso,
        funcionario_id: novoFuncionario.id
      }));

      const { error: errCursos } = await supabase
        .from('cursos_superiores')
        .insert(cursosComId);

      if (errCursos) {
        throw errCursos;
      }
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