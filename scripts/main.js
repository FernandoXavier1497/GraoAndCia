// Carrinho de Compras
document.addEventListener('DOMContentLoaded', function() {
    // Variáveis do carrinho
    let cart = [];
    let cartCount = 0;
    let cartTotal = 0;
    
    // Elementos do DOM
    const cartIcon = document.querySelector('.cart-icon');
    const cartCountElement = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartItemsList = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutModal = document.getElementById('checkout-modal');
    const closeModal = document.querySelector('.close-modal');
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total');
    const checkoutForm = document.getElementById('checkout-form');
    const backToCartBtn = document.getElementById('back-to-cart');
    
    // Armazenar referência aos listeners para poder removê-los
    const buttonListeners = new WeakMap();
    
    // Mostrar/ocultar carrinho
    cartIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        cartItemsContainer.style.display = cartItemsContainer.style.display === 'block' ? 'none' : 'block';
    });
    
    // Fechar carrinho ao clicar fora
    document.addEventListener('click', function() {
        cartItemsContainer.style.display = 'none';
    });
    
    // Evitar que o clique no carrinho feche o próprio carrinho
    cartItemsContainer.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Modal de checkout
    const checkoutBtn = document.createElement('button');
    checkoutBtn.className = 'btn checkout-btn';
    checkoutBtn.textContent = 'Finalizar Pedido';
    checkoutBtn.addEventListener('click', openCheckoutModal);
    cartItemsContainer.appendChild(checkoutBtn);
    
    // Fechar modal
    closeModal.addEventListener('click', function() {
        checkoutModal.style.display = 'none';
    });

    // Botão Voltar para o Carrinho
    backToCartBtn.addEventListener('click', function(e) {
        e.preventDefault();
        checkoutModal.style.display = 'none';
        cartItemsContainer.style.display = 'block';
    });

    // Mostrar/Ocultar Cardápio Completo
    const toggleMenuBtn = document.getElementById('toggleMenu');
    const fullMenu = document.getElementById('fullMenu');
    
    if (toggleMenuBtn && fullMenu) {
        toggleMenuBtn.addEventListener('click', function() {
            const isHidden = fullMenu.style.display === 'none' || fullMenu.style.display === '';
            fullMenu.style.display = isHidden ? 'block' : 'none';
            toggleMenuBtn.textContent = isHidden ? 'Ocultar cardápio' : 'Ver cardápio completo';
            
            if (isHidden) {
                setTimeout(() => {
                    fullMenu.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        });
    }

    // Função para adicionar listeners aos botões
    function setupAddToCartButtons() {
        // Primeiro remove todos os listeners existentes
        const allButtons = document.querySelectorAll('.add-to-cart');
        allButtons.forEach(button => {
            const existingListener = buttonListeners.get(button);
            if (existingListener) {
                button.removeEventListener('click', existingListener);
            }
        });
        
        // Adiciona novos listeners
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
            const listener = function(e) {
                e.preventDefault();
                const box = this.closest('.box');
                const itemName = box.querySelector('h3').textContent;
                const itemPrice = parseFloat(box.querySelector('.price').textContent.replace('R$ ', '').replace(',', '.'));
                const itemImage = box.querySelector('img').src;
                
                addToCart(itemName, itemPrice, itemImage);
            };
            
            button.addEventListener('click', listener);
            buttonListeners.set(button, listener);
        });
    }
    
    // Configurar os botões inicialmente
    setupAddToCartButtons();
    
    // Observar mudanças no DOM para configurar botões novos
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                // Verifica se algum nó adicionado contém botões .add-to-cart
                const hasAddToCartButtons = Array.from(mutation.addedNodes).some(node => {
                    return node.nodeType === 1 && (node.classList.contains('add-to-cart') || node.querySelector('.add-to-cart'));
                });
                
                if (hasAddToCartButtons) {
                    // Pequeno delay para garantir que o DOM esteja pronto
                    setTimeout(setupAddToCartButtons, 50);
                }
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Função para adicionar item ao carrinho
    function addToCart(name, price, image) {
        // Verifica se o item já está no carrinho
        const existingItem = cart.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name: name,
                price: price,
                image: image,
                quantity: 1
            });
        }
        
        updateCart();
        
        // Feedback visual
        showFeedback(`${name} adicionado ao carrinho!`);
    }
    
    // Mostrar feedback visual
    function showFeedback(message) {
        // Remove feedbacks anteriores
        const oldFeedback = document.querySelector('.cart-feedback');
        if (oldFeedback) {
            document.body.removeChild(oldFeedback);
        }
        
        const feedback = document.createElement('div');
        feedback.className = 'cart-feedback';
        feedback.textContent = message;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            feedback.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(feedback);
            }, 300);
        }, 2000);
    }
    
    // Função para atualizar o carrinho
    function updateCart() {
        // Atualizar contador
        cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = cartCount;
        
        // Atualizar total
        cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        cartTotalElement.textContent = cartTotal.toFixed(2).replace('.', ',');
        
        // Atualizar itens no carrinho
        cartItemsList.innerHTML = '';
        
        if (cart.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = 'Seu carrinho está vazio';
            cartItemsList.appendChild(emptyMessage);
            checkoutBtn.style.display = 'none';
        } else {
            checkoutBtn.style.display = 'block';
            cart.forEach(item => {
                const cartItem = document.createElement('li');
                cartItem.className = 'cart-item';
                
                const itemImage = document.createElement('img');
                itemImage.src = item.image;
                itemImage.alt = item.name;
                itemImage.className = 'cart-item-image';
                
                const itemInfo = document.createElement('div');
                itemInfo.className = 'cart-item-info';
                
                const itemName = document.createElement('span');
                itemName.className = 'cart-item-name';
                itemName.textContent = item.name;
                
                const itemPrice = document.createElement('span');
                itemPrice.className = 'cart-item-price';
                itemPrice.textContent = `R$ ${item.price.toFixed(2).replace('.', ',')}`;
                
                const itemQuantity = document.createElement('div');
                itemQuantity.className = 'cart-item-quantity';
                
                const decreaseBtn = document.createElement('button');
                decreaseBtn.textContent = '-';
                decreaseBtn.addEventListener('click', () => {
                    if (item.quantity > 1) {
                        item.quantity -= 1;
                    } else {
                        cart = cart.filter(cartItem => cartItem.name !== item.name);
                    }
                    updateCart();
                });
                
                const quantityDisplay = document.createElement('span');
                quantityDisplay.textContent = item.quantity;
                
                const increaseBtn = document.createElement('button');
                increaseBtn.textContent = '+';
                increaseBtn.addEventListener('click', () => {
                    item.quantity += 1;
                    updateCart();
                });
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-item';
                removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
                removeBtn.addEventListener('click', () => {
                    cart = cart.filter(cartItem => cartItem.name !== item.name);
                    updateCart();
                });
                
                itemQuantity.appendChild(decreaseBtn);
                itemQuantity.appendChild(quantityDisplay);
                itemQuantity.appendChild(increaseBtn);
                
                itemInfo.appendChild(itemName);
                itemInfo.appendChild(itemPrice);
                itemInfo.appendChild(itemQuantity);
                
                cartItem.appendChild(itemImage);
                cartItem.appendChild(itemInfo);
                cartItem.appendChild(removeBtn);
                
                cartItemsList.appendChild(cartItem);
            });
        }
    }
    
    // Abrir modal de checkout
    function openCheckoutModal() {
        if (cart.length === 0) {
            showFeedback('Seu carrinho está vazio!');
            return;
        }
        
        checkoutItems.innerHTML = '';
        
        cart.forEach(item => {
            const checkoutItem = document.createElement('div');
            checkoutItem.className = 'checkout-item';
            
            const itemName = document.createElement('span');
            itemName.textContent = `${item.quantity}x ${item.name}`;
            
            const itemTotal = document.createElement('span');
            itemTotal.textContent = `R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}`;
            
            checkoutItem.appendChild(itemName);
            checkoutItem.appendChild(itemTotal);
            checkoutItems.appendChild(checkoutItem);
        });
        
        checkoutTotal.textContent = cartTotal.toFixed(2).replace('.', ',');
        checkoutModal.style.display = 'block';

        // Rola para o topo do modal
        document.querySelector('.modal-content').scrollTop = 0;
    }
    
    // Enviar formulário de checkout
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const payment = document.getElementById('payment').value;
        
        // Validação básica
        if (!name || !phone || !payment) {
            showFeedback('Por favor, preencha todos os campos!');
            return;
        }
        
        // Aqui você pode adicionar a lógica para enviar o pedido
        // Por exemplo, enviar para um servidor ou exibir uma mensagem de confirmação
        
        alert(`Pedido confirmado!\n\nNome: ${name}\nTelefone: ${phone}\nForma de pagamento: ${getPaymentMethod(payment)}\nTotal: R$ ${cartTotal.toFixed(2).replace('.', ',')}\n\nObrigado por sua compra!`);
        
        // Limpar carrinho após finalizar
        cart = [];
        updateCart();
        checkoutModal.style.display = 'none';
        checkoutForm.reset();
    });
    
    // Função auxiliar para obter o método de pagamento
    function getPaymentMethod(value) {
        switch(value) {
            case 'credit': return 'Cartão de Crédito';
            case 'debit': return 'Cartão de Débito';
            case 'pix': return 'PIX';
            case 'cash': return 'Dinheiro';
            default: return 'Não especificado';
        }
    }
    
    // Inicializar carrinho
    updateCart();
});

// Loader
window.addEventListener('load', function() {
    const loader = document.querySelector('.loader');
    loader.style.display = 'none';
});