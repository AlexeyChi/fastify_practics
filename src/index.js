import fastify from 'fastify';

const app = fastify();
const port = 3000;

app.get('/hello', (req, res) => {
    const user = req.query.name;

    if (!user) {
        res.send('Hello World!');
    } else {
        res.send(`Hello ${user}`);
    }
});

app.get('/users', (req, res) => {
    res.send('GET /users');
});

app.post('/users', (req, res) => {
    res.send('POST /users');
});

app.listen({ port }, () => {
    console.log(`Example app listening on port ${port}`);
});
