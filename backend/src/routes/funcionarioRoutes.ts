import { Router } from 'express';
import multer from 'multer';
import { 
  cadastrarFuncionario, 
  listarFuncionarios, 
  atualizarStatusFuncionario, 
  loginAdmin,
  atualizarFuncionario
} from '../controllers/funcionarioController';

const router = Router();

router.post('/funcionarios', cadastrarFuncionario);
router.get('/funcionarios', listarFuncionarios);
router.patch('/funcionarios/:id/status', atualizarStatusFuncionario);
router.post('/admin/login', (req, res) => {
  const { senha } = req.body;
  const SENHA_MESTRE = process.env.ADMIN_PASSWORD || 'mira2026';

  if (senha === SENHA_MESTRE) {
    return res.json({ sucesso: true });
  }

  return res.status(401).json({ error: 'Senha incorreta.' });
});
// Configura o multer para armazenar arquivos em memória (Buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4.5 * 1024 * 1024 } // Limite de 4.5MB (limite da Vercel)
});

// Aceita até 3 arquivos chamados 'diplomas' na requisição
router.post('/funcionarios', upload.array('diplomas', 3), cadastrarFuncionario);
router.get('/funcionarios', listarFuncionarios);
router.patch('/funcionarios/:id/status', atualizarStatusFuncionario);
router.put('/funcionarios/:id', atualizarFuncionario); // Rota limpa apontando para o controller

export default router;