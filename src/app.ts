import express, { Application, Request, Response } from "express";
import router from "./routes";
import globalErrorHandler from "./middleware/globalErrorHandler";
import cookieParser from "cookie-parser";
import config from "./config";
import cors from "cors";

const app: Application = express()

app.use(cors({
    origin: config.frontend_url,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
    res.send({
        Message: "Learning Management System",
        runningTime: `${Math.floor(process.uptime())} seconds`,
        time: new Date().toLocaleString()        
    })
});

app.use("/api/v1", router)

app.use(globalErrorHandler);

export default app