import reverse from 'fastify-reverse-routes';
import yup from 'yup';

export default (app, db) => {
  // <--- View users list --->
  app.get('/users', { name: 'users' }, (req, res) => {
    const filterOptions = req.query;

    const query = filterOptions.name
      ? `SELECT * FROM users WHERE email LIKE ${filterOptions.name}`
      : 'SELECT * FROM users';

    db.all(query, (err, data) => {
      if (err) {
        console.error(err);
        res.view('src/views/users/index', { error: err });
        return;
      }
      const templateData = {
        users: data,
      };

      res.view('src/views/users/index.pug', templateData);
    });
  });
  
  // <--- Form for adding a new user --->
  app.get('/users/new', { name: 'newUser' }, (req, res) => res.view('src/views/users/new'));
  
  // <--- Form for creating new user --->
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
    validatorCompiler: ({ schema }) => (data) => {
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
  
    const user = { name, email, password };

    const stmt = db.prepare('INSERT INTO users(name, email, password) VALUES (?, ?, ?)');
    return new Promise((resolve, reject) => {
      stmt.run([user.name, user.email, user.password], (err) => {
        if (err) {
          const templateData = {
            name,
            email,
            password,
            error: err,
          };
          res.view('src/views/users/new', templateData);
          reject();
        }
        res.redirect(app.reverse('users'));
        resolve(true);
      });
    });
  });
  
  // <--- View uses by ID --->
  app.get('/users/:id', { name: 'user' }, (req, res) => {
    const { id } = req.params;

    db.get(`SELECT * FROM users WHERE id = ${id}`, (err, data) => {
      if (err) {
        console.error(err);
        res.view('src/views/users/index', { error: err });
        return;
      }
      const templateData = {
        user: data,
      };
      res.view('src/views/users/show', templateData);
    });
  });
  
  // <--- User editing form --->
  app.get('/users/:id/edit', { name: 'editUser' }, (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM users WHERE id = ${id}`, (err, data) => {
      if (err) {
        res.redirect(app.reverse('users'));
        return;
      }
      res.view('src/views/users/edit', { user: data });
    });
  });

  // <--- Editing user --->
  app.post('/users/:id', {
    attachValidation: true,
    schema: {
      body: yup.object({
        name: yup.string().min(2, 'Name must contain at last 2 characters'),
        email: yup.string().email(),
        password: yup.string().min(5),
        passwordConfirmaton: yup.string().min(5),
      }),
    },
    validatorCompiler: ({ schema }) => (data) => {
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

    if (req.validationError) {
      const templateData = {
        name,
        email,
        password,
        passwordConfirmaton,
        error: req.validationError
      };
      res.view('src/views/users/edit', { templateData });
    }

    const { id } = req.params;
    const user = { name, email, password };

    const stmt = db.prepare('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?');
    return new Promise((resolve, reject) => {
      stmt.run([user.name, user.email, user.password, id], (err) => {
        if (err) {
          res.redirect(app.reverse('user', { id }));
          reject();
        }
        res.redirect(app.reverse('users'));
        resolve(true);
      });
    });
  });

  // <--- Delete user --->
  app.post('/users/delete/:id', { name: 'deleteUser' }, (req, res) => {
    const { id } = req.params;

    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    return new Promise((resolve, reject) => {
      stmt.run(id, (err) => {
        if (err) {
          res.redirect(app.reverse('users', { error: err }));
          reject();
        }
        res.redirect(app.reverse('users'));
        resolve(true);
      })
    });
  });
};