document.addEventListener('DOMContentLoaded', function () {
    const bannerContainer = document.querySelector('.banner'); 
    const selectorNav = bannerContainer.querySelector('.selector'); 
    const baseImageUrl = 'http://localhost:3000/api/imagen/'; 
    const defaultImage = './img/banner1.png';

    
    const bannerImg = bannerContainer.querySelector('.banner__img');


    bannerImg.src = defaultImage;
    bannerImg.alt = 'Imagen por defecto';

 
    const fetchBanners = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/baner');
            const banners = await response.json();

            //console.log('Banners:', banners);
           
            if (!banners || banners.length === 0) {
                console.log('No hay banners disponibles. Manteniendo la imagen por defecto.');
                return;
            }

            let currentBannerIndex = 0;

            const updateBanner = () => {
                const banner = banners[currentBannerIndex];
                
                bannerImg.src = `${baseImageUrl}${banner.imagenid}`;
               bannerImg.alt = banner.titulo || 'Banner';
            };


            updateBanner();


            const prevButton = selectorNav.querySelector('#primero');
            const nextButton = selectorNav.querySelector('.link:not(#primero)');

            prevButton.addEventListener('click', (e) => {
                e.preventDefault();
                currentBannerIndex = (currentBannerIndex - 1 + banners.length) % banners.length;
                updateBanner();
            });

            nextButton.addEventListener('click', (e) => {
                e.preventDefault();
                currentBannerIndex = (currentBannerIndex + 1) % banners.length;
                updateBanner();
            });
        } catch (error) {
            console.error('Error al cargar los banners:', error);
            console.log('Manteniendo la imagen por defecto.');
        }
    };

    fetchBanners();
});
