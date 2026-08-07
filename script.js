// --- Mock Product Database ---
const products = [
    {
        id: 1,
        name: "iPhone 15 Pro Max",
        category: "Phones",
        price: 48500,
        rating: 4.9,
        reviewsCount: 24,
        color: "Natural Titanium",
        phoneType: "iOS",
        image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80",
        description: "Apple A17 Pro chip, Titanium design, Action button, 48MP main camera with 5x Telephoto."
    },
    {
        id: 2,
        name: "Samsung Galaxy S24 Ultra",
        category: "Phones",
        price: 46000,
        rating: 4.8,
        reviewsCount: 19,
        color: "Titanium Gray",
        phoneType: "Android",
        image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80",
        description: "Galaxy AI integrated, 200MP camera system, built-in S Pen, Snapdragon 8 Gen 3."
    },
    {
        id: 3,
        name: "AirPods Pro 2 (USB-C)",
        category: "Accessories",
        price: 9800,
        rating: 4.7,
        reviewsCount: 31,
        color: "White",
        phoneType: "Universal",
        image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80",
        description: "Up to 2x more Active Noise Cancellation, Transparency mode, Personalized Spatial Audio."
    },
    {
        id: 4,
        name: "MagSafe Leather Wallet",
        category: "Accessories",
        price: 1800,
        rating: 4.4,
        reviewsCount: 12,
        color: "Saddle Brown",
        phoneType: "iOS",
        image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
        description: "Crafted from specially tanned French leather, features strong built-in magnets for easy attachment."
    }
];

// --- Application State ---
let cart = JSON.parse(localStorage.getItem('ks_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('ks_wishlist')) || [];
let selectedCategory = 'All';
let selectedSort = 'default';
let selectedStarRating = 0;
let deliveryMap = null;
let mapMarker = null;

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    populateFilterOptions();
    renderProducts(products);
    updateCartCount();
    updateWishlistCount();
});

// --- Theme Management ---
function initTheme() {
    const savedTheme = localStorage.getItem('ks_theme') || 'light';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

window.toggleDarkMode = function () {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('ks_theme', newTheme);
    updateThemeIcon(newTheme);
};

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.className = theme === 'dark' ? 'bi bi-sun-fill fs-6 text-warning' : 'bi bi-moon-fill fs-6';
    }
}

// --- Dynamic Filter Options ---
function populateFilterOptions() {
    const categories = ['All', ...new Set(products.map(p => p.category))];
    const colors = ['All', ...new Set(products.map(p => p.color))];
    const phoneTypes = ['All', ...new Set(products.map(p => p.phoneType))];

    const catContainer = document.getElementById('modal-category-filters');
    if (catContainer) {
        catContainer.innerHTML = categories.map(cat => `
            <button class="btn btn-outline-dark rounded-pill px-3 btn-sm ${cat === 'All' ? 'active' : ''}" 
                onclick="selectCategory('${cat}', this)">${cat}</button>
        `).join('');
    }

    const colorSelect = document.getElementById('colorFilter');
    if (colorSelect) {
        colorSelect.innerHTML = colors.map(c => `<option value="${c}">${c === 'All' ? 'All Colors' : c}</option>`).join('');
    }

    const typeSelect = document.getElementById('phoneTypeFilter');
    if (typeSelect) {
        typeSelect.innerHTML = phoneTypes.map(t => `<option value="${t}">${t === 'All' ? 'All Models / Types' : t}</option>`).join('');
    }
}

