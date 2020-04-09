const MongoClient = require('mongodb').MongoClient;

const { MONGO_DB_DATABASE, MONGO_DB_URL } = process.env;

// Connection URL
const url = MONGO_DB_URL;

// Database Name
const dbName = MONGO_DB_DATABASE;

// Create a new MongoClient
const client = new MongoClient(url, { useUnifiedTopology: true });
client.connect((err) => {
  if (err) {
    console.log('erro de conexão', err);
  }
});

const inserirFicha = (ficha) => {
  return new Promise((resolve, reject) => {
    const db = client.db(dbName);
    db.collection('fichas').replaceOne(
      { jogador: ficha.jogador, canal: ficha.canal, nome: ficha.nome },
      ficha,
      { upsert: true },
      (err, result) => {
        if (err) { console.log('erro ao inserir', err); return reject(err); }
        resolve(result);
      });
  });
};

const buscarFicha = (jogador, canal) => {
  return new Promise((resolve, reject) => {
    const db = client.db(dbName);
    db.collection('fichas').findOne(
      { jogador: jogador, canal: canal },
      (err, result) => {
        if (err) { console.log('erro ao buscar', err); return reject(err); }
        resolve(result);
      });
  });
};

const atualizarPv = (jogador, canal, incremento) => {
  return new Promise((resolve, reject) => {
    const db = client.db(dbName);
    db.collection('fichas').findOneAndUpdate(
      { jogador: jogador, canal: canal },
      { $inc: { pv: incremento } },
      { returnOriginal: false },
      (err, result) => {
        if (err) { console.log('erro ao atualizar pv', err); return reject(err); }
        resolve(result);
      });
  });
};

const mongoHelper = {
  inserirFicha,
  buscarFicha,
  atualizarPv
};

Object.freeze(mongoHelper);

module.exports = mongoHelper;