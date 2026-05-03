const BUTTON = document.getElementById("background_button")

BUTTON.addEventListener("click", () => {
    document.body.classList.toggle("dark_background")
})


document.getElementById("meu_formulario").addEventListener("submit", (evento) => {
    evento.preventDefault();

    const fileInput = document.getElementById("image");
    const file = fileInput.files[0];

    const novo = {
        titulo: document.getElementById("stitulo").value,
        imagem: URL.createObjectURL(file),
        descricao: document.getElementById("desc").value
    };

    render(novo);

    evento.target.reset();
});

function render(novo) {
    const colecao = document.getElementById("series_catalog");

    colecao.innerHTML += `
        <div class="catalog_element">
            <img src="${novo.imagem}">
            <h3>${novo.titulo}</h3>
        </div>
    `;
}