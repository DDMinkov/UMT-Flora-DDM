const express = require('express');
const router = express.Router();

router.post('/', async (req, res, next) => {
    try {
        const { customerName, customerPhone, deliveryAddress, notes } = req.body;
        
        console.log('Order Payload received on Backend:', {
            customerName,
            customerPhone,
            deliveryAddress,
            notes
        });

        if (!customerName || !customerPhone) {
            return res.status(400).json({ message: 'Name and Phone number are required fields.' });
        }

        return res.status(201).json({ 
            success: true, 
            message: 'Order created successfully!' 
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;