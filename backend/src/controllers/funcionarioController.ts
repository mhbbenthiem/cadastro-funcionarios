import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { FuncionarioInput } from '../types/funcionario';

export const cadastrarFuncionario = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: FuncionarioInput = req.body;

    // Separar os cursos superiores dos dados principais do funcionário
    const { cursos_superiores, ...dadosFuncionario } = data;

    // 1. Inserir na tabela 'funcionarios'
    const { data: novoFuncionario, error: errFuncionario } = await supabase
      .from('funcionarios')
      .insert([dadosFuncionario])
      .select()
      .single();

    if (errFuncionario) {
      if (errFuncionario.code === '23505') { // Erro de duplicidade no PostgreSQL
        res.status(400).json({ error: 'Já existe um funcionário cadastrado com este CPF.' });
        return;
      }
      throw errFuncionario;
    }

    // 2. Se houver cursos superiores informados, inserir na tabela 'cursos_superiores'
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