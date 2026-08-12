import { Router } from 'express';
import multer from 'multer';
import { 
  cadastrarFuncionario, 
  listarFuncionarios, 
  atualizarStatusFuncionario, 
  loginAdmin,
  atualizarFuncionario,
  buscarFuncionarioPorCpf
} from '../controllers/funcionarioController';

const router = Router();

// Configura o multer para armazenar arquivos em memória (Buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4.5 * 1024 * 1024 } // Limite de 4.5MB (limite de Serverless da Vercel)
});

// 1. Rota de Login do Administrador
router.post('/admin/login', loginAdmin);

// 2. Rotas de Funcionários
router.post('/funcionarios', upload.array('diplomas', 3), cadastrarFuncionario);
router.get('/funcionarios', listarFuncionarios);
router.put('/funcionarios/:id', atualizarFuncionario);
router.patch('/funcionarios/:id/status', atualizarStatusFuncionario);
router.get('/funcionarios/cpf/:cpf', buscarFuncionarioPorCpf);

export default router;