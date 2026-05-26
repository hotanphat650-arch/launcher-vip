let selectedItem = null;
let isEquipSlotSelected = false;

// Hàm nhận data từ Pawn đổ vào UI (Gọi khi gõ /cefinv)
function renderInventory(eventData) {
    const data = JSON.parse(eventData);
    const items = JSON.parse(data[1] || "[]");
    const equips = JSON.parse(data[2] || "[]");

    // 1. Reset panel chi tiết
    document.getElementById('detail-placeholder').classList.remove('hidden');
    document.getElementById('detail-content').classList.add('hidden');
    selectedItem = null;

    // 2. Render 56 ô đồ hành trang
    const grid = document.getElementById('inv-grid');
    grid.innerHTML = "";
    document.getElementById('slot-text').innerText = `${items.length} / 56 SLOT`;

    for (let i = 0; i < 56; i++) {
        const slot = document.createElement("div");
        slot.className = "inv-slot";
        
        if (i < items.length) {
            slot.innerHTML = `
                <div class="item-qty">x${items[i].amount}</div>
                <img src="${items[i].icon}" style="width:75%; margin:12.5%;">
            `;
            // Lắng nghe click vật phẩm trong túi
            slot.onclick = () => showItemDetails(items[i], false);
        }
        grid.appendChild(slot);
    }

    // 3. Render các ô trang bị
    for (let slotId = 0; slotId < 6; slotId++) {
        const eSlot = document.getElementById(`equip-${slotId}`);
        const eqItem = equips.find(e => e.type === slotId);
        
        if (eqItem) {
            eSlot.innerHTML = `<img src="${eqItem.icon}" style="width:80%; margin:10%;">`;
            eSlot.classList.remove('empty');
            eSlot.onclick = () => showItemDetails(eqItem, true);
        } else {
            eSlot.innerHTML = "";
            eSlot.classList.add('empty');
            eSlot.onclick = null;
        }
    }
}

// Hàm hiển thị thông tin chi tiết sang Panel Phải khi click
function showItemDetails(item, isEquipped) {
    selectedItem = item;
    isEquipSlotSelected = isEquipped;

    document.getElementById('detail-placeholder').classList.add('hidden');
    document.getElementById('detail-content').classList.remove('hidden');

    document.getElementById('detail-name').innerText = item.name;
    document.getElementById('detail-icon').src = item.icon;
    document.getElementById('detail-desc').innerText = item.desc || "Không có thông tin mô tả cho vật phẩm này.";
    
    // Cập nhật nhãn độ hiếm (Cần sa thô -> RARE, Bánh mì -> COMMON...)
    const rarityBadge = document.getElementById('detail-rarity');
    rarityBadge.innerText = item.rarity || "COMMON";
    rarityBadge.className = `rarity ${item.rarity?.toLowerCase() || 'common'}`;

    // Đổi tên nút hành động chính nếu đồ đang mặc
    const mainBtn = document.getElementById('btn-action-main');
    if (isEquipped) {
        mainBtn.innerText = "❌ THÁO ĐỒ";
        mainBtn.style.background = "#ff9800";
    } else {
        mainBtn.innerText = "⚡ SỬ DỤNG";
        mainBtn.style.background = "#00e5ff";
    }
}

// Gửi lệnh về Server qua thư viện sampmobilecef
function sendAction(actionType) {
    if (!selectedItem) return;
    
    // Nếu đang chọn đồ trang bị mà nhấn nút chính -> chuyển action thành takeoff (Tháo đồ)
    let finalAction = actionType;
    if (isEquipSlotSelected && actionType === 'use') {
        finalAction = 'takeoff';
    }

    Cef.sendEvent("inventory_action", JSON.stringify([finalAction, selectedItem.id, selectedItem.type || 0]));
}

// Đăng ký nhận event hiển thị từ Server
Cef.registerEventCallback("inventory_show", "renderInventory");
