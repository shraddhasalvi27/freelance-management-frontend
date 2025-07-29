import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDatabase from './db/connectDatabase.js';
import freelancerRoutes from './Routes/FreeliencerRoute.js'
import clientRoutes from './Routes/ClientRoutes.js'
import path from 'path'; // Import path to work with file and directory paths
import { fileURLToPath } from 'url';  // Import the fileURLToPath method



dotenv.config();

const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// ✅ Serve static files from /uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Database connection
connectDatabase();

// Default route
app.get("/", (req, res) => {
    res.json({
        status: "success",    // A key to indicate the response status
        message: "Welcome to our service!", // Static message
    });
});


// Get the directory name for the current file (equivalent of __dirname in CommonJS)
app.use('/api/freelancers', freelancerRoutes);
app.use('/api/client', clientRoutes);


// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve frontend static files (HTML, JS, CSS)
app.use(express.static(path.join(path.resolve(), '../client')));


// Create HTTP server with Express app
const server = http.createServer(app);









// Start the server
const port = process.env.PORT || 6000;
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
