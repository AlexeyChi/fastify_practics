import build from '../src/index.js';

const app = await build();

const port = process.env.PORT || 3000;
const host = ("RENDER" in process.env) ? `0.0.0.0` : `localhost`;


app.listen({ host, port }, () => {
  console.log(`Example app listening on port ${port}`);
});
