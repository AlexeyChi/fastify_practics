import build from '../src/index.js';

const app = await build();

const port = process.env.PORT || 3000;

console.log(process.env.PORT);

app.listen({ port }, () => {
  console.log(`Example app listening on port ${port}`);
});
