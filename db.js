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
      { jogador: ficha.jogador, canal: ficha.canal },
      ficha,
      { upsert: true },
      (err, result) => {
        if (err) { console.log('erro ao inserir', err); return reject(err); }
        resolve(result);
      });
  });
};

const removerFicha = (jogador, canal) => {
  return new Promise((resolve, reject) => {
    const db = client.db(dbName);
    db.collection('fichas').deleteOne(
      { jogador, canal },
      (err, result) => {
        if (err) { console.log('erro ao remover', err); return reject(err); }
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

const incrementarAtributo = (jogador, canal, incremento, atributo) => {
  return new Promise((resolve, reject) => {
    const db = client.db(dbName);
    db.collection('fichas').findOneAndUpdate(
      { jogador: jogador, canal: canal },
      { $inc: { [atributo]: incremento } },
      { returnOriginal: true },
      (err, result) => {
        if (err) { console.log('erro ao atualizar pv', err); return reject(err); }
        resolve(result);
      });
  });
};

const inserirItem = (jogador, canal, item) => {
  return new Promise((resolve, reject) => {
    const db = client.db(dbName);
    db.collection('fichas').updateOne(
      { jogador: jogador, canal: canal },
      { $push: { itens: item } },
      (err, result) => {
        if (err) { console.log('erro ao inserir item', err); return reject(err); }
        resolve(result);
      });
  });
};

const deletarItem = (jogador, canal, nomeItem) => {
  return new Promise((resolve, reject) => {
    const db = client.db(dbName);
    db.collection('fichas').updateOne(
      { jogador: jogador, canal: canal },
      { $pull: { itens: { nome: nomeItem } } },
      (err, result) => {
        if (err) { console.log('erro ao deletar item', err); return reject(err); }
        resolve(result);
      });
  });
};

const atualizarAtributo = (jogador, canal, atributo, valor) => {
  return new Promise((resolve, reject) => {
    const db = client.db(dbName);
    db.collection('fichas').findOneAndUpdate(
      { jogador, canal },
      { $set: { [atributo]: valor } },
      (err, result) => {
        if (err) { console.log('erro ao inserir', err); return reject(err); }
        resolve(result);
      });
  });
};

const mongoHelper = {
  inserirFicha,
  removerFicha,
  buscarFicha,
  incrementarAtributo,
  inserirItem,
  deletarItem,
  atualizarAtributo
};

Object.freeze(mongoHelper);

module.exports = mongoHelper;