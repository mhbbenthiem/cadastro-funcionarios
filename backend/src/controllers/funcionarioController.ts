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

// Helper para extrair os dados independente do formato recebido
const extrairDadosFormulario = (req: Request): any => {
  let body = req.body;
  if (!body) return {};

  if (body.dados) {
    if (typeof body.dados === 'string') {
      if (body.dados === '[object Object]') {
        console.error('⚠️ ALERTA: O frontend enviou "[object Object]"! Garanta que usou JSON.stringify(dados) no FormData.');
        return {};
      }
      try {
        return JSON.parse(body.dados);
      } catch (e) {
        console.error('Erro ao fazer JSON.parse de req.body.dados:', e);
      }
    } else if (typeof body.dados === 'object') {
      return body.dados;
    }
  }

  return body;
};

// 1. Cadastrar Funcionário
export const cadastrarFuncionario = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📦 REQ.BODY BRUTO RECEBIDO:', req.body);

    const bodyData = extrairDadosFormulario(req);
    console.log('🔍 DADOS EXTRAÍDOS PARA INSERÇÃO:', bodyData);

    const dataTratada: FuncionarioInput = limparCamposVazios(bodyData);
    const { cursos_superiores, ...dadosFuncionario } = dataTratada;

    // Trava de segurança: Valida se o nome_completo realmente existe antes de ir ao banco
    if (!dadosFuncionario.nome_completo) {
      console.error('❌ ERRO: O campo nome_completo está ausente em:', dadosFuncionario);
      res.status(400).json({
        error: 'O campo "nome_completo" não foi recebido corretamente pelo servidor. Verifique o envio dos dados no frontend.'
      });
      return;
    }

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

    // 2. Processar Cursos Superiores (filtra registros vazios enviados pelo formulário)
    const cursosValidos = Array.isArray(cursos_superiores)
      ? cursos_superiores.filter((c: any) => c && (c.nome_curso || c.instituicao))
      : [];

    if (cursosValidos.length > 0) {
      const files = (req.files as Express.Multer.File[]) || [];

      const cursosComUpload = await Promise.all(
        cursosValidos.map(async (curso: any, index: number) => {
          const file = files[index];
          let diploma_url = null;

          if (file && file.size > 0) {
            const nomeArquivo = `diploma_${novoFuncionario.id}_${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;

            const { error: storageError } = await supabase.storage
              .from('diplomas')
              .upload(nomeArquivo, file.buffer, {
                contentType: file.mimetype,
                upsert: true
              });

            if (storageError) {
              console.error('Erro ao enviar PDF para o Storage:', storageError);
            } else {
              const { data: publicUrlData } = supabase.storage
                .from('diplomas')
                .getPublicUrl(nomeArquivo);

              diploma_url = publicUrlData.publicUrl;
            }
          }

          const { diploma_file, ...cursoLimpo } = curso;

          return {
            ...cursoLimpo,
            funcionario_id: novoFuncionario.id,
            diploma_url
          };
        })
      );

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

// 3. Atualizar Dados do Funcionário
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

// 4. Atualizar Status (Ativo / Inativo)
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

// 5. Autenticação de Admin
export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  const { senha } = req.body;
  const senhaCorreta = process.env.ADMIN_PASSWORD || 'admin123';

  if (senha === senhaCorreta) {
    res.status(200).json({ sucesso: true, token: 'admin_autenticado' });
  } else {
    res.status(401).json({ error: 'Senha incorreta!' });
  }
};