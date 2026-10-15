/* ============================================================
   CONSTANTES
   ============================================================ */

const CHAVE_SERIES = "mafe_series";
const CHAVE_TEMA = "tema";
const CHAVE_SERIE_SELECIONADA = "mafe_serie_selecionada";
const CHAVE_SERIE_EDITANDO = "mafe_serie_editando";
const CHAVE_AVALIACOES = "mafe_avaliacoes";
const CHAVE_SEED_FEITO = "mafe_seed_v1";

/* ============================================================
   TEMA (logo "Mafe")
   ============================================================ */

const LOGO_TOGGLE = document.getElementById("logo_toggle");

if (LOGO_TOGGLE) {
    LOGO_TOGGLE.addEventListener("click", (event) => {
        event.preventDefault();

        const html = document.documentElement;
        html.classList.toggle("dark_background");

        const estaEscuro = html.classList.contains("dark_background");
        localStorage.setItem(CHAVE_TEMA, estaEscuro ? "escuro" : "claro");
    });
}

/* ============================================================
   UTILIDADES
   ============================================================ */

function lerSeries() {
    try {
        const dados = localStorage.getItem(CHAVE_SERIES);
        if (!dados) return [];
        const lista = JSON.parse(dados);
        return Array.isArray(lista) ? lista : [];
    } catch (erro) {
        console.warn("Erro ao ler séries:", erro);
        return [];
    }
}

function salvarSeries(lista) {
    try {
        localStorage.setItem(CHAVE_SERIES, JSON.stringify(lista));
    } catch (erro) {
        console.warn("Erro ao salvar séries:", erro);
    }
}

function gerarId() {
    return "serie_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
}

function lerAvaliacoes() {
    try {
        const dados = localStorage.getItem(CHAVE_AVALIACOES);
        if (!dados) return {};
        const obj = JSON.parse(dados);
        return obj && typeof obj === "object" ? obj : {};
    } catch (erro) {
        return {};
    }
}

function salvarAvaliacoes(obj) {
    try {
        localStorage.setItem(CHAVE_AVALIACOES, JSON.stringify(obj));
    } catch (erro) {
        console.warn("Erro ao salvar avaliações:", erro);
    }
}

function calcularMedia(serieId) {
    const avaliacoes = lerAvaliacoes();
    const nota = avaliacoes[serieId];
    return typeof nota === "number" ? nota : 0;
}

function truncarTexto(texto, limite) {
    if (!texto) return "";
    if (texto.length <= limite) return texto;
    return texto.slice(0, limite).trim() + "...";
}

/* ============================================================
   SEED — popula 3 séries na primeira visita
   ============================================================ */

const seriesExemplo = [
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
    },
    {
        id: "exemplo_the_crown",
        titulo: "The Crown",
        genero: "Drama",
        descricao: "A série acompanha a trajetória da Rainha Elizabeth II desde sua juventude até os dias atuais, retratando os bastidores da realeza britânica, as crises políticas, os escândalos familiares e os eventos históricos que marcaram o século XX e XXI.",
        imagem: "https://image.tmdb.org/t/p/w500/1M876KPjulVwppEpldhdc8V4o68.jpg",
        descImagem: "Pôster da série The Crown"
    }
];

(function popularSeVazio() {
    try {
        const jaFezSeed = localStorage.getItem(CHAVE_SEED_FEITO);
        const listaAtual = lerSeries();

        if (!jaFezSeed && listaAtual.length === 0) {
            salvarSeries(seriesExemplo);
            localStorage.setItem(CHAVE_SEED_FEITO, "sim");
        }
    } catch (erro) {
        console.warn("Erro ao popular séries de exemplo:", erro);
    }
})();

/* ============================================================
   SÉRIE DESTAQUE (quando o catálogo está vazio)
   ============================================================ */

