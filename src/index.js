import fastify from 'fastify';
import pug from 'pug';
import view from '@fastify/view';
import formbody from '@fastify/formbody';

import { crypto, genereateId } from './utils.js';

const app = fastify();
const port = 3000;

await app.register(view, { engine: { pug } });
await app.register(formbody);

const state = {
  courses: [
    {
      id: '1',
      title: 'JS: Массивы',
      description: 'Курс про массивы в JavaScript',
    },
    {
      id: '2',
      title: 'JS: Функции',
      description: 'Курс про функции в JavaScript',
    },
    {
      id: '3',
      title: 'Fastify',
      description: 'Курс по фреймворку Fastify'
    },
  ],
  users: [
    { id: '1', name: 'admin', email: 'admin@example.com', password: 'admin' },
  ],
  };

app.get('/', (req, res) => res.view('src/views/index'));

app.get('/users', (req, res) => {
  const { term } = req.query;
  let currentUsers = state.users;

  if (term) {
    currentUsers = state.users.filter(({ name }) => name.includes(term.toLowerCase()));
  }
  res.view('src/views/users/index.pug', { users: currentUsers });
});

app.get('/users/new', (req, res) => res.view('src/views/users/new'));

app.post('/users', (req, res) => {
  const secretPass = crypto(req.body.email);

  const user = {
    id: genereateId(state.users.length),
    name: req.body.username.toLowerCase(),
    email: req.body.email.trim().toLowerCase(),
    password: secretPass,
  };

  state.users.push(user);

  res.redirect('/users');
});

app.get('/users/:id', (req, res) => {
    const user = state.users.find(({ id }) => id === req.params.id);

    if (!user) {
      res.status(404).send('User not found');
    }
    res.view('src/views/users/show.pug', { user });
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

app.get('/courses/new', (req, res) => res.view('src/views/courses/new'));

app.get('/courses/:id', (req, res) => {
  const course = state.courses.find(({id}) => id === req.params.id);
  res.view('src/views/courses/show.pug', { course });
});

app.post('/courses', (req, res) => {
  const course = {
    id: genereateId(state.courses.length), //<------ToDo fix this
    title: req.body.title,
    description: req.body.description,
  };

  state.courses.push(course);

  res.redirect('/courses');
});


app.listen({ port }, () => {
  console.log(`Example app listening on port ${port}`);
});
