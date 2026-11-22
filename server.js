const express = require('express');
const pool = require('./db');

const app = express();

app.use(express.json({ limit: '20mb' }));   // imagens Base64 grandes
app.use(express.static('./'));              // serve HTML/CSS/JS

// ==========================================
// GET: listar todas as séries
// ==========================================
app.get('/api/series', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                s.idseries        AS id,
                s.titulo          AS titulo,
                s.descricao       AS descricao,
                s.imagem          AS imagem,
                s.desc_imagem     AS descImagem,
                g.titulo_genero   AS genero
            FROM series s
            INNER JOIN generos g ON g.idgeneros = s.generos_idgeneros
            ORDER BY s.idseries ASC
        `);
        res.json(rows);
    } catch (err) {
        console.error('GET /api/series:', err);
        res.status(500).json({ erro: 'Erro ao buscar séries.' });
    }
});

// ==========================================
// GET: uma série específica (para card.html?id=X)
// ==========================================
app.get('/api/series/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                s.idseries        AS id,
                s.titulo          AS titulo,
                s.descricao       AS descricao,
                s.imagem          AS imagem,
                s.desc_imagem     AS descImagem,
                g.titulo_genero   AS genero
            FROM series s
            INNER JOIN generos g ON g.idgeneros = s.generos_idgeneros
            WHERE s.idseries = ?
        `, [req.params.id]);

        if (rows.length === 0) return res.status(404).json({ erro: 'Série não encontrada.' });
        res.json(rows[0]);
    } catch (err) {
        console.error('GET /api/series/:id:', err);
        res.status(500).json({ erro: 'Erro ao buscar série.' });
    }
});

// ==========================================
// POST: cria ou atualiza uma série
// ==========================================
app.post('/api/series', async (req, res) => {
    const { id, titulo, genero, descricao, imagem, descImagem } = req.body;

    if (!titulo || !genero || !descricao || !imagem) {
        return res.status(400).json({ erro: 'Campos obrigatórios faltando.' });
    }

    try {
        // Resolve o gênero (texto -> idgeneros)
        const [genRows] = await pool.query(
            'SELECT idgeneros FROM generos WHERE titulo_genero = ?',
            [genero]
        );
        if (genRows.length === 0) {
            return res.status(400).json({ erro: `Gênero "${genero}" não existe.` });
        }
        const idGenero = genRows[0].idgeneros;

        if (id) {
            // Edição
            const [result] = await pool.query(
                `UPDATE series
                    SET titulo = ?, descricao = ?, imagem = ?, desc_imagem = ?, generos_idgeneros = ?
                  WHERE idseries = ?`,
                [titulo, descricao, imagem, descImagem || null, idGenero, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ erro: 'Série não encontrada para edição.' });
            }
            return res.json({ mensagem: 'Série atualizada!', id: Number(id) });
        }

        // Criação
        const [result] = await pool.query(
            `INSERT INTO series (titulo, descricao, imagem, desc_imagem, generos_idgeneros)
             VALUES (?, ?, ?, ?, ?)`,
            [titulo, descricao, imagem, descImagem || null, idGenero]
        );

        return res.status(201).json({ mensagem: 'Série criada!', id: result.insertId });
    } catch (err) {
        console.error('POST /api/series:', err);
        res.status(500).json({ erro: 'Erro ao salvar série.' });
    }
});

// ==========================================
// DELETE: remove uma série (avaliações caem por CASCADE)
// ==========================================
app.delete('/api/series/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM series WHERE idseries = ?',
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Série não encontrada.' });
        }
        res.json({ mensagem: 'Série deletada!' });
    } catch (err) {
        console.error('DELETE /api/series/:id:', err);
        res.status(500).json({ erro: 'Erro ao deletar série.' });
    }
});

// ==========================================
// GET: todas as avaliações { "<id>": nota, ... }
// ==========================================
app.get('/api/avaliacoes', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT series_idseries AS serie_id, nota FROM avaliacoes'
        );
        const mapa = {};
        rows.forEach((r) => { mapa[r.serie_id] = r.nota; });
        res.json(mapa);
    } catch (err) {
        console.error('GET /api/avaliacoes:', err);
        res.status(500).json({ erro: 'Erro ao buscar avaliações.' });
    }
});

// ==========================================
// POST: cria ou atualiza a avaliação de uma série
// ==========================================
app.post('/api/avaliacoes', async (req, res) => {
    const { id, nota } = req.body;
    const notaNum = Number(nota);

    if (!id || !Number.isInteger(notaNum) || notaNum < 1 || notaNum > 5) {
        return res.status(400).json({ erro: 'Dados inválidos.' });
    }

    try {
        await pool.query(
            `INSERT INTO avaliacoes (series_idseries, nota)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE nota = VALUES(nota)`,
            [id, notaNum]
        );
        res.json({ mensagem: 'Avaliação salva!', id, nota: notaNum });
    } catch (err) {
        console.error('POST /api/avaliacoes:', err);
        res.status(500).json({ erro: 'Erro ao salvar avaliação.' });
    }
});

// ==========================================
// Inicia servidor
// ==========================================
app.listen(3000, () => {
    console.log('🚀 Servidor Mafe rodando em http://localhost:3000');
});