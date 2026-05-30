import express from "express";
import {createServer} from "http";
import {Server} from "socket.io";
import { YSocketIO } from "y-socket.io/dist/server";



const app = express()
app.use(express.static('public'))
const httpServer = createServer(app)
const PORT = process.env.PORT || 3000


const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

const ySocketIO = new YSocketIO(io)
ySocketIO.initialize()





app.get('/', (req, res) => {    

    res.status(200).json({ 
        message: 'Hello World!',
        success: true
    });
});


app.get ('/health', (req, res) => {
    res.status(200).json({
        message: 'OK',
        success: true
    });
})






httpServer.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the existing process or run with a different PORT.`);
    process.exit(1);
  }

  throw error;
});

httpServer.listen(PORT, () => {
  console.log(`Server is Running on PORT: ${PORT}`);
})

