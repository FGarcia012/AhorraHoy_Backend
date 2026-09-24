# AHORRA HOY Backend

API REST para gestionar metas de ahorro, movimientos, informacion financiera, ingresos y estadisticas personales.

## Tecnologias

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- Argon2
- express-validator
- Multer
- Swagger UI

## Requisitos previos

- Node.js 20 o superior.
- npm.
- MongoDB local o una instancia de MongoDB Atlas.
- Git, si se descargara mediante repositorio.

## Descargar e instalar

```bash
git clone <URL_DEL_REPOSITORIO>
cd AhorraHoy_Back
npm install
```

Si el proyecto ya fue descargado, basta con entrar a la carpeta y ejecutar `npm install`.

## Configurar `.env`

Crea un archivo llamado `.env` en la raiz del proyecto. No lo publiques ni lo subas al repositorio.

Ejemplo para MongoDB Atlas:

```env
PORT=3010
URI_MONGO=mongodb+srv://USUARIO:CONTRASENA@cluster.mongodb.net/ahorraHoy?retryWrites=true&w=majority
SECRETPRIVATEKEY=una-clave-larga-privada-y-dificil-de-adivinar
```

Ejemplo para MongoDB local:

```env
PORT=3010
URI_MONGO=mongodb://127.0.0.1:27017/ahorraHoy
SECRETPRIVATEKEY=una-clave-larga-privada-y-dificil-de-adivinar
```

Variables utilizadas:

| Variable | Uso |
|---|---|
| `PORT` | Puerto HTTP del servidor. Si no existe, usa `3010`. |
| `URI_MONGO` | Cadena de conexion a MongoDB. |
| `SECRETPRIVATEKEY` | Secreto usado para firmar y validar JWT. Debe ser el mismo en ambos procesos. |

Genera un secreto distinto para cada entorno. Si el secreto se expone, debe cambiarse y los tokens anteriores dejaran de ser validos.

## Levantar el backend

Modo desarrollo con reinicio automatico:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

La API quedara disponible en:

```text
http://localhost:3010
```

Swagger UI:

```text
http://localhost:3010/api-docs
```

Base de los endpoints:

```text
http://localhost:3010/ahorraHoy/v1
```

## Estructura

```text
src/
├── auth/
├── user/
├── goal/
├── transaction/
├── financial/
├── income/
├── statistics/
├── helpers/
└── middlewares/

configs/
├── mongo.js
├── server.js
└── swagger.js

public/uploads/
├── profile-picture/
└── goal-picture/
```

Flujo de una peticion:

```text
Cliente -> route -> validator/middleware -> controller -> model -> MongoDB
MongoDB -> controller -> respuesta JSON -> Cliente
```

## Autenticacion

Primero registra un usuario y luego inicia sesion:

```http
POST /ahorraHoy/v1/auth/register
POST /ahorraHoy/v1/auth/login
```

El login devuelve un JWT. En los endpoints protegidos se envia asi:

```http
Authorization: Bearer <TOKEN>
```

En Swagger usa el boton `Authorize` y escribe:

```text
Bearer <TOKEN>
```

Las rutas protegidas validan el token y comprueban que el usuario este activo.

## Endpoints

### Auth

| Metodo | Ruta | Uso |
|---|---|---|
| `POST` | `/auth/register` | Registrar usuario. Acepta `multipart/form-data` si incluye fotografia. |
| `POST` | `/auth/login` | Iniciar sesion y obtener JWT. |

Ejemplo de registro JSON si no se envia imagen:

```json
{
  "name": "Fredy",
  "surname": "Garcia",
  "email": "fredy@example.com",
  "password": "Password1!"
}
```

La contrasena debe tener minimo 8 caracteres, una mayuscula, una minuscula, un numero y un simbolo.

### User

Todas estas rutas requieren JWT.

| Metodo | Ruta | Uso |
|---|---|---|
| `PATCH` | `/user/updatePassword/:uid` | Cambiar contrasena. |
| `PUT` | `/user/updateUser/:uid` | Actualizar datos basicos. |
| `PATCH` | `/user/updateProfilePicture/:uid` | Cambiar fotografia de perfil. |
| `DELETE` | `/user/deleteUser/:uid` | Desactivacion logica, requiere `{ "confirm": "yes" }`. |

`role` no debe enviarse ni editarse desde el frontend. Los roles permitidos son `USER` y `ADMIN`, pero su modificacion se realiza manualmente en la base de datos cuando sea necesario.

### Goal

| Metodo | Ruta | Uso |
|---|---|---|
| `POST` | `/goal/createGoal/:uid` | Crear una meta. Acepta imagen opcional. |
| `GET` | `/goal/getActiveGoal/:uid` | Obtener la meta activa y su progreso. |
| `GET` | `/goal/getGoalById/:gid` | Obtener una meta por ID. |
| `GET` | `/goal/getGoalHistory/:uid` | Obtener metas completadas o canceladas. |
| `PUT` | `/goal/updateGoal/:gid` | Actualizar datos permitidos de una meta activa. |
| `PATCH` | `/goal/updateGoalPicture/:gid` | Cambiar la imagen de una meta. |
| `POST` | `/goal/deposit/:gid` | Depositar y registrar movimiento `DEPOSIT`. |
| `POST` | `/goal/withdraw/:gid` | Retirar y registrar movimiento `WITHDRAW`. |
| `PATCH` | `/goal/cancelGoal/:gid` | Cancelar logicamente una meta activa. |

Ejemplo de creacion:

```json
{
  "name": "PlayStation 5",
  "targetAmount": 5000,
  "savingAmount": 500,
  "savingFrequency": "MONTHLY"
}
```

