'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const bcrypt = require('bcrypt');

module.exports = createCoreController('api::login.login', ({ strapi }) => ({
    async create(ctx) {
        const { email, password } = ctx.request.body; // Extract email and password
    
        // Log incoming request body
        console.log('Request body:', ctx.request.body); 
    
        // Input validation
        if (!email || !password) {
            return ctx.badRequest('Email and password are required');
        }
    
        try {
            // Fetch the customer by email using findMany
            const customers = await strapi.entityService.findMany('api::customer.customer', {
                filters: { email: { $eq: email } }, // Use the $eq operator for equality
            });
    
            console.log('Searching for email:', email); // Log the searched email
            console.log('Found customers:', customers); // Log the customers found
    
            if (customers.length === 0) {
                return ctx.badRequest('User not found');
            }
    
            const customer = customers[0]; // Get the first customer since email should be unique
    
            // Compare the provided password with the hashed password
            const passwordMatch = await bcrypt.compare(password, customer.password);
            if (!passwordMatch) {
                return ctx.badRequest('Invalid password');
            }
    
            // Return the user data without the password
            const { password: _, ...userWithoutPassword } = customer; // Remove password from the response
            return ctx.send({ user: userWithoutPassword });
        } catch (error) {
            strapi.log.error('Login Error: ', error);
            return ctx.internalServerError('An unexpected error occurred');
        }
    },
    
    
}));
