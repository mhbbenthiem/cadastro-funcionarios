import { Router } from 'express';
import { cadastrarFuncionario } from '../controllers/funcionarioController';

const router = Router();

router.post('/', cadastrarFuncionario);

export default router;