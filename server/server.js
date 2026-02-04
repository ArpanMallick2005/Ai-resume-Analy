import express from 'express';
import cors from "cors";
import "dotenv/config";
import connectDB from './configs/db.js';
import userRouter from './routes/userRoutes.js';
import resumeRouter from './routes/resumeRoutes.js';
import aiRouter from './routes/aiRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app=express();
const PORT=process.env.PORT || 3000;

// Database Connection - using .then() to avoid top-level await issues in some environments
connectDB().then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.error("MongoDB Connection Error:", err);
});

app.use(express.json());
app.use(cors());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/users',userRouter);
app.use('/api/resumes',resumeRouter);
app.use('/api/ai',aiRouter);

app.get('/',(req,res)=>res.send("Server is live..."));

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});