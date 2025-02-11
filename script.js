console.log('====================================');
console.log("Connected");
console.log('====================================');

// Function to format price in Indian Rupees
const formatPrice = (price) => {
    if (!price) return '₹0.00';
    const priceInRupees = price / 100;
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(priceInRupees);
};

class ShoppingCart {
    constructor() {
        this.cartContainer = document.querySelector('.cart-table');
        this.cartTotals = document.querySelector('.cart-totals');
        this.cartData = null;

        this.init();
    }

    async init() {
        try {
            const response = await fetch('https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Parse the JSON response
            this.cartData = await response.json();

            // Render the cart with the fetched data
            this.renderCart();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error fetching cart data:', error);
        }
    }

    renderCart() {
        if (!this.cartData || !this.cartData.items.length) {
            this.renderEmptyCart();
            return;
        }

        let cartHTML = `
            <div class="cart-header">
                <div>Product</div>
                <div>Price</div>
                <div>Quantity</div>
                <div>Subtotal</div>
                <div></div>
            </div>
        `;

        this.cartData.items.forEach(item => {
            const itemSubtotal = item.price * item.quantity;
            cartHTML += `
                <div class="cart-item" data-id="${item.id}">
                    <div class="product-info">
                        <img src="${item.image}" alt="${item.title}" class="product-image lazy-loading">
                        <span class="title">${item.title}</span>
                    </div>
                    <div class="price">${formatPrice(item.price)}</div>
                    <div>
                        <input type="number" 
                               value="${item.quantity}" 
                               min="1" 
                               class="quantity-input" 
                               data-id="${item.id}">
                    </div>
                    <div class="item-subtotal">${formatPrice(itemSubtotal)}</div>
                    <div>
                        <i id="delete" class="fa-solid fa-trash delete-item" data-id="${item.id}" aria-label="Delete Item" tabindex="0"></i>
                    </div>
                </div>
            `;
        });

        this.cartContainer.innerHTML = cartHTML;
        this.updateTotals();
    }

    renderEmptyCart() {
        this.cartContainer.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty</p>
            </div>
        `;
        this.updateTotals();
    }

    updateTotals() {
        const subtotal = this.calculateSubtotal();
        const total = subtotal;

        this.cartTotals.innerHTML = `
            <h2>Cart Totals</h2>
            <div class="totals-row">
                <span>Subtotal</span>
                <span>${formatPrice(subtotal)}</span>
            </div>
            <div class="totals-row">
                <span>Total</span>
                <span class="total">${formatPrice(total)}</span>
            </div>
            <button class="checkout-btn" ${!this.cartData.items.length ? 'disabled' : ''}>
                Check Out
            </button>
        `;
    }

    calculateSubtotal() {
        return this.cartData.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    updateQuantity(itemId, newQuantity) {
        const item = this.cartData.items.find(item => item.id === itemId);
        if (item) {
            // Update the item's quantity
            item.quantity = newQuantity;

            // Update the subtotal for the item
            const itemSubtotal = item.price * item.quantity;

            const itemElement = this.cartContainer.querySelector(`.cart-item[data-id="${itemId}"]`);
            if (itemElement) {
                const subtotalElement = itemElement.querySelector('.item-subtotal');
                subtotalElement.textContent = formatPrice(itemSubtotal);
            }

            // Update the total cart value
            this.updateTotals();
        }
    }

    removeItem(itemId) {
        this.cartData.items = this.cartData.items.filter(item => item.id !== itemId);
        this.renderCart();
    }

    handleCheckout() {
        alert('Proceeding to checkout...');
    }

    setupEventListeners() {
        // Quantity change handler
        this.cartContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                const id = parseInt(e.target.dataset.id);
                const newQuantity = Math.max(1, parseInt(e.target.value));
                this.updateQuantity(id, newQuantity);
            }
        });

        // Delete item handler
        this.cartContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-item')) {
                const id = parseInt(e.target.dataset.id);
                this.removeItem(id);
            }
        });

        // Checkout handler
        this.cartTotals.addEventListener('click', (e) => {
            if (e.target.classList.contains('checkout-btn') && !e.target.disabled) {
                this.handleCheckout();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ShoppingCart();
});
