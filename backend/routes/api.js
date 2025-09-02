const express = require('express');
const bcrypt = require('bcryptjs');
const database = require('../database');
const router = express.Router();

// Rota de login
router.post('/login', async (req, res) => {
  const { usuario, senha } = req.body;
  
  if (!usuario || !senha) {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
  }
  
  try {
    const db = database.getDb();
    const user = await db.collection('usuarios').findOne({ nome: usuario });
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    res.json({ message: 'Login bem-sucedido', usuario: user.nome });
  } catch (err) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Obter estoque
router.get('/estoque', async (req, res) => {
  try {
    const db = database.getDb();
    const estoque = await db.collection('estoque').find().sort({ sabor: 1 }).toArray();
    res.json(estoque);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar estoque' });
  }
});

// Atualizar estoque
router.post('/estoque', async (req, res) => {
  const { usuario, sabor, peso, alteracao } = req.body;
  
  if (!usuario || !sabor || !peso || alteracao === undefined) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }
  
  try {
    const db = database.getDb();
    
    // Registrar no histórico
    await db.collection('historico').insertOne({
      usuario,
      sabor,
      peso,
      alteracao,
      data: new Date()
    });
    
    // Atualizar estoque
    const updateField = {};
    switch(peso) {
      case '500g':
        updateField.peso_500g = alteracao;
        break;
      case '1kg':
        updateField.peso_1kg = alteracao;
        break;
      case '1kg_grande':
        updateField.peso_1kg_grande = alteracao;
        break;
      default:
        return res.status(400).json({ error: 'Tipo de peso inválido' });
    }
    
    await db.collection('estoque').updateOne(
      { sabor: sabor },
      { $inc: updateField }
    );
    
    res.json({ message: 'Estoque atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar estoque' });
  }
});

// Obter histórico
router.get('/historico', async (req, res) => {
  try {
    const db = database.getDb();
    const historico = await db.collection('historico')
      .find()
      .sort({ data: -1 })
      .limit(20)
      .toArray();
    res.json(historico);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
});

module.exports = router;