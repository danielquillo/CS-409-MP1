/* Your JS here. */ 
document.getElementById('year').textContent = new Date().getFullYear();

document.querySelectorAll('a[data-nav]').forEach(a => {
    a.addEventListener('click', e=> {
        e.preventDefault();
        const id = a.getAttribute('href');
        document.querySelector(id)?.scrollIntoView({behavior: 'smooth', block: 'start'});
    });
});

// navbar resize on scroll
const siteNav = document.querySelector('.site-nav');
const SHRINK_AT = 10;   //px scrolled

let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            if (window.scrollY > SHRINK_AT) {
                siteNav.classList.add('nav-shrink');
            } else {
                siteNav.classList.remove('nav-shrink');
            }
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true});
