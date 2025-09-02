const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const mongoUri = "mongodb+srv://thyago:N6zwjtypovXXOF1d@estoque.zcywvz2.mongodb.net/?retryWrites=true&w=majority&appName=Estoque"; // Cole sua connection string aqui
let db = null;
let client = null;

const init = async () => {
  try {
    client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db('polpa-estoque'); // Nome do banco de dados
    console.log('Conectado ao MongoDB Atlas');
    
    // Criar collections e dados iniciais
    await createCollections();
    await criarUsuariosPadrao();
    await criarSaboresPadrao();
    
    return db;
  } catch (err) {
    console.error('Erro ao conectar com MongoDB:', err);
    throw err;
  }
};

const createCollections = async () => {
  // MongoDB cria collections automaticamente, mas podemos garantir índices
  await db.collection('usuarios').createIndex({ nome: 1 }, { unique: true });
  await db.collection('estoque').createIndex({ sabor: 1 }, { unique: true });
  await db.collection('historico').createIndex({ data: -1 });
};

const criarUsuariosPadrao = async () => {
  try {
    const senhaHash = await bcrypt.hash("zabhyde3", 10);
    const usuarios = [
      { nome: 'Eder', senha: senhaHash },
      { nome: 'Thyago', senha: senhaHash }
    ];

    for (const usuario of usuarios) {
      await db.collection('usuarios').updateOne(
        { nome: usuario.nome },
        { $setOnInsert: usuario },
        { upsert: true }
      );
    }
    console.log('Usuários padrão criados');
  } catch (err) {
    console.error('Erro ao criar usuários:', err);
  }
};

const criarSaboresPadrao = async () => {
  try {
    const sabores = [
      "Abacaxi", "Abacaxi com Hortelã", "Acerola", "Acerola c/ Laranja",
      "Açaí", "Amora", "Cajú", "Cupuaçú", "Goiaba", "Graviola",
      "Mamão", "Mamão c/ Laranja", "Manga", "Maracujá", "Morango", "Uva"
    ];

    for (const sabor of sabores) {
      await db.collection('estoque').updateOne(
        { sabor: sabor },
        { 
          $setOnInsert: { 
            sabor: sabor, 
            peso_500g: 0, 
            peso_1kg: 0, 
            peso_1kg_grande: 0 
          } 
        },
        { upsert: true }
      );
    }
    console.log('Sabores padrão criados');
  } catch (err) {
    console.error('Erro ao criar sabores:', err);
  }
};

const getDb = () => db;

// Função para fechar a conexão quando necessário
const closeConnection = async () => {
  if (client) {
    await client.close();
    console.log('Conexão com MongoDB fechada');
  }
};

module.exports = {
  init,
  getDb,
  closeConnection,
  ObjectId // Exportar ObjectId para usar nas rotas
};