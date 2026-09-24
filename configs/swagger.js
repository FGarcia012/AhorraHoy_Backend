import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'AhorraHoy API',
            version: '1.0.0',
            description: 'API para un sistema de ahorros personales calculadora de gastos y más.',
            contact: {
                name: 'Fredy Alexander Garcia Sicajau',
                email: 'alexander.garcia.sicajau@gmail.com',
            }
        },
        servers: [
            {
                url: 'http://127.0.0.1:3010/ahorraHoy/v1'
            }
        ],
        tags: [
            { name: 'Auth', description: 'Registro e inicio de sesion' },
            { name: 'User', description: 'Gestion del usuario autenticado' },
            { name: 'Goal', description: 'Metas de ahorro y movimientos' },
            { name: 'Transaction', description: 'Historial de movimientos' },
            { name: 'Financial', description: 'Configuracion financiera del usuario' },
            { name: 'Income', description: 'Ingresos del usuario' },
            { name: 'Statistics', description: 'Resumenes y proyecciones' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            parameters: {
                UserId: {
                    name: 'uid',
                    in: 'path',
                    required: true,
                    description: 'ID del usuario',
                    schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' },
                    example: '507f1f77bcf86cd799439011'
                },
                GoalId: {
                    name: 'gid',
                    in: 'path',
                    required: true,
                    description: 'ID de la meta',
                    schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' },
                    example: '507f1f77bcf86cd799439011'
                },
                TransactionId: {
                    name: 'tid',
                    in: 'path',
                    required: true,
                    description: 'ID de la transaccion',
                    schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' },
                    example: '507f1f77bcf86cd799439011'
                },
                IncomeId: {
                    name: 'iid',
                    in: 'path',
                    required: true,
                    description: 'ID del ingreso',
                    schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' },
                    example: '507f1f77bcf86cd799439011'
                }
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Solicitud no valida' },
                        error: { type: 'string', example: 'El campo amount es requerido' }
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        uid: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        name: { type: 'string', example: 'Fredy' },
                        surname: { type: 'string', example: 'Garcia' },
                        email: { type: 'string', format: 'email', example: 'user@example.com' },
                        profilePicture: { type: 'string', nullable: true },
                        role: { type: 'string', enum: ['USER', 'ADMIN'] },
                        status: { type: 'boolean', example: true }
                    }
                },
                Goal: {
                    type: 'object',
                    properties: {
                        gid: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        user: { type: 'string' },
                        goalPicture: { type: 'string', nullable: true },
                        name: { type: 'string', example: 'PlayStation 5' },
                        targetAmount: { type: 'number', format: 'float', example: 5000 },
                        currentAmount: { type: 'number', format: 'float', example: 1500 },
                        savingAmount: { type: 'number', nullable: true, example: 500 },
                        savingFrequency: { type: 'string', nullable: true, enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] },
                        status: { type: 'string', enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'] },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Transaction: {
                    type: 'object',
                    properties: {
                        tid: { type: 'string' },
                        user: { type: 'string' },
                        goal: { type: 'string' },
                        type: { type: 'string', enum: ['DEPOSIT', 'WITHDRAW'] },
                        amount: { type: 'number', format: 'float', example: 500 },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Financial: {
                    type: 'object',
                    properties: {
                        fid: { type: 'string' },
                        user: { type: 'string' },
                        hasJob: { type: 'boolean', example: true },
                        monthlySalary: { type: 'number', nullable: true, example: 5000 },
                        monthlyExpenses: { type: 'number', example: 3000 },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Income: {
                    type: 'object',
                    properties: {
                        iid: { type: 'string' },
                        user: { type: 'string' },
                        type: { type: 'string', enum: ['SALARY EXTRA', 'BONUS', 'AGUINALDO', 'EXTRA', 'OTHER'] },
                        amount: { type: 'number', format: 'float', example: 5000 },
                        frequency: { type: 'string', enum: ['WEEKLY', 'MONTHLY', 'BIMONTHLY', 'SEMESTERLY', 'YEARLY', 'IRREGULAR'] },
                        description: { type: 'string', nullable: true, example: 'Salario mensual' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    },
    apis: [
        './src/auth/auth.routes.js',
        './src/user/user.routes.js',
        './src/goal/goal.routes.js',
        './src/transaction/transaction.routes.js',
        './src/financial/financial.routes.js',
        './src/income/income.routes.js',
        './src/statistics/statistics.router.js'
    ]
}

const swaggerDocs = swaggerJSDoc(options);

export { swaggerUi, swaggerDocs };