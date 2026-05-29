document.addEventListener('DOMContentLoaded', () => {
    const BASE_URL = 'http://localhost:3000/bouquets';
    
    const bestsellersContainer = document.getElementById('bestsellers-container');
    const allBouquetsContainer = document.getElementById('all-bouquets-container');
    const loadMoreBtn = document.querySelector('.bouquets-action .btn-primary');

    const state = {
        currentPage: 1,
        limitPerPage: 4,
        totalLoaded: 0
    };

    function createCardTemplate(item, isBestseller) {
        const cardClass = isBestseller ? 'bouquet-card' : 'bouquet-item';
        const imgClass = isBestseller ? 'card-image' : 'item-image';
        const infoClass = isBestseller ? 'card-info' : 'item-info';
        const linkClass = isBestseller ? 'card-link' : 'item-link';

        const inner = `
            <div class="${cardClass}">
                <a href="#" class="${linkClass}" data-id="${item.id}">
                    <div class="${imgClass}">
                        <img src="images/${item.image}.jpg" 
                            srcset="images/${item.image}.jpg 1x, images/${item.image}@2x.jpg 2x" 
                            alt="${item.title}" 
                            loading="lazy">
                    </div>
                    <div class="${infoClass}">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                        <span class="price">$${item.price}</span>
                    </div>
                </a>
            </div>
        `;

        return isBestseller ? `<div class="swiper-slide">${inner}</div>` : inner;
    }

    async function fetchBestsellers() {
        try {
            const response = await axios.get(`${BASE_URL}?category=bestseller`);
            const data = response.data;
            
            if (data.length === 0) {
                bestsellersContainer.innerHTML = '<p class="empty-message">No bestsellers available.</p>';
                return;
            }

            const markup = data.map(item => createCardTemplate(item, true)).join('');
            bestsellersContainer.insertAdjacentHTML('beforeend', markup);

            new Swiper('.bestsellers-swiper', {
                slidesPerView: 3,
                spaceBetween: 30,
                observer: true, 
                observeParents: true,

                pagination: {
                    el: '.bestsellers-pagination',
                    clickable: true,
                },
                navigation: {
                    prevEl: '.bestsellers-prev',
                    nextEl: '.bestsellers-next',
                },
                breakpoints: {
                    0:    { slidesPerView: 1 },
                    851:  { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                }
            });

        } catch (error) {
            console.error('Error fetching bestsellers:', error);
            bestsellersContainer.innerHTML = '<p class="error-message">Failed to load bestsellers. Please try again later.</p>';
        }
    }

    async function fetchAllBouquets(page) {
        try {
            const response = await axios.get(`${BASE_URL}?category=regular&_page=${page}&_per_page=${state.limitPerPage}`);
            
            const data = Array.isArray(response.data) ? response.data : response.data.data;
            
            const totalCount = response.data.items || Number(response.headers['x-total-count']) || 8; 

            if (!data || data.length === 0) {
                if (page === 1) {
                    allBouquetsContainer.innerHTML = '<p class="empty-message">No bouquets found.</p>';
                }
                loadMoreBtn.style.display = 'none';
                return;
            }

            const markup = data.map(item => createCardTemplate(item, false)).join('');
            allBouquetsContainer.insertAdjacentHTML('beforeend', markup);

            state.totalLoaded += data.length;

            if (state.totalLoaded >= totalCount || data.length < state.limitPerPage) {
                loadMoreBtn.style.display = 'none';
                
                if (!document.querySelector('.end-collection-message')) {
                    const endMessage = document.createElement('p');
                    endMessage.className = 'end-collection-message';
                    endMessage.style.textAlign = 'center';
                    endMessage.style.marginTop = '20px';
                    endMessage.style.color = '#666';
                    endMessage.textContent = "That's all our stunning bouquets for today!";
                    allBouquetsContainer.after(endMessage);
                }
            }
        } catch (error) {
            console.error('Error fetching bouquets:', error);
            allBouquetsContainer.innerHTML = '<p class="error-message">Something went wrong. Could not load products.</p>';
            loadMoreBtn.style.display = 'none';
        }
    }

    function initFeedbackSlider() {
        new Swiper('.feedback-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            pagination: {
                el: '.feedback-pagination',
                clickable: true,
            },
            navigation: {
                prevEl: '.feedback-prev',
                nextEl: '.feedback-next',
            },
            breakpoints: {
                0:    { slidesPerView: 1 },
                851:  { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
            }
        });
    }

    loadMoreBtn.addEventListener('click', () => {
        state.currentPage += 1;
        fetchAllBouquets(state.currentPage);
    });

    fetchBestsellers();
    fetchAllBouquets(state.currentPage);
    initFeedbackSlider();
});