import build from '../src/index.js';
import 'dotenv/config';

const app = await build();

const port = process.env.PORT || 3000;

app.listen({ port }, () => {
  console.log(`Example app listening on port ${port}`);
});
