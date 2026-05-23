document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.querySelector('.add-item-container input');
    const addButton = document.querySelector('.btn-add');
    const buyList = document.querySelector('.buy-list');
    
    const statsToBuyList = document.getElementById('stats-to-buy');
    const statsBoughtList = document.getElementById('stats-already-bought');

    const STORAGE_KEY = 'buyListState';

    let items = [];

    function loadState() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            items = JSON.parse(savedData);
        } else {
            items = [
                { id: 1, name: 'Помідори', quantity: 2, isBought: false },
                { id: 2, name: 'Печиво', quantity: 1, isBought: false },
                { id: 3, name: 'Сир', quantity: 1, isBought: true }
            ];
        }
        render();
    }

    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        render();
    }
    
    function addItem() {
        const name = inputField.value.trim();
        if (name === '') return;

        items.push({
            id: Date.now(),
            name: name,
            quantity: 1,
            isBought: false
        });

        inputField.value = '';
        inputField.focus();
        saveState();
    }

    function deleteItem(id) {
        items = items.filter(item => item.id !== id);
        saveState();
    }

    function toggleBought(id) {
        const item = items.find(i => i.id === id);
        if (item) {
            item.isBought = !item.isBought;
            saveState();
        }
    }

    function changeQuantity(id, delta) {
        const item = items.find(i => i.id === id);
        if (item && !item.isBought) {
            item.quantity += delta;
            if (item.quantity < 1) item.quantity = 1;
            saveState();
        }
    }

    function editName(id, newName) {
        const item = items.find(i => i.id === id);
        if (item && newName.trim() !== '') {
            item.name = newName.trim();
            saveState();
        } else {
            render();
        }
    }

    function render() {
        buyList.innerHTML = '';
        statsToBuyList.innerHTML = '';
        statsBoughtList.innerHTML = '';

        items.forEach(item => {
            const li = document.createElement('li');
            if (item.isBought) li.classList.add('is-bought');

            let itemHTML = ``;
            
            if (item.isBought) {
                itemHTML = `
                    <span class="item-name" style="text-decoration: line-through; color: #888;">${item.name}</span>
                    <div class="controls">
                        <button class="btn-buy" aria-label="Повернути">В список</button>
                    </div>
                `;
            } else {
                const minusDisabled = item.quantity === 1 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : '';
                
                itemHTML = `
                    <span class="item-name" title="Натисніть, щоб редагувати">${item.name}</span>
                    <div class="controls">
                        <button class="btn-circle btn-minus" ${minusDisabled} aria-label="Зменшити">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="btn-circle btn-plus" aria-label="Збільшити">+</button>
                        <button class="btn-buy" aria-label="Купити">Купити</button>
                        <button class="btn-delete" aria-label="Видалити">✖</button>
                    </div>
                `;
            }

            li.innerHTML = itemHTML;
            buyList.appendChild(li);

            const btnBuy = li.querySelector('.btn-buy');
            btnBuy.addEventListener('click', () => toggleBought(item.id));

            if (!item.isBought) {
                li.querySelector('.btn-delete').addEventListener('click', () => deleteItem(item.id));
                li.querySelector('.btn-plus').addEventListener('click', () => changeQuantity(item.id, 1));
                li.querySelector('.btn-minus').addEventListener('click', () => changeQuantity(item.id, -1));

                const nameSpan = li.querySelector('.item-name');
                nameSpan.style.cursor = 'pointer';
                nameSpan.addEventListener('click', () => {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = item.name;
                    input.classList.add('edit-input');
                    
                    li.replaceChild(input, nameSpan);
                    input.focus();

                    input.addEventListener('blur', () => editName(item.id, input.value));
                    
                    input.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') editName(item.id, input.value);
                    });
                });
            }

            const statLi = document.createElement('li');
            statLi.textContent = `${item.name} - ${item.quantity} шт.`;
            
            if (item.isBought) {
                statLi.style.textDecoration = 'line-through';
                statsBoughtList.appendChild(statLi);
            } else {
                statsToBuyList.appendChild(statLi);
            }
        });
    }

    addButton.addEventListener('click', addItem);
    inputField.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') addItem();
    });

    loadState();
});