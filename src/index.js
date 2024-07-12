import fastify from 'fastify';
import pug from 'pug';
import view from '@fastify/view';
import formbody from '@fastify/formbody';
import yup from 'yup';
import { plugin as fastifyReverseRoutes } from 'fastify-reverse-routes';

import { crypto, genereateId } from './utils.js';

const app = fastify({ exposeHeadRoutes: false });
const port = 3000;

const route = (name, placeholderValues) => app.reverse(name, placeholderValues);

await app.register(view, {
  engine: { pug },
  defaultContext: {
    route,
  },
});
await app.register(formbody);
await app.register(fastifyReverseRoutes);

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

//<--root road------------>
app.get('/', { name: 'root' }, (req, res) => res.view('src/views/index'));

//<--users road----------->
app.get('/users', { name: 'users' }, (req, res) => {
  const { term } = req.query;
  let currentUsers = state.users;

  if (term) {
    currentUsers = state.users.filter(({ name }) => name.includes(term.toLowerCase()));
  }
  res.view('src/views/users/index.pug', { users: currentUsers });
});

app.get('/users/new', { name: 'newUser' }, (req, res) => res.view('src/views/users/new'));

app.post('/users', {
  attachValidation: true,
  schema: {
    body: yup.object({
      name: yup.string().min(2, 'Name must contain at last 2 characters'),
      email: yup.string().email(),
      password: yup.string().min(5),
      passwordConfirmaton: yup.string().min(5),
    }),
  },
  validatorCompiler: ({ schema, method, url, hhtpPath }) => (data)  => {
    if (data.password !== data.passwordConfirmaton) {
      return {
        error: Error('Password confirmation isn\'t equal the password')
      };
    }
    try {
      const result = schema.validateSync(data);
      return { value: result };
    } catch (err) {
      return { error: err };
    }
  },
}, (req, res) => {
  const { name, email, password, passwordConfirmaton } = req.body;
  const secretPass = crypto(password);

  if (req.validationError) {
    const data = {
      name,
      email,
      password,
      passwordConfirmaton,
      error: req.validationError
    };
    res.view('src/views/users/new', data);
    return;
  }

  const user = {
    id: genereateId(state.users.length),
    name: name.toLowerCase(),
    email: email.trim().toLowerCase(),
    password: secretPass,
  };

  state.users.push(user);

  res.redirect(app.reverse('users'));
});

app.get('/users/:id', { name: 'user' }, (req, res) => {
    const user = state.users.find(({ id }) => id === req.params.id);

    if (!user) {
      res.status(404).send('User not found');
    }
    res.view('src/views/users/show.pug', { user });
});

app.get('/users:id/post/posts:postId', (req, res) => {
    res.send(`User ID: ${req.params.id}, Post ID: ${req.params.postId}`);
});


//<--courses road------------>
app.get('/courses', {name: 'courses'}, (req, res) => {
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

app.get('/courses/new', { name: 'newCourse' }, (req, res) => res.view('src/views/courses/new'));

app.get('/courses/:id', { name: 'course' }, (req, res) => {
  const course = state.courses.find(({id}) => id === req.params.id);
  res.view('src/views/courses/show.pug', { course });
});

app.post('/courses',{
  attachValidation: true,
  schema: {
    body: yup.object({
      title: yup.string().min(2, 'Title must contain at last 2 characters'),
      description: yup.string().min(10, 'Description must contain at last 10 characters'),
    }),
  },
  validatorCompiler: ({schema, method, url, hhtpPath }) => (data) => {
    const courseTitles = state.courses.map(({ title }) => title);

    if (courseTitles.includes(data.title)) {
      return {
        error: Error('Course title isn\'t unique')
      };
    }
    try {
      const result = schema.validateSync(data);
      return { value: result };
    } catch (err) {
      return { error: err };
    }
  }
}, (req, res) => {
  const { title, description } = req.body;

  if (req.validationError) {
    const data = {
      title,
      description,
      error: req.validationError,
    };

    res.view('src/views/courses/new', data);
    return;
  }

  const course = {
    id: genereateId(state.courses.length),
    title: req.body.title,
    description: req.body.description,
  };

  state.courses.push(course);

  res.redirect(app.reverse('courses'));
});

app.listen({ port }, () => {
  console.log(`Example app listening on port ${port}`);
});
