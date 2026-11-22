// db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',              // <- coloque sua senha do MySQL aqui
    database: 'catalogo_series',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

// Teste rápido de conexão ao iniciar
pool.getConnection()
    .then((conn) => {
        console.log('✅ Conectado ao MySQL (catalogo_series)');
        conn.release();
    })
    .catch((err) => {
        console.error('❌ Erro ao conectar no MySQL:', err.message);
    });

module.exports = pool;