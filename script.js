document.addEventListener('DOMContentLoaded', () => {
    // Corrigido: Selecionando pela classe, que existe no HTML
    const produtosContainer = document.querySelector('.card-container');
    const campoBusca = document.getElementById('campo-busca');
    const botaoBusca = document.getElementById('botao-busca');
    
    let todosOsProdutos = []; // Armazena todos os produtos carregados do JSON
    let carrinho = []; // Array para armazenar os produtos adicionados ao carrinho

    async function carregarProdutos() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            todosOsProdutos = await response.json();
            exibirProdutos(todosOsProdutos); // Exibe todos os produtos inicialmente
            criarMenuCategorias(); // Cria os links das categorias
        } catch (error) {
            console.error("Não foi possível carregar os produtos:", error);
            produtosContainer.innerHTML = '<p>Erro ao carregar produtos. Tente novamente mais tarde.</p>';
        }
    }

    // Função simplificada para renderizar os produtos na tela
    function exibirProdutos(produtosParaExibir) {
        produtosContainer.innerHTML = ''; // Limpa a tela antes de exibir novos produtos

        if (produtosParaExibir.length === 0) {
            produtosContainer.innerHTML = '<p>Nenhum produto encontrado.</p>';
            return;
        }
        
        produtosParaExibir.forEach(produto => {
            const cardProduto = document.createElement('article'); // Usando <article> como no seu CSS
            cardProduto.innerHTML = `
                <img src="${produto.imagem}" alt="${produto.nome}">
                <h2>${produto.nome}</h2>
                <p>${produto.descricao}</p>
                <p><strong>Preço:</strong> R$ ${produto.preco}</p>
                <button class="botao-adicionar">Adicionar ao Carrinho</button>
            `;
            cardProduto.querySelector('.botao-adicionar').addEventListener('click', () => {
                adicionarAoCarrinho(produto);
            });
            produtosContainer.appendChild(cardProduto);
        });
    }

    // Função para criar o menu de categorias dinamicamente
    function criarMenuCategorias() {
        const navContainer = document.getElementById('categorias-nav');
        if (!navContainer) return; // Se o container não existir, não faz nada

        // Pega todas as categorias únicas dos produtos
        const categorias = ['todos', ...new Set(todosOsProdutos.map(p => p.categoria))];
        
        navContainer.innerHTML = '';
        
        categorias.forEach(categoria => {
            const linkCategoria = document.createElement('a');
            linkCategoria.href = '#';
            linkCategoria.textContent = categoria.charAt(0).toUpperCase() + categoria.slice(1);
            linkCategoria.addEventListener('click', (e) => {
                e.preventDefault();
                filtrarPorCategoria(categoria);
            });
            navContainer.appendChild(linkCategoria);
        });
    }

    // Função para a busca no input
    function iniciarBusca() {
        const termoBusca = campoBusca.value.toLowerCase();
        if (!termoBusca) {
            exibirProdutos(todosOsProdutos); // Se a busca estiver vazia, mostra todos
            return;
        }
        const produtosFiltrados = todosOsProdutos.filter(produto => 
            produto.nome.toLowerCase().includes(termoBusca) ||
            produto.descricao.toLowerCase().includes(termoBusca)
        );
        exibirProdutos(produtosFiltrados);
    }
    
    // Função para filtrar por categoria ao clicar nos links
    function filtrarPorCategoria(categoria) {
        if (categoria === 'todos') {
            exibirProdutos(todosOsProdutos);
        } else {
            const produtosFiltrados = todosOsProdutos.filter(p => p.categoria === categoria);
            exibirProdutos(produtosFiltrados);
        }
    }

    // --- Funções do Carrinho ---
    function adicionarAoCarrinho(produto) {
        // Adiciona um ID único a cada item para facilitar a remoção
        const itemNoCarrinho = {
            ...produto,
            idUnico: Date.now() // Usamos um timestamp como ID único
        };
        carrinho.push(itemNoCarrinho);
        atualizarContadorCarrinho();
        // Você pode adicionar uma notificação mais elegante aqui depois
        console.log(`"${produto.nome}" foi adicionado ao carrinho!`);
    }

    function removerDoCarrinho(idUnico) {
        // Encontra o índice do item a ser removido
        const itemIndex = carrinho.findIndex(item => item.idUnico === idUnico);
        if (itemIndex > -1) {
            carrinho.splice(itemIndex, 1); // Remove o item do array
            atualizarContadorCarrinho();
            mostrarCarrinho(); // Atualiza a exibição do modal do carrinho
        }
    }

    function atualizarContadorCarrinho() {
        document.getElementById('contador-carrinho').textContent = carrinho.length;
    }

    // Expondo funções para o HTML (onclick)
    window.iniciarBusca = iniciarBusca;
    window.mostrarCarrinho = function() {
        const modal = document.getElementById('modal-carrinho');
        const itensCarrinhoDiv = document.getElementById('itens-carrinho');
        const listaTexto = document.getElementById('lista-carrinho-texto');
        const totalCarrinhoSpan = document.getElementById('total-carrinho');
        
        itensCarrinhoDiv.innerHTML = '';
        listaTexto.value = '';
        
        if (carrinho.length === 0) {
            itensCarrinhoDiv.innerHTML = '<p>Seu carrinho está vazio.</p>';
            listaTexto.value = 'Nenhum item no carrinho.';
            totalCarrinhoSpan.textContent = 'R$ 0.00';
        } else {
            let total = 0;
            let textoParaCopiar = 'Minha lista de compras:\n\n';

            carrinho.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('item-carrinho');
                // Adiciona o botão de remover com o ID único do item
                itemDiv.innerHTML = `
                    <span>${item.nome}</span>
                    <span>R$ ${item.preco}</span>
                    <button class="botao-remover-item" data-id="${item.idUnico}">&times;</button>
                `;
                itensCarrinhoDiv.appendChild(itemDiv);
                total += parseFloat(item.preco);
                textoParaCopiar += `- ${item.nome}\n`;
            });

            textoParaCopiar += `\nTotal: R$ ${total.toFixed(2)}`;
            listaTexto.value = textoParaCopiar;
            totalCarrinhoSpan.textContent = `R$ ${total.toFixed(2)}`;
        }

        // Adiciona os event listeners para os novos botões de remover
        document.querySelectorAll('.botao-remover-item').forEach(botao => {
            botao.addEventListener('click', () => removerDoCarrinho(parseInt(botao.dataset.id)));
        });
        modal.style.display = 'block';
    }

    window.fecharCarrinho = function() {
        document.getElementById('modal-carrinho').style.display = 'none';
    }

    window.copiarLista = function() {
        const listaTexto = document.getElementById('lista-carrinho-texto').value;
        navigator.clipboard.writeText(listaTexto).then(() => {
            alert("Lista copiada para a área de transferência!");
        });
    }

    window.onclick = function(event) {
        const modal = document.getElementById('modal-carrinho');
        if (event.target == modal) {
            fecharCarrinho();
        }
    }

    // --- Event Listeners ---
    // Remove o onclick do HTML e adiciona o listener aqui
    botaoBusca.addEventListener('click', iniciarBusca);
    // Adiciona busca ao pressionar Enter no campo de busca
    campoBusca.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            iniciarBusca();
        }
    });

    carregarProdutos();
});