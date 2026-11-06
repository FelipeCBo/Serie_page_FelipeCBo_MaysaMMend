const express = require('express');
const app = express();

// Middlewares
app.use(express.json({ limit: '10mb' })); // Permite ler JSON no body das requisições
app.use(express.static('./')); // Serve os arquivos HTML, CSS e JS da pasta atual

// ==========================================
// BANCO DE DADOS EM MEMÓRIA (Substituirá o MySQL depois)
// ==========================================
let bancoSeries = [
    {
        id: "exemplo_breaking_bad",
        titulo: "Breaking Bad",
        genero: "Drama",
        descricao: "Walter White, um professor de química do ensino médio, é diagnosticado com câncer de pulmão em estágio terminal. Para garantir o futuro financeiro de sua família, ele decide usar seus conhecimentos de química para fabricar e vender metanfetamina, mergulhando em um mundo perigoso do crime organizado.",
        imagem: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
        descImagem: "Pôster da série Breaking Bad"
    },
    {
        id: "exemplo_stranger_things",
        titulo: "Stranger Things",
        genero: "Ficção",
        descricao: "Quando um garoto desaparece em uma pequena cidade de Indiana, seus amigos descobrem uma menina misteriosa com poderes telecinéticos. Juntos, eles precisam enfrentar forças sobrenaturais e segredos do governo que ameaçam a cidade e o mundo como o conhecem.",
        imagem: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
        descImagem: "Pôster da série Stranger Things"
    }
];

let bancoAvaliacoes = {}; // Ex: { "exemplo_breaking_bad": 5 }

// ==========================================
// ROTAS DA API
// ==========================================

// GET: Retorna todas as séries
app.get('/api/series', (req, res) => {
    res.json(bancoSeries);
});

// POST: Adiciona ou Edita uma série
app.post('/api/series', (req, res) => {
    const serieRecebida = req.body;
    
    // Verifica se é uma edição (se o ID já existe) ou uma criação nova
    const index = bancoSeries.findIndex(s => s.id === serieRecebida.id);
    
    if (index !== -1) {
        // Se achou, atualiza
        bancoSeries[index] = serieRecebida;
        res.json({ mensagem: "Série atualizada!", serie: serieRecebida });
    } else {
        // Se não achou, cria uma nova
        bancoSeries.push(serieRecebida);
        res.status(201).json({ mensagem: "Série criada!", serie: serieRecebida });
    }
});

// DELETE: Remove uma série
app.delete('/api/series/:id', (req, res) => {
    const id = req.params.id;
    bancoSeries = bancoSeries.filter(s => s.id !== id);
    
    // Remove a avaliação dela também
    if (bancoAvaliacoes[id]) {
        delete bancoAvaliacoes[id];
    }
    
    res.json({ mensagem: "Série deletada!" });
});

// GET: Retorna as avaliações
app.get('/api/avaliacoes', (req, res) => {
    res.json(bancoAvaliacoes);
});

// POST: Salva uma avaliação
app.post('/api/avaliacoes', (req, res) => {
    const { id, nota } = req.body;
    bancoAvaliacoes[id] = nota;
    res.json({ mensagem: "Avaliação salva!", avaliacoes: bancoAvaliacoes });
});

// Inicia o servidor
app.listen(3000, () => {
    console.log("🚀 Servidor Mafe rodando em http://localhost:3000");
});