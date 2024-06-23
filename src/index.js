import fastify from 'fastify';
import pug from 'pug';
import view from '@fastify/view';

const app = fastify();
const port = 3000;

await app.register(view, { engine: { pug } });
const state = {
  courses: [
    {
      id: 1,
      title: 'JS: Массивы',
      description: 'Курс про массивы в JavaScript',
    }, 
    {
      id: 2,
      title: 'JS: Функции',
      description: 'Курс про функции в JavaScript',
    }, 
    {
      id: 3,
      title: 'Fastify',
      description: 'Курс по фреймворку Fastify'
    },
  ],
  };

app.get('/', (req, res) => res.view('src/views/index'));

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
    res.send(`User ID: ${req.params.id}, Post ID: ${req.params.postId}`);
});

app.get('/courses', (req, res) => {
  const { term } = req.query;
  let currentCurses = state.courses;

  if (term) {
    currentCurses = state.courses.filter(({ title, description }) => (
      title.toLowerCase().includes(term.toLowerCase()) || description.toLowerCase().includes(term.toLowerCase())
    ));
  }

  const data = { term, courses: currentCurses };
  res.view('src/views/courses/index.pug', data);
});

app.get('/courses/:id', (req, res) => {
  const course = state.courses.find(({id}) => id === Number(req.params.id));
  res.view('src/views/courses/show.pug', { course });
});


app.listen({ port }, () => {
  console.log(`Example app listening on port ${port}`);
});
