import { Router } from 'express';
import { 
  cadastrarFuncionario, 
  listarFuncionarios, 
  atualizarStatusFuncionario, 
  loginAdmin 
} from '../controllers/funcionarioController';

const router = Router();

router.post('/funcionarios', cadastrarFuncionario);
router.get('/funcionarios', listarFuncionarios);
router.patch('/funcionarios/:id/status', atualizarStatusFuncionario);
router.post('/admin/login', loginAdmin);

export default router;