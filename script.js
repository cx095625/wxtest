// 购物车数据
let cart = [];
let menuData = [];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadMenu();
});

// 加载菜单数据
async function loadMenu() {
    try {
        const response = await fetch('menu.txt');
        const data = await response.json();
        menuData = data.dishes;
        renderMenu();
    } catch (error) {
        console.error('Error loading menu:', error);
        alert('加载菜单失败，请刷新页面重试');
    }
}

// 渲染菜单
function renderMenu() {
    const menuContainer = document.getElementById('menu-container');
    menuContainer.innerHTML = menuData.map((item, index) => `
        <div class="menu-item">
            <div class="menu-item-img-container">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23999999'%3E%3Cpath d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-4-5h-6v2h6v-2z'/%3E%3C/svg%3E"
                     data-src="pic/${item.image}"
                     alt="${item.name}"
                     class="menu-item-img"
                     onload="this.classList.add('loaded')"
                     onerror="handleImageError(this)">
            </div>
            <div class="menu-item-info">
                <div class="menu-item-name">${item.name}</div>
                <div class="menu-item-price">¥${item.price}</div>
                <div class="menu-item-description">${item.description}</div>
                <button class="add-to-cart-btn" onclick="handleAddToCart(event, ${index})">
                    加入购物车
                </button>
            </div>
        </div>
    `).join('');

    // 延迟加载图片
    loadImages();
}

// 处理图片加载失败
function handleImageError(img) {
    if (!img.classList.contains('error')) {
        img.classList.add('error');
        img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23999999'%3E%3Cpath d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-4-5h-6v2h6v-2z'/%3E%3C/svg%3E";
    }
}

// 延迟加载图片
function loadImages() {
    const images = document.querySelectorAll('.menu-item-img');
    images.forEach(img => {
        if (img.dataset.src) {
            const tempImage = new Image();
            tempImage.onload = () => {
                img.src = img.dataset.src;
                img.classList.add('loaded');
            };
            tempImage.onerror = () => {
                handleImageError(img);
            };
            tempImage.src = img.dataset.src;
        }
    });
}

// 处理添加到购物车的点击事件
function handleAddToCart(event, index) {
    event.preventDefault();
    event.stopPropagation();
    addToCart(index);
}

// 添加到购物车
function addToCart(index) {
    const item = menuData[index];
    const existingItem = cart.find(cartItem => cartItem.name === item.name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }
    
    updateCartUI();
}

// 处理从购物车移除的点击事件
function handleRemoveFromCart(event, index) {
    event.preventDefault();
    event.stopPropagation();
    removeFromCart(index);
}

// 从购物车移除
function removeFromCart(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
    } else {
        cart.splice(index, 1);
    }
    updateCartUI();
}

// 更新购物车UI
function updateCartUI() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const totalPrice = document.getElementById('total-price');
    
    // 更新购物车图标数量
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalQuantity;
    
    // 更新购物车列表
    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div>${item.name}</div>
                <div>¥${item.price} × ${item.quantity}</div>
            </div>
            <div class="cart-item-controls">
                <button onclick="handleRemoveFromCart(event, ${index})">-</button>
                <span>${item.quantity}</span>
                <button onclick="handleAddToCart(event, ${menuData.findIndex(menuItem => menuItem.name === item.name)})">+</button>
            </div>
        </div>
    `).join('');
    
    // 更新总价
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalPrice.textContent = total;
}

// 切换购物车面板
function toggleCart(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const cartPanel = document.getElementById('cart-panel');
    if (cartPanel.classList.contains('hidden')) {
        cartPanel.classList.remove('hidden');
        setTimeout(() => cartPanel.classList.add('visible'), 10);
    } else {
        cartPanel.classList.remove('visible');
        setTimeout(() => cartPanel.classList.add('hidden'), 300);
    }
}

// 结算
function checkout(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    if (cart.length === 0) {
        alert('购物车是空的！');
        return;
    }
    
    const modal = document.getElementById('checkout-modal');
    const orderSummary = document.getElementById('order-summary');
    
    // 生成订单摘要
    const summary = cart.map(item => 
        `${item.name} × ${item.quantity} = ¥${item.price * item.quantity}`
    ).join('\n');
    
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    orderSummary.innerHTML = `
        <pre>${summary}\n\n总计: ¥${total}</pre>
    `;
    
    modal.classList.remove('hidden');
    
    // 隐藏购物车面板
    const cartPanel = document.getElementById('cart-panel');
    cartPanel.classList.remove('visible');
    setTimeout(() => cartPanel.classList.add('hidden'), 300);
}

// 复制订单到剪贴板
function copyOrder(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const summary = cart.map(item => 
        `${item.name} × ${item.quantity} = ¥${item.price * item.quantity}`
    ).join('\n');
    
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderText = `${summary}\n\n总计: ¥${total}`;
    
    navigator.clipboard.writeText(orderText).then(() => {
        alert('订单已复制到剪贴板！');
    }).catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
    });
}

// 关闭结算模态框
function closeModal(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const modal = document.getElementById('checkout-modal');
    modal.classList.add('hidden');
} 
