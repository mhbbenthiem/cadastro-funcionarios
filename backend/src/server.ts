import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import funcionarioRoutes from './routes/funcionarioRoutes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Cadastra a rota base
app.use('/api/funcionarios', funcionarioRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});