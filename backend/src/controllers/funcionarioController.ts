import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { FuncionarioInput } from '../types/funcionario';


export const atualizarFuncionario = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dados = req.body;

  try {
    const { data, error } = await supabase
      .from('funcionarios')
      .update({
        nome_completo: dados.nome_completo,
        cpf: dados.cpf,
        email: dados.email,
        telefone_celular: dados.telefone_celular,
        data_nascimento: dados.data_nascimento,
        nome_mae: dados.nome_mae,
        cep: dados.cep,
        endereco: dados.endereco,
        numero: dados.numero,
        bairro: dados.bairro,
        municipio: dados.municipio,
        uf: dados.uf,
        situacao_funcional: dados.situacao_funcional,
        contato_emergencia_nome: dados.contato_emergencia_nome,
        contato_emergencia_telefone: dados.contato_emergencia_telefone,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro Supabase:', error);
      return res.status(400).json({ error: 'Erro ao atualizar no banco de dados.' });
    }

    return res.json({ sucesso: true, funcionario: data });
  } catch (err) {
    console.error('Erro interno:', err);
    return res.status(500).json({ error: 'Erro interno no servidor ao salvar alterações.' });
  }
};
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
    // Quando os dados vêm de um FormData, eles chegam no req.body.dados como String JSON
    const bodyData = typeof req.body.dados === 'string'
      ? JSON.parse(req.body.dados)
      : req.body;

    const dataTratada: FuncionarioInput = limparCamposVazios(bodyData);
    const { cursos_superiores, ...dadosFuncionario } = dataTratada;

    // 1. Inserir os dados do funcionário no Supabase
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

    // 2. Processar Cursos Superiores e Upload dos Diplomas (se houver)
    if (cursos_superiores && cursos_superiores.length > 0) {
      const files = (req.files as Express.Multer.File[]) || [];

      const cursosComUpload = await Promise.all(
        cursos_superiores.map(async (curso: any, index: number) => {
          const file = files[index];
          let diploma_url = null;

          // Se houver um arquivo PDF válido para este curso
          if (file && file.size > 0) {
            const nomeArquivo = `diploma_${novoFuncionario.id}_${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;

            // Upload para o bucket 'diplomas' no Supabase Storage
            const { error: storageError } = await supabase.storage
              .from('diplomas')
              .upload(nomeArquivo, file.buffer, {
                contentType: file.mimetype,
                upsert: true
              });

            if (storageError) {
              console.error('Erro ao enviar PDF para o Storage:', storageError);
            } else {
              // Pegar a URL pública do arquivo enviado
              const { data: publicUrlData } = supabase.storage
                .from('diplomas')
                .getPublicUrl(nomeArquivo);

              diploma_url = publicUrlData.publicUrl;
            }
          }

          // Garante que não envia a propriedade temporária 'diploma_file' para o Postgres
          const { diploma_file, ...cursoLimpo } = curso;

          return {
            ...cursoLimpo,
            funcionario_id: novoFuncionario.id,
            diploma_url
          };
        })
      );

      // Inserir os cursos no banco de dados
      const { error: errCursos } = await supabase
        .from('cursos_superiores')
        .insert(cursosComUpload);

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