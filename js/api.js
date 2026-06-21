document.addEventListener('DOMContentLoaded', () => {
    const RENDER_BACKEND_URL = 'https://umt-flora-ddm.onrender.com';
    const BASE_URL = `${RENDER_BACKEND_URL}/api/bouquets`;
    
    const bestsellersContainer = document.getElementById('bestsellers-container');
    const allBouquetsContainer = document.getElementById('all-bouquets-container');
    const feedbackContainer = document.getElementById('feedback-container');
    const loadMoreBtn = document.querySelector('.bouquets-action .btn-primary');
    const orderForm = document.getElementById('order-form');
    const orderModal = document.getElementById('order-modal');

    const state = {
        currentPage: 1,
        limitPerPage: 4,
        totalLoaded: 0
    };

    // Safe abstraction layer for network requests
    const localAxios = {
        get: async (url) => {
            try {
                // Route to reviews endpoint if specified
                if (url.includes('type=reviews') || url.includes('/reviews')) {
                    const res = await fetch(`${RENDER_BACKEND_URL}/api/reviews`);
                    if (!res.ok) throw new Error('Failed to fetch reviews');
                    const reviewsData = await res.json();
                    return { data: Array.isArray(reviewsData) ? reviewsData : (reviewsData.data || []) };
                }

                const urlObj = new URL(url, window.location.origin);
                const category = urlObj.searchParams.get('category');
                const page = urlObj.searchParams.get('_page') || 1;
                const perPage = urlObj.searchParams.get('_per_page') || state.limitPerPage;

                let targetUrl = `${BASE_URL}?page=${page}&limit=${perPage}`;
                if (category) {
                    targetUrl += `&category=${category}`;
                }

                const res = await fetch(targetUrl);
                if (!res.ok) throw new Error('Failed to load bouquets from server');
                const responseData = await res.json();
                
                let items = Array.isArray(responseData) ? responseData : (responseData.data || responseData.bouquets || []);
                
                // Normalize photo urls safely
                items = items.map(item => ({
                    ...item,
                    image: item.image || (item.photoURL ? item.photoURL.replace('images/', '').replace('.jpg', '') : 'flowa1')
                }));

                const totalCount = responseData.total || Number(res.headers.get('x-total-count')) || 12;

                return {
                    data: items,
                    totalCount: totalCount
                };
            } catch (err) {
                console.error("Fetch implementation wrapper error:", err);
                throw err;
            }
        }
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
                            srcset="images/${item.image}.jpg 1x, images/${item.image}.jpg 2x" 
                            alt="${item.title}" 
                            loading="lazy">
                    </div>
                    <div class="${infoClass}">
                        <h3>${item.title}</h3>
                        <p>${item.description || ''}</p>
                        <span class="price">$${item.price}</span>
                    </div>
                </a>
            </div>
        `;

        return isBestseller ? `<div class="swiper-slide">${inner}</div>` : inner;
    }

    function createReviewTemplate(review) {
        return `
            <div class="swiper-slide">
                <div class="review-card">
                    <p class="review-text">${review.text || ''}</p>
                    <span class="review-author">${review.author || 'Anonymous'}</span>
                </div>
            </div>
        `;
    }

    async function fetchBestsellers() {
        bestsellersContainer.innerHTML = '<div class="loader"></div>';
        try {
            const response = await localAxios.get(`${BASE_URL}?category=bestseller`);
            const data = response.data;
            
            if (!data || data.length === 0) {
                bestsellersContainer.innerHTML = '<p class="empty-message">No bestsellers available.</p>';
                return;
            }

            const markup = data.map(item => createCardTemplate(item, true)).join('');
            bestsellersContainer.innerHTML = markup;

            new Swiper('.bestsellers-swiper', {
                slidesPerView: 3,
                spaceBetween: 30,
                observer: true, 
                observeParents: true,
                loop: false,
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
            bestsellersContainer.innerHTML = '<p class="error-message">Failed to load bestsellers.</p>';
        }
    }

    async function fetchAllBouquets(page) {
        let inlineLoader = document.createElement('div');
        inlineLoader.className = 'loader';
        allBouquetsContainer.after(inlineLoader);

        try {
            const response = await localAxios.get(`${BASE_URL}?category=regular&_page=${page}&_per_page=${state.limitPerPage}`);
            inlineLoader.remove();

            const data = response.data;
            const totalCount = response.totalCount; 

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
            inlineLoader.remove();
            console.error('Error fetching bouquets:', error);
            allBouquetsContainer.innerHTML = '<p class="error-message">Could not load products.</p>';
            loadMoreBtn.style.display = 'none';
        }
    }

    async function fetchAndInitFeedback() {
        feedbackContainer.innerHTML = '<div class="loader"></div>';
        try {
            const response = await localAxios.get(`${BASE_URL}?type=reviews`);
            const reviews = response.data;

            if (!reviews || reviews.length === 0) {
                feedbackContainer.innerHTML = '<p class="empty-message">No feedback yet.</p>';
                return;
            }

            const markup = reviews.map(review => createReviewTemplate(review)).join('');
            feedbackContainer.innerHTML = markup;

            new Swiper('.feedback-swiper', {
                slidesPerView: 1,
                spaceBetween: 20,
                observer: true, 
                observeParents: true,
                loop: false,
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
        } catch (error) {
            console.error('Error fetching reviews:', error);
            feedbackContainer.innerHTML = '<p class="error-message">Could not load client feedback.</p>';
        }
    }

    // --- ORDER CREATION FORM POST HANDLING ---
    if (orderForm) {
        orderForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const submitBtn = document.getElementById('order-submit-btn');
            const originalBtnText = submitBtn.textContent;
            
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;

            const formData = new FormData(orderForm);
            
            // Matches standard backend expected body structures
            const orderPayload = {
                customerName: formData.get('customer-name'),
                customerPhone: formData.get('customer-phone'),
                deliveryAddress: formData.get('customer-address') || '',
                notes: formData.get('customer-message') || ''
            };

            try {
                // Try targeted route endpoint
                const response = await fetch(`${RENDER_BACKEND_URL}/api/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderPayload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                await response.json();
                alert('Thank you! Your order has been placed successfully.');
                
                orderForm.reset();
                if (orderModal && typeof orderModal.close === 'function') {
                    orderModal.close();
                }

            } catch (error) {
                console.error('Order checkout submission error:', error);
                alert('Connection error or missing backend checkout route. Your order data was logged to console.');
            } finally {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    loadMoreBtn.addEventListener('click', () => {
        state.currentPage += 1;
        fetchAllBouquets(state.currentPage);
    });

    // Fire initialization
    fetchBestsellers();
    fetchAllBouquets(state.currentPage);
    fetchAndInitFeedback();
});