const serieDestaque = {
    id: "destaque_black_mirror",
    titulo: "Black Mirror",
    genero: "Ficção",
    descricao: "Na série Black Mirror, lançada pela Netflix, acompanhamos em cada episódio histórias e contos de antologias explorando um mundo de alta tecnologia. Em uma referência de híbrido entre \"The Twilight Zone\" e \"Tales of the Unexpected\", a série explora as sensações do mal-estar contemporâneo, onde os princípios morais da humanidade colidem com as inovações tecnológicas. Do romance ao terror, da comédia ao drama, cada episódio explora uma narrativa diferente, traçando uma antologia que mostra o lado danoso da vida dependente da tecnologia.",
    imagem: "https://portaln10.com.br/wp-content/uploads/2025/03/black-mirror-poster-gbqux8n5pndwjdrn-768x432.jpg",
    descImagem: "Imagem promocional da série Black Mirror"
};

/* ============================================================
   HOME — Carrossel
   ============================================================ */

const carouselEl = document.getElementById("carousel");
const carouselTrack = document.getElementById("carousel_track");
const carouselDots = document.getElementById("carousel_dots");
const carouselPrev = document.getElementById("carousel_prev");
const carouselNext = document.getElementById("carousel_next");

let slideAtual = 0;
let totalSlides = 0;
let autoPlayTimer = null;

function criarSlide(serie) {
    const slide = document.createElement("a");
    slide.classList.add("carousel_slide");
    slide.href = "card.html";
    slide.style.backgroundImage = `url("${serie.imagem}")`;

    slide.addEventListener("click", () => {
        sessionStorage.setItem(CHAVE_SERIE_SELECIONADA, JSON.stringify(serie));
    });

    const content = document.createElement("div");
    content.classList.add("carousel_content");

    const badge = document.createElement("span");
    badge.classList.add("carousel_badge");
    badge.textContent = "★ Destaque";

    const titulo = document.createElement("h2");
    titulo.classList.add("carousel_title");
    titulo.textContent = serie.titulo || "Série sem título";

    const desc = document.createElement("p");
    desc.classList.add("carousel_desc");
    desc.textContent = truncarTexto(serie.descricao || "", 160);

    const btn = document.createElement("span");
    btn.classList.add("carousel_btn");
    btn.textContent = "Ver detalhes";

    content.append(badge, titulo, desc, btn);
    slide.appendChild(content);

    return slide;
}

function criarDot(index) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.classList.add("carousel_dot");
    dot.setAttribute("aria-label", `Ir para slide ${index + 1}`);
    dot.addEventListener("click", () => irParaSlide(index));
    return dot;
}

function irParaSlide(index) {
    if (totalSlides === 0) return;
    slideAtual = (index + totalSlides) % totalSlides;

    carouselTrack.style.transform = `translateX(-${slideAtual * 100}%)`;

    const dots = carouselDots.querySelectorAll(".carousel_dot");
    dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === slideAtual);
    });
}

function iniciarAutoPlay() {
    pararAutoPlay();
    if (totalSlides <= 1) return;

    autoPlayTimer = setInterval(() => {
        irParaSlide(slideAtual + 1);
    }, 6000);
}

function pararAutoPlay() {
    if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
    }
}

function montarCarrossel() {
    if (!carouselEl || !carouselTrack || !carouselDots) return;

    const series = lerSeries();

    if (series.length === 0) {
        carouselEl.hidden = true;
        return;
    }

    // Pega até 5 mais recentes pro carrossel
    const destaques = series.slice(-5).reverse();

    carouselEl.hidden = false;
    carouselTrack.innerHTML = "";
    carouselDots.innerHTML = "";

    destaques.forEach((serie) => {
        carouselTrack.appendChild(criarSlide(serie));
    });

    totalSlides = destaques.length;

    if (totalSlides > 1) {
        destaques.forEach((_, i) => {
            carouselDots.appendChild(criarDot(i));
        });
    }

    slideAtual = 0;
    irParaSlide(0);
    iniciarAutoPlay();

    if (carouselPrev) {
        carouselPrev.addEventListener("click", (e) => {
            e.preventDefault();
            irParaSlide(slideAtual - 1);
            iniciarAutoPlay();
        });
    }

    if (carouselNext) {
        carouselNext.addEventListener("click", (e) => {
            e.preventDefault();
            irParaSlide(slideAtual + 1);
            iniciarAutoPlay();
        });
    }

    carouselEl.addEventListener("mouseenter", pararAutoPlay);
    carouselEl.addEventListener("mouseleave", iniciarAutoPlay);
}

