// --- PRODUCT DATABASE (Gaming Gear) ---
const products = [
    { id: 1, name: "Pro Gaming Mouse", price: 59.99, image: "https://resource.logitech.com/content/dam/gaming/en/products/pro-x-superlight/pro-x-superlight-black-gallery-1.png" },
    { id: 2, name: "Mech Keyboard RGB", price: 129.99, image: "https://resource.logitech.com/content/dam/gaming/en/products/pro-x-keyboard/pro-x-keyboard-gallery-1.png" },
    { id: 3, name: "Surround Headset", price: 89.99, image: "headset.jpg" },
    { id: 4, name: "4K Gaming Monitor", price: 299.99, image: "monitor.jpg" },
    { id: 5, name: "Gaming Chair Elite", price: 199.99, image: "kursi.jpg" },
    { id: 6, name: "Console Controller", price: 49.99, image: "xbox.jpg" }
];

// --- CART STATE ---
let cart = JSON.parse(localStorage.getItem('myCart')) || [];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Render Products
    const productGrid = document.getElementById('productGrid');
    if (productGrid) {
        renderProducts(products);
    }

    // 2. Setup Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase();
            const filtered = products.filter(p => p.name.toLowerCase().includes(keyword));
            renderProducts(filtered);
        });
    }

    // 3. UI Updates
    updateCartCount();
    checkLogin();
});

// --- RENDER PRODUCTS ---
function renderProducts(items) {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = ''; 

    if (items.length === 0) {
        productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 20px;">No products found.</p>';
        return;
    }

    items.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
            <h3>${product.name}</h3>
            <p style="color: var(--primary-color); font-weight: bold; margin: 10px 0;">$${product.price}</p>
            <button class="add-to-cart" onclick="addToCart(${product.id})">
                <i class="fa-solid fa-cart-plus"></i> Add to Cart
            </button>
        `;
        productGrid.appendChild(card);
    });
}

// --- CART FUNCTIONS (UPDATED: LOGIN REQUIRED) ---
function addToCart(id) {
    // 1. CEK STATUS LOGIN DULU
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        // Jika belum login, stop dan minta login
        showToast("⚠️ Please Login to add items!");
        
        const loginModal = document.getElementById('loginModal');
        if(loginModal) {
            loginModal.style.display = 'block';
            showLoginForm();
        }
        return; // STOP! Jangan lanjut ke bawah
    }

    // 2. PROSES TAMBAH CART (Hanya jika sudah login)
    const product = products.find(p => p.id === id);
    if (product) {
        cart.push(product);
        saveCart();
        updateCartCount();
        showToast(`${product.name} added!`);
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCartItems();
    updateCartCount();
}

function saveCart() {
    localStorage.setItem('myCart', JSON.stringify(cart));
}

function updateCartCount() {
    const countEl = document.getElementById('cartCount');
    if(countEl) countEl.innerText = cart.length;
}

function calculateTotal() {
    return cart.reduce((total, item) => total + item.price, 0).toFixed(2);
}

// --- CART MODAL UI ---
const cartModal = document.getElementById('cartModal');
const openCartBtn = document.getElementById('openCartBtn');
const closeCart = document.getElementById('closeCart');

if(openCartBtn) {
    openCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Cek login saat buka cart juga (opsional, tapi bagus untuk UX)
        if (!localStorage.getItem('currentUser')) {
            showToast("⚠️ Please Login to view Cart!");
            document.getElementById('loginModal').style.display = 'block';
            showLoginForm();
            return;
        }
        
        cartModal.style.display = 'block';
        renderCartItems();
    });
}

if(closeCart) closeCart.addEventListener('click', () => cartModal.style.display = 'none');

function renderCartItems() {
    const container = document.getElementById('cartItemsContainer');
    const totalEl = document.getElementById('cartTotal');
    
    if(!container) return;

    container.innerHTML = '';
    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty.</p>';
    } else {
        cart.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <span>${item.name}</span>
                <div>
                    <span style="margin-right: 10px;">$${item.price}</span>
                    <i class="fa-solid fa-trash remove-item" onclick="removeFromCart(${index})" style="color: red; cursor: pointer;"></i>
                </div>
            `;
            container.appendChild(div);
        });
    }
    if(totalEl) totalEl.innerText = calculateTotal();
}

// --- CHECKOUT LOGIC ---
const checkoutBtn = document.getElementById('checkoutBtn');
const paymentModal = document.getElementById('paymentModal');

if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return showToast("Cart is empty!");
        
        // Double check login (meskipun sudah dicek di awal)
        if (!localStorage.getItem('currentUser')) return;

        cartModal.style.display = 'none';
        paymentModal.style.display = 'block';
        document.getElementById('payAmount').innerText = calculateTotal();
    });
}

