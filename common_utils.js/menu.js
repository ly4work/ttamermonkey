
function createFloatingMenu() {
    const menuStyle = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: rgba(0, 123, 255, 0.7);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        z-index: 9999;
        transition: all 0.3s ease;
    `;

    const menuItemStyle = `
        background-color: rgba(0, 123, 255, 0.9);
        color: white;
        padding: 10px;
        margin-bottom: 5px;
        border-radius: 5px;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
    `;

    const menu = document.createElement('div');
    menu.id = 'floating-menu';
    menu.style.cssText = menuStyle;
    menu.textContent = 'Menu';

    const menuItems = document.createElement('div');
    menuItems.id = 'menu-items';
    menuItems.style.cssText = `
        position: absolute;
        bottom: 100%;
        right: 0;
        margin-bottom: 10px;
        display: none;
    `;

    const item1 = document.createElement('div');
    item1.textContent = '✅今日已签到';
    item1.style.cssText = menuItemStyle;

    const item2 = document.createElement('div');
    item2.textContent = '✅已登录';
    item2.style.cssText = menuItemStyle;

    menuItems.appendChild(item1);
    menuItems.appendChild(item2);
    menu.appendChild(menuItems);

    menu.addEventListener('mouseenter', () => {
        menuItems.style.display = 'block';
        setTimeout(() => {
            item1.style.opacity = '1';
            item1.style.transform = 'translateY(0)';
            item2.style.opacity = '1';
            item2.style.transform = 'translateY(0)';
        }, 50);
    });

    menu.addEventListener('mouseleave', () => {
        item1.style.opacity = '0';
        item1.style.transform = 'translateY(20px)';
        item2.style.opacity = '0';
        item2.style.transform = 'translateY(20px)';
        setTimeout(() => {
            menuItems.style.display = 'none';
        }, 300);
    });

    document.body.appendChild(menu);
}


// ... 现有代码 ...

// 添加全局Toast组件
const Toast = {
    create: function(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 10000;
            transition: opacity 0.3s ease-in-out;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, duration);
    },
    
    success: function(message, duration) {
        this.create('✅ ' + message, duration);
    },
    
    error: function(message, duration) {
        this.create('❌ ' + message, duration);
    },
    
    info: function(message, duration) {
        this.create('ℹ️ ' + message, duration);
    }
};