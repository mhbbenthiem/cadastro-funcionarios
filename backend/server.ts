import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import funcionarioRoutes from './src/routes/funcionarioRoutes';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de Login do Administrador
app.post('/api/admin/login', (req, res) => {
  const { senha } = req.body;
  
  // Define a senha de acesso (pode alterar aqui ou usar ADMIN_PASSWORD no .env)
  const SENHA_MESTRE = process.env.ADMIN_PASSWORD || 'mira2026';

  if (senha === SENHA_MESTRE) {
    return res.json({ sucesso: true });
  }

  return res.status(401).json({ error: 'Senha incorreta.' });
});

// Rotas de Funcionários
app.use('/api', funcionarioRoutes);

// Porta padrão para testes locais
const PORT = process.env.PORT || 3000;

// Inicialização do servidor apenas para ambiente local
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor backend rodando em http://localhost:${PORT}`);
  });
}

export default app;