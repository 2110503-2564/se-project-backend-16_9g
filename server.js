const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

dotenv.config({ path: './config/config.env' });

connectDB();

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(cors());

app.use(mongoSanitize());

app.use(helmet());

app.use(xss());

app.use(hpp());

const limiter = rateLimit({
    windowsMs: 10 * 60 * 1000,//10 mins
    max: 100
});
app.use(limiter);


const restaurants = require('./routes/restaurants');
const auth = require('./routes/auth');
const reservations = require('./routes/reservations');
const notifications = require('./routes/notifications');
const user = require('./routes/user');
const pointTransaction = require('./routes/pointTransaction');

app.use('/api/stb/restaurants', restaurants);
app.use('/api/stb/auth', auth);
app.use('/api/stb/reservations', reservations);
app.use('/api/stb/notifications', notifications);
app.use('/api/stb/pointtransactions', pointTransaction);
app.use('/api/stb/user', user);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API',
            version: '1.0.0',
            description: 'Restaurant Reservation API'
        }
    },
    apis: ['./routes/*.js'],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));