/* ============================================================
   HOME — Catálogo (grid de cards)
   ============================================================ */

const container = document.getElementById("series_catalog");
const counterEl = document.getElementById("catalog_counter");
const emptyStateEl = document.getElementById("empty_state");
const searchInput = document.getElementById("search_input");
const sortSelect = document.getElementById("sort_select");
const genreFilterEl = document.getElementById("genre_filter");

let filtroBusca = "";
let filtroGenero = "todos";
let ordenacaoAtual = "recentes";

function criarCard(serie) {
    const card = document.createElement("div");
    card.classList.add("serie-card");

    const imgWrap = document.createElement("div");
    imgWrap.classList.add("serie-card_image_wrap");

    const imagem = document.createElement("img");
    imagem.src = serie.imagem || "";
    imagem.alt = serie.descImagem || `Imagem da série ${serie.titulo || ""}`;
    imagem.loading = "lazy";

    const acoes = document.createElement("div");
    acoes.classList.add("serie-card_actions");

    const btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.classList.add("card_action_btn", "edit");
    btnEditar.title = "Editar série";
    btnEditar.textContent = "✎";
    btnEditar.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        sessionStorage.setItem(CHAVE_SERIE_EDITANDO, JSON.stringify(serie));
        window.location.href = "form.html";
    });

    const btnDeletar = document.createElement("button");
    btnDeletar.type = "button";
    btnDeletar.classList.add("card_action_btn", "delete");
    btnDeletar.title = "Deletar série";
    btnDeletar.textContent = "✕";
    btnDeletar.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        abrirModalDeletar(serie);
    });

    acoes.append(btnEditar, btnDeletar);
    imgWrap.append(imagem, acoes);

    const info = document.createElement("div");
    info.classList.add("serie-card_info");

    const titulo = document.createElement("h3");
    titulo.textContent = serie.titulo || "Série sem título";

    const meta = document.createElement("div");
    meta.classList.add("serie-card_meta");

    const nota = calcularMedia(serie.id);
    if (nota > 0) {
        const rating = document.createElement("span");
        rating.classList.add("serie-card_rating");
        rating.textContent = "★ " + nota.toFixed(1);
        meta.appendChild(rating);
    }

    if (serie.genero) {
        const genero = document.createElement("span");
        genero.classList.add("serie-card_genre");
        genero.textContent = serie.genero;
        meta.appendChild(genero);
    }

    info.append(titulo, meta);

    const link = document.createElement("a");
    link.href = "card.html";
    link.style.textDecoration = "none";
    link.style.color = "inherit";
    link.style.display = "block";
    link.addEventListener("click", () => {
        sessionStorage.setItem(CHAVE_SERIE_SELECIONADA, JSON.stringify(serie));
    });

    card.append(imgWrap, info);
    link.appendChild(card);

    return link;
}

function aplicarFiltros(lista) {
    let resultado = lista.slice();

    if (filtroBusca.trim() !== "") {
        const busca = filtroBusca.toLowerCase();
        resultado = resultado.filter((s) =>
            (s.titulo || "").toLowerCase().includes(busca)
        );
    }

    if (filtroGenero !== "todos") {
        resultado = resultado.filter((s) => s.genero === filtroGenero);
    }

    switch (ordenacaoAtual) {
        case "recentes":
            resultado.reverse();
            break;
        case "antigas":
            break;
        case "az":
            resultado.sort((a, b) =>
                (a.titulo || "").localeCompare(b.titulo || "", "pt-BR")
            );
            break;
        case "za":
            resultado.sort((a, b) =>
                (b.titulo || "").localeCompare(a.titulo || "", "pt-BR")
            );
            break;
        case "melhores":
            resultado.sort(
                (a, b) => calcularMedia(b.id) - calcularMedia(a.id)
            );
            break;
    }

    return resultado;
}

