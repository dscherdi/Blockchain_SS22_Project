import express, { json, Response, Request } from 'express';
import cors from "cors";

const app = express();
app.set('trust proxy', true);
app.use(cors());
app.use(json());


app.get("/", (req: Request, res: Response) => {
      return res.json({success: true});
});


export { app } 