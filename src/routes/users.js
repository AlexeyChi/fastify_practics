import yup from 'yup';

import { crypto, genereateId } from '../utils.js';


export default (app, state) => {
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
};