function renderizarCatalogo() {
    if (!container) return;

    const todas = lerSeries();

    if (todas.length === 0) {
        if (counterEl) counterEl.textContent = "0 séries";
        if (emptyStateEl) emptyStateEl.hidden = false;
        container.innerHTML = "";
        return;
    }

    if (emptyStateEl) emptyStateEl.hidden = true;

    const visiveis = aplicarFiltros(todas);

    if (counterEl) {
        const total = todas.length;
        counterEl.textContent = total === 1 ? "1 série" : total + " séries";
    }

    container.innerHTML = "";

    if (visiveis.length === 0) {
        const vazio = document.createElement("p");
        vazio.style.width = "100%";
        vazio.style.textAlign = "center";
        vazio.style.color = "var(--text-faint)";
        vazio.style.padding = "40px 0";
        vazio.style.fontFamily = "Arial, sans-serif";
        vazio.textContent = "Nenhuma série corresponde à sua busca.";
        container.appendChild(vazio);
        return;
    }

    visiveis.forEach((serie, index) => {
        const card = criarCard(serie);
        card.style.animationDelay = (index * 0.04) + "s";
        container.appendChild(card);
    });
}

function renderizarChips() {
    if (!genreFilterEl) return;

    const todas = lerSeries();

    if (todas.length === 0) {
        genreFilterEl.innerHTML = "";
        return;
    }

    const generosSet = new Set();
    todas.forEach((s) => {
        if (s.genero) generosSet.add(s.genero);
    });

    const generos = Array.from(generosSet).sort();

    if (generos.length === 0) {
        genreFilterEl.innerHTML = "";
        return;
    }

    genreFilterEl.innerHTML = "";

    const chipTodos = document.createElement("button");
    chipTodos.type = "button";
    chipTodos.classList.add("genre_chip");
    if (filtroGenero === "todos") chipTodos.classList.add("active");
    chipTodos.textContent = "Todos";
    chipTodos.addEventListener("click", () => {
        filtroGenero = "todos";
        renderizarChips();
        renderizarCatalogo();
    });
    genreFilterEl.appendChild(chipTodos);

    generos.forEach((g) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.classList.add("genre_chip");
        if (filtroGenero === g) chip.classList.add("active");
        chip.textContent = g;
        chip.addEventListener("click", () => {
            filtroGenero = g;
            renderizarChips();
            renderizarCatalogo();
        });
        genreFilterEl.appendChild(chip);
    });
}

if (container && document.querySelector(".home_content")) {
    montarCarrossel();
    renderizarChips();
    renderizarCatalogo();

    if (searchInput) {
        searchInput.addEventListener("input", (event) => {
            filtroBusca = event.target.value;
            renderizarCatalogo();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", (event) => {
            ordenacaoAtual = event.target.value;
            renderizarCatalogo();
        });
    }
}

/* ============================================================
   MODAL DE CONFIRMAÇÃO (deletar)
   ============================================================ */

const modalOverlay = document.getElementById("modal_overlay");
const modalText = document.getElementById("modal_text");
const modalCancel = document.getElementById("modal_cancel");
const modalConfirm = document.getElementById("modal_confirm");

let serieParaDeletar = null;

function abrirModalDeletar(serie) {
    if (!modalOverlay) return;
    serieParaDeletar = serie;
    if (modalText) {
        modalText.textContent = `Tem certeza que deseja deletar "${serie.titulo}"? Essa ação não pode ser desfeita.`;
    }
    modalOverlay.hidden = false;
}

function fecharModalDeletar() {
    if (!modalOverlay) return;
    modalOverlay.hidden = true;
    serieParaDeletar = null;
}

if (modalCancel) {
    modalCancel.addEventListener("click", fecharModalDeletar);
}

if (modalOverlay) {
    modalOverlay.addEventListener("click", (event) => {
        if (event.target === modalOverlay) fecharModalDeletar();
    });
}

if (modalConfirm) {
    modalConfirm.addEventListener("click", () => {
        if (!serieParaDeletar) return;

        const lista = lerSeries();
        const novaLista = lista.filter((s) => s.id !== serieParaDeletar.id);
        salvarSeries(novaLista);

        const avaliacoes = lerAvaliacoes();
        delete avaliacoes[serieParaDeletar.id];
        salvarAvaliacoes(avaliacoes);

        fecharModalDeletar();
        montarCarrossel();
        renderizarChips();
        renderizarCatalogo();
    });
}