Ejemplos de deposito y retiro:

```json
{ "amount": 500 }
```

Una meta puede estar en estos estados:

```text
ACTIVE
COMPLETED
CANCELLED
```

El usuario solo puede tener una meta `ACTIVE` al mismo tiempo. `currentAmount`, `status`, `remainingAmount` y `progressPercentage` no deben editarse desde el formulario generico; los dos ultimos se calculan en el backend.

### Transaction

Las transacciones son el historial de movimientos y no se eliminan fisicamente.

| Metodo | Ruta | Uso |
|---|---|---|
| `GET` | `/transaction/getTransactionById/:tid` | Obtener un movimiento. |
| `GET` | `/transaction/getUserTransactions/:uid` | Historial del usuario. |
| `GET` | `/transaction/getGoalTransactions/:gid` | Historial de una meta. |

Valores actuales de `type`:

```text
DEPOSIT
WITHDRAW
```

El frontend debe mostrar estos valores en espanol, por ejemplo `Deposito` y `Retiro`, pero debe enviar exactamente los valores definidos por la API cuando corresponda.

### Financial

Cada usuario tiene una sola configuracion financiera. `PUT` crea el registro si no existe y lo actualiza si ya existe.

| Metodo | Ruta | Uso |
|---|---|---|
| `GET` | `/financial/getFinancial/:uid` | Consultar informacion financiera. |
| `PUT` | `/financial/updateFinancial/:uid` | Crear o actualizar informacion financiera. |

Ejemplo:

```json
{
  "hasJob": true,
  "monthlySalary": 5000,
  "monthlyExpenses": 3000
}
```

Si no tiene trabajo:

```json
{
  "hasJob": false,
  "monthlySalary": null,
  "monthlyExpenses": 1500
}
```

No se debe inferir el salario a partir de los depositos de una meta.

### Income

Un usuario puede tener varios registros de ingresos.

| Metodo | Ruta | Uso |
|---|---|---|
| `POST` | `/income/createIncome/:uid` | Crear ingreso. |
| `GET` | `/income/getIncomeById/:iid` | Obtener ingreso por ID. |
| `GET` | `/income/getUserIncomes/:uid` | Listar ingresos del usuario. |
| `PUT` | `/income/updateIncome/:iid` | Actualizar ingreso. |

Ejemplo:

```json
{
  "type": "BONUS",
  "amount": 500,
  "frequency": "BIMONTHLY",
  "description": "Bono laboral"
}
```

Valores actuales de `type`:

```text
SALARY EXTRA
BONUS
AGUINALDO
EXTRA
OTHER
```

Valores actuales de `frequency`:

```text
WEEKLY
MONTHLY
BIMONTHLY
SEMESTERLY
YEARLY
IRREGULAR
```

Estos valores deben aparecer en el frontend como botones, selects o grupos de opciones, no como texto libre.

### Statistics

| Metodo | Ruta | Uso |
|---|---|---|
| `GET` | `/statistics/getUserStatistics/:uid` | Obtener resumen calculado en tiempo real. |

Incluye ingresos proyectados, ingresos irregulares, depositos, retiros, ahorro neto, gastos, dinero disponible y progreso de la meta activa.

## Enums y formularios

Todos los campos enumerados deben representarse como opciones seleccionables en el frontend:

- Goal `savingFrequency`: `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`.
- Goal `status`: lo controla el backend; no es editable por el usuario.
- Transaction `type`: `DEPOSIT`, `WITHDRAW`; lo determina la accion realizada.
- Income `type`: `SALARY EXTRA`, `BONUS`, `AGUINALDO`, `EXTRA`, `OTHER`.
- Income `frequency`: `WEEKLY`, `MONTHLY`, `BIMONTHLY`, `SEMESTERLY`, `YEARLY`, `IRREGULAR`.
- User `role`: nunca se muestra como formulario editable ni se modifica desde React.

## Archivos y fotografias

Los formularios de registro y actualizacion de imagen utilizan `multipart/form-data` y estos nombres de campo:

- Perfil: `profilePicture`.
- Meta: `goalPicture`.

Los formularios que no incluyen archivos pueden utilizar `application/json`.

## Buenas practicas

- No confiar en validaciones del frontend: el backend valida de nuevo.
- No guardar en React el JWT en lugares inseguros sin evaluar el riesgo; centralizar la gestion de sesion.
- No permitir editar `role`, `status`, `currentAmount` ni estados de metas desde formularios genericos.
- Usar botones, selects o radio buttons para los enums.
- Mostrar mensajes de validacion en espanol.
- Manejar estados de carga, error, vacio y exito.
- No confundir ingresos con ahorro.
- Mantener componentes y llamadas HTTP separados de la presentacion cuando el frontend sea creado.
- Probar siempre respuestas `401`, `403`, `404` y `422/400` en cada formulario.

## Verificacion

Comprobacion de sintaxis del backend, excluyendo dependencias:

```powershell
Get-ChildItem -Path . -Recurse -Filter *.js |
Where-Object { $_.FullName -notlike '*\\node_modules\\*' } |
ForEach-Object { node --check $_.FullName }
```

La documentacion interactiva debe probarse en `/api-docs` con un JWT valido y una base de datos MongoDB disponible.

## Estado actual

El backend contiene los modulos de autenticacion, usuarios, metas, transacciones, finanzas, ingresos y estadisticas. Antes de produccion se deben ejecutar pruebas funcionales y revisar los puntos de seguridad pendientes, especialmente autorizacion entre usuarios, actualizacion segura de usuarios y consistencia entre saldo y transaccion.
