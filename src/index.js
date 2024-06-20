import fastify from 'fastify';

const app = fastify();
const port = 3000;

app.get('/', (req, res) => {
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

app.get('/users:id', (req, res) => {
    res.send(`User ID: ${req.params.id}`);
});

app.get('/users:id/post/posts:postId', (req, res) => {
    res.send(`User ID: ${req.params.id}, Post ID: ${res.params.postId}`);
});

app.get('/courses/:id', (req, res) => {
    res.send(`Course ID: ${req.params.id}`);
});


app.listen({ port }, () => {
    console.log(`Example app listening on port ${port}`);
});