/* ============================================================
   FORM — cadastro e edição
   ============================================================ */

const formulario = document.getElementById("meu_formulario");

if (formulario) {
    const inputTitulo = document.getElementById("stitulo");
    const inputGenero = document.getElementById("genero");
    const inputImagem = document.getElementById("image");
    const inputDesc = document.getElementById("desc");
    const formTitle = document.getElementById("form_title");
    const submitBtn = document.getElementById("submit_button");
    const cancelLink = document.getElementById("cancel_link");
    const previewWrap = document.getElementById("image_preview");
    const previewImg = document.getElementById("preview_img");
    const previewRemove = document.getElementById("preview_remove");

    const erroTitulo = document.getElementById("erro_titulo");
    const erroGenero = document.getElementById("erro_genero");
    const erroImagem = document.getElementById("erro_image");
    const erroDesc = document.getElementById("erro_desc");

    let imagemBase64 = "";
    let serieEditandoId = null;
    let imagemOriginal = "";

    /* ---------- Modo edição ---------- */

    try {
        const dados = sessionStorage.getItem(CHAVE_SERIE_EDITANDO);
        if (dados) {
            const serie = JSON.parse(dados);
            serieEditandoId = serie.id;
            imagemOriginal = serie.imagem || "";
            imagemBase64 = serie.imagem || "";

            inputTitulo.value = serie.titulo || "";
            inputGenero.value = serie.genero || "";
            inputDesc.value = serie.descricao || "";

            if (serie.imagem) {
                previewImg.src = serie.imagem;
                previewWrap.hidden = false;
            }

            if (formTitle) formTitle.textContent = "Editar série";
            if (submitBtn) submitBtn.textContent = "Salvar alterações";
            if (cancelLink) cancelLink.hidden = false;

            sessionStorage.removeItem(CHAVE_SERIE_EDITANDO);
        }
    } catch (erro) {
        console.warn("Erro ao carregar edição:", erro);
    }

    /* ---------- Preview de imagem ---------- */

    inputImagem.addEventListener("change", () => {
        const file = inputImagem.files[0];
        if (!file) return;

        const leitor = new FileReader();
        leitor.onload = () => {
            imagemBase64 = leitor.result;
            previewImg.src = imagemBase64;
            previewWrap.hidden = false;
        };
        leitor.readAsDataURL(file);
    });

    previewRemove.addEventListener("click", () => {
        imagemBase64 = "";
        inputImagem.value = "";
        previewWrap.hidden = true;
        previewImg.src = "";
    });

    /* ---------- Validação ---------- */

    function limparErros() {
        [inputTitulo, inputGenero, inputImagem, inputDesc].forEach((el) => {
            el.classList.remove("invalid");
        });
        erroTitulo.textContent = "";
        erroGenero.textContent = "";
        erroImagem.textContent = "";
        erroDesc.textContent = "";
    }

    function validar() {
        limparErros();
        let valido = true;

        if (!inputTitulo.value.trim()) {
            inputTitulo.classList.add("invalid");
            erroTitulo.textContent = "Informe o nome da série.";
            valido = false;
        }

        if (!inputGenero.value) {
            inputGenero.classList.add("invalid");
            erroGenero.textContent = "Escolha um gênero.";
            valido = false;
        }

        if (!imagemBase64) {
            inputImagem.classList.add("invalid");
            erroImagem.textContent = "Selecione uma imagem de capa.";
            valido = false;
        }

        if (!inputDesc.value.trim()) {
            inputDesc.classList.add("invalid");
            erroDesc.textContent = "Escreva uma sinopse.";
            valido = false;
        }

        return valido;
    }

    [inputTitulo, inputGenero, inputDesc].forEach((el) => {
        el.addEventListener("input", () => {
            el.classList.remove("invalid");
        });
    });

    inputImagem.addEventListener("change", () => {
        inputImagem.classList.remove("invalid");
    });

    /* ---------- Submit ---------- */

    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();

        if (!validar()) return;

        const titulo = inputTitulo.value.trim();
        const genero = inputGenero.value;
        const descricao = inputDesc.value.trim();

        const lista = lerSeries();

        if (serieEditandoId) {
            const index = lista.findIndex((s) => s.id === serieEditandoId);
            if (index !== -1) {
                lista[index] = {
                    ...lista[index],
                    titulo: titulo,
                    genero: genero,
                    descricao: descricao,
                    imagem: imagemBase64 || imagemOriginal,
                    descImagem: `Imagem da série ${titulo}`
                };
                salvarSeries(lista);
            }
            submitBtn.textContent = "✓ Alterações salvas!";
        } else {
            const novaSerie = {
                id: gerarId(),
                titulo: titulo,
                genero: genero,
                descricao: descricao,
                imagem: imagemBase64,
                descImagem: `Imagem da série ${titulo}`
            };
            lista.push(novaSerie);
            salvarSeries(lista);
            submitBtn.textContent = "✓ Série adicionada!";
        }

        submitBtn.disabled = true;

        setTimeout(() => {
            window.location.href = "index.html";
        }, 900);
    });

    /* ---------- Cancelar edição ---------- */

    if (cancelLink) {
        cancelLink.addEventListener("click", (event) => {
            event.preventDefault();
            sessionStorage.removeItem(CHAVE_SERIE_EDITANDO);
            window.location.href = "index.html";
        });
    }
}

