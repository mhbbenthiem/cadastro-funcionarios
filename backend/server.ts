import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import funcionarioRoutes from './src/routes/funcionarioRoutes';

dotenv.config();

const app = express();
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Ou coloque a URL exata do seu frontend
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Se for uma requisição OPTIONS (pré-voo), responde imediatamente com status 200
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// Suas configurações normais continuam aqui:
app.use(cors());
app.use(express.json());

// Cadastra a rota base
app.use('/api', funcionarioRoutes);
app.use(cors());
app.use(express.json());

// Cadastra a rota base
app.use('/api', funcionarioRoutes);

const PORT = process.env.PORT || 3001;

// app.listen(PORT, () => {
//   console.log(`Servidor rodando em http://localhost:${PORT}`);
// });
export default app;