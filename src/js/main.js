/* Your JS here. */ 
document.getElementById('year').textContent = new Date().getFullYear();

document.querySelectorAll('a[data-nav]').forEach(a => {
    a.addEventListener('click', e=> {
        e.preventDefault();
        const id = a.getAttribute('href');
        document.querySelector(id)?.scrollIntoView({behavior: 'smooth', block: 'start'});
    });
});
