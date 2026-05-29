document.addEventListener('DOMContentLoaded', () => {
    const productModal = document.getElementById('product-modal');
    const closeProductBtn = document.querySelector('#product-modal .modal-close-btn');
    const buyNowBtn = document.getElementById('modal-buy-btn');

    const orderModal = document.getElementById('order-modal');
    const closeOrderBtn = document.getElementById('order-modal-close');
    const orderForm = document.getElementById('order-form');
    const orderPhoneInput = document.getElementById('order-phone');

    const modalImg = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalPrice = document.getElementById('modal-price');
    const modalDescription = document.getElementById('modal-description');
    const quantityInput = document.getElementById('modal-quantity');

    function validateQuantity() {
        const value = quantityInput.value;
        if (value === '' || parseInt(value) < 1 || isNaN(value)) {
            quantityInput.classList.add('invalid-value');
        } else {
            quantityInput.classList.remove('invalid-value');
        }
    }

    quantityInput.addEventListener('input', validateQuantity);
    quantityInput.addEventListener('blur', validateQuantity);

    function openModalWindow(targetModal) {
        targetModal.showModal();
        document.body.style.overflow = 'hidden'; 
        
        requestAnimationFrame(() => {
            targetModal.classList.add('is-open');
        });
    }

    function closeModalWindow(targetModal) {
        targetModal.classList.remove('is-open');
        targetModal.classList.add('is-closing');
        
        setTimeout(() => {
            targetModal.close();
            if (!productModal.open && !orderModal.open) {
                document.body.style.overflow = 'initial';
            }
            targetModal.classList.remove('is-closing'); 
        }, 350);
    }

    document.addEventListener('click', (e) => {
        const card = e.target.closest('.card-link, .item-link');
        if (!card) return;
        
        e.preventDefault();
        
        const imgEl = card.querySelector('img');
        const titleEl = card.querySelector('h3');
        const priceEl = card.querySelector('.price');
        const descEl = card.querySelector('p');

        if (imgEl) modalImg.src = imgEl.src;
        if (titleEl) modalTitle.textContent = titleEl.textContent;
        if (priceEl) modalPrice.textContent = priceEl.textContent;
        if (descEl) modalDescription.textContent = descEl.textContent;
        
        quantityInput.value = 1; 
        quantityInput.classList.remove('invalid-value');

        openModalWindow(productModal);
    });

    buyNowBtn.addEventListener('click', () => {
        productModal.classList.remove('is-open');
        productModal.classList.add('is-closing');
        
        setTimeout(() => {
            productModal.close();
            productModal.classList.remove('is-closing');
            
            orderForm.reset();
            
            openModalWindow(orderModal);
        }, 350);
    });

    closeProductBtn.addEventListener('click', () => closeModalWindow(productModal));
    closeOrderBtn.addEventListener('click', () => closeModalWindow(orderModal));

    productModal.addEventListener('cancel', (e) => { e.preventDefault(); closeModalWindow(productModal); });
    orderModal.addEventListener('cancel', (e) => { e.preventDefault(); closeModalWindow(orderModal); });

    [productModal, orderModal].forEach(target => {
        target.addEventListener('click', (e) => {
            const dimensions = target.getBoundingClientRect();
            if (
                e.clientX < dimensions.left ||
                e.clientX > dimensions.right ||
                e.clientY < dimensions.top ||
                e.clientY > dimensions.bottom
            ) {
                closeModalWindow(target);
            }
        });
    });

    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const dataPayload = new FormData(orderForm);
        console.log('Order System Complete Submission Data Log:', Object.fromEntries(dataPayload.entries()));
        
        closeModalWindow(orderModal);
    });

    orderPhoneInput.addEventListener('input', () => {
        orderPhoneInput.value = orderPhoneInput.value.replace(/[^0-9\s+\-()]/g, '');
    });
});