// --- PAYMENT FORM (UPDATED) ---
const paymentForm = document.getElementById('paymentForm');
const closePayment = document.getElementById('closePayment');

if(closePayment) closePayment.addEventListener('click', () => paymentModal.style.display = 'none');

if(paymentForm) {
    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // 1. Ambil Metode Pembayaran yang dipilih
        const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        
        const btn = paymentForm.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = "Processing...";
        btn.disabled = true; // Mencegah klik double
        
        setTimeout(() => {
            // 2. Tampilkan pesan sukses dengan nama metodenya
            showToast(`Payment via ${selectedMethod} Successful!`);
            
            cart = []; // Kosongkan keranjang
            saveCart();
            updateCartCount();
            
            paymentModal.style.display = 'none';
            btn.innerText = originalText;
            btn.disabled = false;
            paymentForm.reset();
        }, 1500);
    });
}

// --- LOGIN & REGISTER SYSTEM ---
const loginModal = document.getElementById('loginModal');
const openLoginBtn = document.getElementById('openLoginBtn');
const closeLogin = document.getElementById('closeLogin');

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const linkToRegister = document.getElementById('linkToRegister');
const linkToLogin = document.getElementById('linkToLogin');

if(openLoginBtn) openLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'block';
    showLoginForm();
});

if(closeLogin) closeLogin.addEventListener('click', () => loginModal.style.display = 'none');

function showLoginForm() {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    if(tabLogin) {
        tabLogin.style.color = 'var(--primary-color)';
        tabLogin.style.borderBottom = '2px solid var(--primary-color)';
    }
    if(tabRegister) {
        tabRegister.style.color = '#888';
        tabRegister.style.borderBottom = 'none';
    }
}

function showRegisterForm() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'flex';
    registerForm.style.flexDirection = 'column';
    registerForm.style.gap = '10px';
    if(tabRegister) {
        tabRegister.style.color = 'var(--primary-color)';
        tabRegister.style.borderBottom = '2px solid var(--primary-color)';
    }
    if(tabLogin) {
        tabLogin.style.color = '#888';
        tabLogin.style.borderBottom = 'none';
    }
}

if(tabLogin) tabLogin.addEventListener('click', showLoginForm);
if(tabRegister) tabRegister.addEventListener('click', showRegisterForm);
if(linkToRegister) linkToRegister.addEventListener('click', showRegisterForm);
if(linkToLogin) linkToLogin.addEventListener('click', showLoginForm);

// REGISTER SUBMIT
if(registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('regUser').value;
        const pass = document.getElementById('regPass').value;
        
        let db = JSON.parse(localStorage.getItem('usersDB')) || [];
        if(db.find(u => u.username === user)) {
            showToast("Username already taken!");
        } else {
            db.push({ username: user, password: pass });
            localStorage.setItem('usersDB', JSON.stringify(db));
            showToast("Account Created! Please Login.");
            showLoginForm();
            registerForm.reset();
        }
    });
}

// LOGIN SUBMIT
if(loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userIn = document.getElementById('loginUser').value;
        const passIn = document.getElementById('loginPass').value;
        
        let db = JSON.parse(localStorage.getItem('usersDB')) || [];
        const valid = db.find(u => u.username === userIn && u.password === passIn);
        
        if(valid) {
            localStorage.setItem('currentUser', valid.username);
            showToast(`Welcome, ${valid.username}!`);
            loginModal.style.display = 'none';
            loginForm.reset();
            checkLogin();
        } else {
            showToast("Wrong username or password!");
        }
    });
}

// CHECK LOGIN STATUS
function checkLogin() {
    const currentUser = localStorage.getItem('currentUser');
    const nameDisplay = document.getElementById('usernameDisplay');
    const userStatus = document.getElementById('userStatus');
    const loginNavItem = document.getElementById('loginNavItem');
    
    if(currentUser) {
        if(loginNavItem) loginNavItem.style.display = 'none';
        if(userStatus) {
            userStatus.style.display = 'flex';
            if(nameDisplay) nameDisplay.innerText = currentUser;
        }
    } else {
        if(loginNavItem) loginNavItem.style.display = 'block';
        if(userStatus) userStatus.style.display = 'none';
    }
}

// LOGOUT
const logoutBtn = document.getElementById('logoutBtn');
if(logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        cart = []; // Opsional: Kosongkan keranjang saat logout
        saveCart();
        updateCartCount();
        showToast("Logged out.");
        checkLogin();
    });
}

// TOAST
function showToast(msg) {
    const container = document.getElementById('notification-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Expose functions
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;