// --- Product Rendering ---
function renderProducts(items) {
    const grid = document.getElementById('product-list');
    if (!grid) return;

    if (items.length === 0) {
        grid.innerHTML = `<div class="col-12 text-center py-5"><p class="text-muted fs-5">No products found matching criteria.</p></div>`;
        return;
    }

    grid.innerHTML = items.map(product => {
        const isFavorited = wishlist.includes(product.id);
        return `
            <div class="col-6 col-md-3">
                <div class="card product-card h-100 border-0 shadow-sm p-2 rounded-4 position-relative">
                    <button class="btn btn-light rounded-circle p-2 position-absolute top-0 end-0 m-3 shadow-sm border-0 d-flex align-items-center justify-content-center" 
                        style="z-index: 2;" onclick="toggleWishlist(${product.id})">
                        <i class="bi ${isFavorited ? 'bi-heart-fill text-danger' : 'bi-heart'}"></i>
                    </button>
                    
                    <img src="${product.image}" class="card-img-top rounded-4 cursor-pointer" alt="${product.name}" 
                        style="height: 180px; object-fit: cover;" onclick="openProductModal(${product.id})">
                    
                    <div class="card-body d-flex flex-column justify-content-between p-2">
                        <div>
                            <span class="badge bg-secondary mb-1" style="font-size:0.65rem;">${product.category}</span>
                            <h6 class="card-title fw-bold text-truncate mb-1" title="${product.name}">${product.name}</h6>
                            <p class="card-text fw-bold mb-2">${product.price.toLocaleString()} EGP</p>
                        </div>
                        <button class="btn btn-dark w-100 rounded-pill fw-bold" onclick="addToCart(${product.id})">
                            <i class="bi bi-bag-plus me-1"></i> Add
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// --- Filtering & Sorting Core ---
window.selectCategory = function (cat, btn) {
    selectedCategory = cat;
    document.querySelectorAll('#modal-category-filters button').forEach(b => b.classList.remove('active', 'btn-dark'));
    btn.classList.add('active', 'btn-dark');
    filterAndSortProducts();
};

window.selectSortOption = function (opt, label, btn) {
    selectedSort = opt;
    document.querySelectorAll('.btn-sort-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const badge = document.getElementById('sort-badge');
    if (badge) badge.style.display = opt === 'default' ? 'none' : 'inline-block';

    filterAndSortProducts();
};

window.updatePriceSliderDisplay = function () {
    const slider = document.getElementById('maxPriceSlider');
    const display = document.getElementById('priceRangeDisplay');
    if (slider && display) {
        display.innerText = `0 - ${parseInt(slider.value).toLocaleString()} EGP`;
    }
};

window.filterAndSortProducts = function () {
    const searchVal = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const maxPrice = parseInt(document.getElementById('maxPriceSlider')?.value || 50000);
    const colorVal = document.getElementById('colorFilter')?.value || 'All';
    const typeVal = document.getElementById('phoneTypeFilter')?.value || 'All';

    let filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchVal) || p.description.toLowerCase().includes(searchVal);
        const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesPrice = p.price <= maxPrice;
        const matchesColor = colorVal === 'All' || p.color === colorVal;
        const matchesType = typeVal === 'All' || p.phoneType === typeVal;
        return matchesSearch && matchesCat && matchesPrice && matchesColor && matchesType;
    });

    // Sort Handler
    switch (selectedSort) {
        case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
        case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
        case 'rating-desc': filtered.sort((a, b) => b.rating - a.rating); break;
        case 'rating-asc': filtered.sort((a, b) => a.rating - b.rating); break;
        case 'name-asc': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
        case 'name-desc': filtered.sort((a, b) => b.name.localeCompare(a.name)); break;
    }

    renderProducts(filtered);
};

window.resetFilters = function () {
    selectedCategory = 'All';
    selectedSort = 'default';
    if (document.getElementById('searchInput')) document.getElementById('searchInput').value = '';
    if (document.getElementById('maxPriceSlider')) document.getElementById('maxPriceSlider').value = 50000;
    if (document.getElementById('colorFilter')) document.getElementById('colorFilter').value = 'All';
    if (document.getElementById('phoneTypeFilter')) document.getElementById('phoneTypeFilter').value = 'All';

    updatePriceSliderDisplay();
    filterAndSortProducts();
};

// --- Wishlist Handler ---
window.toggleWishlist = function (productId) {
    const index = wishlist.indexOf(productId);
    if (index === -1) {
        wishlist.push(productId);
        showToast("Added to favorites");
    } else {
        wishlist.splice(index, 1);
        showToast("Removed from favorites");
    }
    localStorage.setItem('ks_wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    filterAndSortProducts();
};

function updateWishlistCount() {
    const badge = document.getElementById('wishlist-count');
    if (badge) {
        badge.innerText = wishlist.length;
        badge.style.display = wishlist.length > 0 ? 'inline-block' : 'none';
    }
}

window.openWishlistModal = function () {
    const container = document.getElementById('wishlist-items-list');
    if (!container) return;

    const favProducts = products.filter(p => wishlist.includes(p.id));

    if (favProducts.length === 0) {
        container.innerHTML = `<p class="text-center text-muted py-3">Your wishlist is empty.</p>`;
    } else {
        container.innerHTML = favProducts.map(p => `
            <div class="d-flex align-items-center justify-content-between bg-body-tertiary p-2 rounded-3">
                <div class="d-flex align-items-center gap-2">
                    <img src="${p.image}" class="rounded" style="width: 48px; height: 48px; object-fit: cover;">
                    <div>
                        <h6 class="mb-0 fw-bold small">${p.name}</h6>
                        <span class="small text-muted">${p.price.toLocaleString()} EGP</span>
                    </div>
                </div>
                <button class="btn btn-sm btn-dark rounded-pill" onclick="addToCart(${p.id})">Add to Bag</button>
            </div>
        `).join('');
    }

    const modal = new bootstrap.Modal(document.getElementById('wishlistModal'));
    modal.show();
};

// --- Cart System & Checkout ---
window.addToCart = function (productId) {
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: productId, qty: 1 });
    }
    localStorage.setItem('ks_cart', JSON.stringify(cart));
    updateCartCount();
    showToast("Added to bag");
};

function updateCartCount() {
    const badge = document.getElementById('cart-count');
    if (badge) {
        const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
        badge.innerText = totalItems;
    }
}

window.openCheckout = function () {
    renderCartModal();
    const modal = new bootstrap.Modal(document.getElementById('cartModal'));
    modal.show();

    setTimeout(() => initLeafletMap(), 300);
};

function renderCartModal() {
    const list = document.getElementById('cart-items-list');
    const totalPriceEl = document.getElementById('total-price');
    if (!list || !totalPriceEl) return;

    let total = 0;

    if (cart.length === 0) {
        list.innerHTML = `<p class="text-center text-muted py-3">Your cart is empty.</p>`;
        totalPriceEl.innerText = '0';
        return;
    }

    list.innerHTML = cart.map(item => {
        const p = products.find(prod => prod.id === item.id);
        if (!p) return '';
        const itemTotal = p.price * item.qty;
        total += itemTotal;

        return `
            <div class="d-flex align-items-center justify-content-between bg-body-tertiary p-3 rounded-4 mb-2">
                <div class="d-flex align-items-center gap-3">
                    <img src="${p.image}" class="rounded-3" style="width:50px; height:50px; object-fit:cover;">
                    <div>
                        <h6 class="fw-bold mb-0">${p.name}</h6>
                        <small class="text-muted">${p.price.toLocaleString()} EGP</small>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-sm btn-outline-secondary rounded-circle" onclick="updateQty(${p.id}, -1)">-</button>
                    <span class="fw-bold">${item.qty}</span>
                    <button class="btn btn-sm btn-outline-secondary rounded-circle" onclick="updateQty(${p.id}, 1)">+</button>
                </div>
            </div>
        `;
    }).join('');

    totalPriceEl.innerText = total.toLocaleString();
}

window.updateQty = function (productId, delta) {
    const idx = cart.findIndex(item => item.id === productId);
    if (idx !== -1) {
        cart[idx].qty += delta;
        if (cart[idx].qty <= 0) cart.splice(idx, 1);
    }
    localStorage.setItem('ks_cart', JSON.stringify(cart));
    updateCartCount();
    renderCartModal();
};

// --- Leaflet Delivery Map (Alexandria Default) ---
function initLeafletMap() {
    if (deliveryMap) {
        deliveryMap.invalidateSize();
        return;
    }

    const alexandriaCoords = [31.2001, 29.9187];
    deliveryMap = L.map('delivery-map').setView(alexandriaCoords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(deliveryMap);

    mapMarker = L.marker(alexandriaCoords, { draggable: true }).addTo(deliveryMap);

    function updateAddressInput(lat, lng) {
        const input = document.getElementById('selectedAddress');
        if (input) input.value = `Alexandria (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    }

    updateAddressInput(alexandriaCoords[0], alexandriaCoords[1]);

    mapMarker.on('dragend', function (e) {
        const coord = e.target.getLatLng();
        updateAddressInput(coord.lat, coord.lng);
    });

    deliveryMap.on('click', function (e) {
        mapMarker.setLatLng(e.latlng);
        updateAddressInput(e.latlng.lat, e.latlng.lng);
    });
}

// --- Order Confirmations ---
window.confirmOrder = function () {
    const name = document.getElementById('name')?.value;
    const phone = document.getElementById('phone')?.value;

    if (!name || !phone || cart.length === 0) {
        alert("Please complete your name, phone number, and add products to your cart.");
        return;
    }

    cart = [];
    localStorage.removeItem('ks_cart');
    updateCartCount();

    const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
    if (cartModal) cartModal.hide();

    const toast = document.getElementById('successToast');
    if (toast) {
        toast.classList.add('show-success');
        setTimeout(() => toast.classList.remove('show-success'), 4000);
    }
};

window.orderViaWhatsApp = function () {
    const name = document.getElementById('name')?.value || 'Customer';
    const address = document.getElementById('selectedAddress')?.value || 'Alexandria';

    let message = `*New Order - Kareem Store*\nName: ${name}\nDelivery: ${address}\n\n*Items:*\n`;
    let total = 0;

    cart.forEach(item => {
        const p = products.find(prod => prod.id === item.id);
        if (p) {
            message += `- ${p.name} x${item.qty} (${(p.price * item.qty).toLocaleString()} EGP)\n`;
            total += p.price * item.qty;
        }
    });

    message += `\n*Total:* ${total.toLocaleString()} EGP`;
    window.open(`https://wa.me/201000000000?text=${encodeURIComponent(message)}`, '_blank');
};

// --- Automatic Image Downsizing/Compression (< 1MB) ---
export async function compressImage(file, maxSizeMB = 1) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size <= maxSizeBytes) return file;

    const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = URL.createObjectURL(file);
    });

    let width = image.width;
    let height = image.height;
    let quality = 0.85;
    let blob = null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    while (file.size > maxSizeBytes) {
        width = Math.floor(width * 0.88);
        height = Math.floor(height * 0.88);

        canvas.width = width;
        canvas.height = height;

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0, width, height);

        blob = await new Promise((resolve) => {
            canvas.toBlob((b) => resolve(b), 'image/jpeg', quality);
        });

        quality = Math.max(0.4, quality - 0.05);

        if (blob && blob.size <= maxSizeBytes) break;
    }

    URL.revokeObjectURL(image.src);

    return new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
        type: 'image/jpeg',
        lastModified: Date.now()
    });
}

// --- Product Modal & Lightbox ---
window.openProductModal = function (productId) {
    const p = products.find(item => item.id === productId);
    if (!p) return;

    document.getElementById('modal-img').src = p.image;
    document.getElementById('modal-name').innerText = p.name;
    document.getElementById('modal-category').innerText = p.category;
    document.getElementById('modal-price-container').innerHTML = `<span class="fs-4 fw-bold">${p.price.toLocaleString()} EGP</span>`;
    document.getElementById('modal-desc').innerText = p.description;

    const addBtn = document.getElementById('modal-add-btn');
    if (addBtn) addBtn.onclick = () => { addToCart(p.id); };

    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
};

window.openLightbox = function (src) {
    document.getElementById('lightbox-img').src = src;
    const modal = new bootstrap.Modal(document.getElementById('lightboxModal'));
    modal.show();
};

// --- Toast Utilities ---
function showToast(msg) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.innerText = msg;
        toast.classList.add('show-toast');
        setTimeout(() => toast.classList.remove('show-toast'), 2500);
    }
}
