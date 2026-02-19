document.addEventListener('DOMContentLoaded', function() {
    // Плавная прокрутка для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Подсветка активного пункта меню
    const navLinks = document.querySelectorAll('.nav-main a');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage) {
            link.style.color = '#5d4037';
            link.style.fontWeight = 'bold';
        }
    });
});

// Эффект параллакса для герой-секции
(function() {
    const heroSection = document.getElementById('hero-parallax');
    if (!heroSection) return;

    const parallaxBg = heroSection.querySelector('.parallax-bg');
    if (!parallaxBg) return;

    const speed = 0.03;

    heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const moveX = x * 5;
        const moveY = y * 5;

        parallaxBg.style.transform = `translate(${moveX}%, ${moveY}%)`;
    });

    heroSection.addEventListener('mouseleave', () => {
        parallaxBg.style.transform = 'translate(0%, 0%)';
    });
})();