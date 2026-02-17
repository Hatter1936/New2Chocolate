// Функции для работы с модальным окном
const Modal = {
    open: function(title = 'Добавить фигурку') {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        document.getElementById('productModal').classList.add('active');
    },
    
    close: function() {
        document.getElementById('productModal').classList.remove('active');
        document.getElementById('productForm').reset();
    },
    
    fillForEdit: function(product) {
        document.getElementById('modalTitle').textContent = 'Редактировать фигурку';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productModal').classList.add('active');
    }
};

// Закрытие модального окна при клике вне его
window.addEventListener('click', function(event) {
    const modal = document.getElementById('productModal');
    if (event.target === modal) {
        Modal.close();
    }
});