document.addEventListener('DOMContentLoaded', () => {
    const addProductNameInput = document.getElementById('add-product-name');
    const addProductPriceInput = document.getElementById('add-product-price');
    const addProductQuantityInput = document.getElementById('add-product-quantity');
    const addItemBtn = document.getElementById('add-item-btn');
    const inventoryList = document.getElementById('inventory-list');
    const saleProductSelect = document.getElementById('sale-product-select');
    const saleQuantityInput = document.getElementById('sale-quantity');
    const addToSaleBtn = document.getElementById('add-to-sale-btn');
    const saleItemsList = document.getElementById('sale-items-list');
    const saleTotalSpan = document.getElementById('sale-total');
    const completeSaleBtn = document.getElementById('complete-sale-btn');
    const salesHistoryList = document.getElementById('sales-history-list');

    let inventory = loadInventory();
    let currentSaleItems = [];
    let salesHistory = loadSalesHistory();
    let saleIdCounter = loadSaleIdCounter();

    renderInventory();
    renderSaleProducts();
    renderSalesHistory();
    updateSaleTotal();

    function loadInventory() {
        const storedInventory = localStorage.getItem('inventory');
        return storedInventory ? JSON.parse(storedInventory) : [];
    }

    function saveInventory() {
        localStorage.setItem('inventory', JSON.stringify(inventory));
        renderSaleProducts();
    }

    function loadSalesHistory() {
        const storedHistory = localStorage.getItem('salesHistory');
        return storedHistory ? JSON.parse(storedHistory) : [];
    }

    function saveSalesHistory() {
        localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
        renderSalesHistory();
    }

    function loadSaleIdCounter() {
        const storedCounter = localStorage.getItem('saleIdCounter');
        return storedCounter ? parseInt(storedCounter) : 1;
    }

    function saveSaleIdCounter() {
        localStorage.setItem('saleIdCounter', saleIdCounter);
    }

    function renderInventory() {
        inventoryList.innerHTML = '';
        inventory.forEach((item, index) => {
            const row = inventoryList.insertRow();
            const nameCell = row.insertCell();
            const priceCell = row.insertCell();
            const quantityCell = row.insertCell();
            const actionsCell = row.insertCell();

            nameCell.textContent = item.name;
            priceCell.textContent = item.price.toFixed(2);
            quantityCell.textContent = item.quantity;

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.classList.add('inventory-actions');
            editButton.addEventListener('click', () => editInventoryItem(index));

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('inventory-actions');
            deleteButton.addEventListener('click', () => deleteInventoryItem(index));

            actionsCell.appendChild(editButton);
            actionsCell.appendChild(deleteButton);
        });
    }

    function editInventoryItem(index) {
        const item = inventory[index];
        const newName = prompt('Enter new product name:', item.name);
        const newPrice = parseFloat(prompt('Enter new price:', item.price));
        const newQuantity = parseInt(prompt('Enter new quantity:', item.quantity));

        if (newName !== null && !isNaN(newPrice) && !isNaN(newQuantity)) {
            inventory[index] = { name: newName, price: newPrice, quantity: newQuantity };
            saveInventory();
            renderInventory();
        }
    }

    function deleteInventoryItem(index) {
        if (confirm('Are you sure you want to delete this item?')) {
            inventory.splice(index, 1);
            saveInventory();
            renderInventory();
        }
    }

    function renderSaleProducts() {
        saleProductSelect.innerHTML = '<option value="">Select Product</option>';
        inventory.forEach((item, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${item.name} ($${item.price.toFixed(2)}) - ${item.quantity} in stock`;
            saleProductSelect.appendChild(option);
        });
    }

    function addToSale() {
        const selectedIndex = saleProductSelect.value;
        const quantityToSell = parseInt(saleQuantityInput.value);

        if (selectedIndex === "" || isNaN(quantityToSell) || quantityToSell <= 0) {
            alert('Please select a product and enter a valid quantity.');
            return;
        }

        const selectedProduct = inventory[selectedIndex];

        if (quantityToSell > selectedProduct.quantity) {
            alert(`Not enough stock for ${selectedProduct.name}. Only ${selectedProduct.quantity} available.`);
            return;
        }

        const existingSaleItemIndex = currentSaleItems.findIndex(item => item.index === selectedIndex);

        if (existingSaleItemIndex !== -1) {
            currentSaleItems[existingSaleItemIndex].quantity += quantityToSell;
        } else {
            currentSaleItems.push({
                index: selectedIndex,
                name: selectedProduct.name,
                price: selectedProduct.price,
                quantity: quantityToSell
            });
        }

        renderSaleItems();
        updateSaleTotal();
        saleQuantityInput.value = '';
    }

    function renderSaleItems() {
        saleItemsList.innerHTML = '';
        currentSaleItems.forEach((saleItem, index) => {
            const row = saleItemsList.insertRow();
            const nameCell = row.insertCell();
            const quantityCell = row.insertCell();
            const priceCell = row.insertCell();
            const totalCell = row.insertCell();
            const actionsCell = row.insertCell();

            nameCell.textContent = saleItem.name;
            quantityCell.textContent = saleItem.quantity;
            priceCell.textContent = saleItem.price.toFixed(2);
            totalCell.textContent = (saleItem.price * saleItem.quantity).toFixed(2);

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.classList.add('sale-item-actions');
            removeButton.addEventListener('click', () => removeSaleItem(index));

            actionsCell.appendChild(removeButton);
        });
    }

    function removeSaleItem(index) {
        currentSaleItems.splice(index, 1);
        renderSaleItems();
        updateSaleTotal();
    }

    function updateSaleTotal() {
        const total = currentSaleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        saleTotalSpan.textContent = total.toFixed(2);
    }

    function completeSale() {
        if (currentSaleItems.length === 0) {
            alert('Please add items to the sale.');
            return;
        }

        const saleTotal = parseFloat(saleTotalSpan.textContent);
        const saleDetails = currentSaleItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        }));

        salesHistory.push({
            id: saleIdCounter++,
            items: saleDetails,
            total: saleTotal,
            date: new Date().toLocaleString()
        });
        saveSalesHistory();
        saveSaleIdCounter();

        currentSaleItems.forEach(item => {
            inventory[item.index].quantity -= item.quantity;
        });
        saveInventory();
        renderInventory();

        currentSaleItems = [];
        renderSaleItems();
        updateSaleTotal();
        renderSalesHistory();

        alert(`Sale completed with ID: ${salesHistory[salesHistory.length - 1].id}, Total: $${saleTotal.toFixed(2)}`);
    }

    function renderSalesHistory() {
        salesHistoryList.innerHTML = '';
        salesHistory.forEach(sale => {
            const row = salesHistoryList.insertRow();
            const idCell = row.insertCell();
            const itemsCell = row.insertCell();
            const totalCell = row.insertCell();
            const dateCell = row.insertCell();

            idCell.textContent = sale.id;
            itemsCell.textContent = sale.items.map(item => `${item.name} (${item.quantity} x $${item.price.toFixed(2)})`).join(', ');
            totalCell.textContent = sale.total.toFixed(2);
            dateCell.textContent = sale.date;
        });
    }

    addItemBtn.addEventListener('click', () => {
        const name = addProductNameInput.value.trim();
        const price = parseFloat(addProductPriceInput.value);
        const quantity = parseInt(addProductQuantityInput.value);

        if (name && !isNaN(price) && !isNaN(quantity)) {
            inventory.push({ name, price, quantity });
            saveInventory();
            renderInventory();
            addProductNameInput.value = '';
            addProductPriceInput.value = '';
            addProductQuantityInput.value = '';
        } else {
            alert('Please enter valid product details.');
        }
    });

    addToSaleBtn.addEventListener('click', addToSale);
    completeSaleBtn.addEventListener('click', completeSale);
});