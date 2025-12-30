import { Hono } from 'hono';
import { cors } from "hono/cors"
import { estimateRoutes } from './routes/estimate';
import { chatRoutes } from './routes/chat';

const app = new Hono()
  .basePath('api');

app.use(cors({
  origin: "*"
}))

app.get('/ping', (c) => c.json({ message: `Pong! ${Date.now()}` }));

app.route('/estimate', estimateRoutes);
app.route('/chat', chatRoutes);

export default app;