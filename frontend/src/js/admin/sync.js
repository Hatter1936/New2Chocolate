// Синхронизация между админкой и каталогом
const CatalogSync = {
    // Очистить кеш каталога
    clearCatalogCache: function() {
        localStorage.removeItem('catalog_products');
        localStorage.removeItem('catalog_timestamp');
        cachedProducts = null;
        console.log('Кеш каталога очищен');
    },
    
    // Обновить каталог
    refreshCatalog: function() {
        this.clearCatalogCache();
        window.dispatchEvent(new CustomEvent('catalog-update'));
        
        // Если открыта вкладка с каталогом, обновить её
        if (window.opener && !window.opener.closed) {
            try {
                if (window.opener.location.pathname.includes('catalog.html')) {
                    window.opener.location.reload();
                }
            } catch(e) {
                console.log('Не удалось обновить родительское окно');
            }
        }
    }
};

// Делаем глобальным
window.CatalogSync = CatalogSync;