/* ============================================================
   CARD — página de detalhes da série
   ============================================================ */

const serieImageEl = document.getElementById("serie_image");
const serieNameEl = document.getElementById("serie_name");
const serieGenreEl = document.getElementById("serie_genre");
const sinopseEl = document.getElementById("sinopse");
const starsEl = document.getElementById("stars");
const btnEditEl = document.getElementById("btn_edit");
const backdropEl = document.getElementById("movie_backdrop");

if (serieImageEl && serieNameEl && sinopseEl) {
    let serie = null;

    try {
        const dados = sessionStorage.getItem(CHAVE_SERIE_SELECIONADA);
        if (dados) serie = JSON.parse(dados);
    } catch (erro) {
        console.warn("Erro ao ler série selecionada:", erro);
    }

    if (!serie) serie = serieDestaque;

    serieImageEl.src = serie.imagem || "";
    serieImageEl.alt = serie.descImagem || `Imagem da série ${serie.titulo || ""}`;
    serieNameEl.textContent = serie.titulo || "Série sem título";
    sinopseEl.textContent = serie.descricao || "Sem sinopse disponível.";

    if (backdropEl && serie.imagem) {
        backdropEl.style.backgroundImage = `url("${serie.imagem}")`;
    }

    if (serieGenreEl) {
        if (serie.genero) {
            serieGenreEl.textContent = serie.genero;
        } else {
            serieGenreEl.hidden = true;
        }
    }

    if (btnEditEl) {
        btnEditEl.addEventListener("click", () => {
            sessionStorage.setItem(CHAVE_SERIE_EDITANDO, JSON.stringify(serie));
        });
    }

    /* ---------- Estrelas clicáveis ---------- */

    if (starsEl) {
        const serieId = serie.id || serie.titulo;
        starsEl.dataset.serieId = serieId;

        const estrelas = starsEl.querySelectorAll("span");

        function pintarEstrelas(nota) {
            estrelas.forEach((estrela) => {
                const valor = Number(estrela.dataset.value);
                estrela.style.color = valor <= nota ? "var(--accent)" : "rgba(255, 255, 255, 0.3)";
            });
        }

        const avaliacoes = lerAvaliacoes();
        const notaAtual = avaliacoes[serieId] || 0;
        pintarEstrelas(notaAtual);

        estrelas.forEach((estrela) => {
            estrela.addEventListener("click", () => {
                const nota = Number(estrela.dataset.value);

                const lista = lerAvaliacoes();
                lista[serieId] = nota;
                salvarAvaliacoes(lista);

                pintarEstrelas(nota);
            });
        });
    }
}