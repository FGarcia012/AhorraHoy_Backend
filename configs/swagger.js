import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'AhorraHoy API',
            version: '1.0.0',
            description: 'API para un sistema de ahorros personales calculadora de gastos y más.',
            module: {
                name: 'Fredy Alexander Garcia Sicajau',
                email: 'alexander.garcia.sicajau@gmail.com',
            }
        },
        servers: [
            {
                url: 'http://127.0.0.1:3010/AhorraHoy/v1'
            }
        ]
    },
    apis: [
        './src/auth/auth.routes.js',
        './src/user/user.routes.js'
    ]
}

const swaggerDocs = swaggerJSDoc(options);

export { swaggerUi, swaggerDocs };