import yup from 'yup';

import { encrypt } from '../utils.js';

export default (app, db) => {
  // <--- View users list --->
  app.get('/users', { name: 'users' }, (req, res) => {
    const filterOptions = req.query;
    const { username } = req.session;

    const query = filterOptions.name
      ? `SELECT * FROM users WHERE name LIKE '%${filterOptions.name}%'`
      : 'SELECT * FROM users';

    db.all(query, (err, data) => {
      if (err) {
        console.error(err);
        res.view('src/views/users/index', { error: err });
        return;
      }
      const templateData = {
        users: data,
        username,
      };

      res.view('src/views/users/index', templateData);
    });
  });
  
  // <--- Form for adding a new user --->
  app.get('/users/new', { name: 'newUser' }, (req, res) => {
    const { username } = req.session;
    const templateData = {
      flash: res.flash(),
      username,
    };

    res.view('src/views/users/new', templateData)});
  
  // <--- Creating new user --->
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
        error: req.validationError,
      };
      res.view('src/views/users/new', data);
      return;
    }

    const encriptedPassword = encrypt(password);
    const user = {
      name,
      email,
      password: encriptedPassword,
    };

    const stmt = db.prepare('INSERT INTO users(name, email, password) VALUES (?, ?, ?)');
    return new Promise((resolve, reject) => {
      stmt.run([user.name, user.email, user.password], (err) => {
        if (err) {
          const templateData = {
            flas: res.flash(),
            name,
            email,
            password,
            error: err,
          };
          res.flash('success', 'New user successfully added');
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
    const { username } = req.session;

    db.get(`SELECT * FROM users WHERE id = ${id}`, (err, data) => {
      if (err) {
        console.error(err);
        res.view('src/views/users/index', { error: err });
        return;
      }
      const templateData = {
        user: data,
        flash: res.flash(),
        username,
      };
      res.view('src/views/users/show', templateData);
    });
  });
  
  // <--- User editing form --->
  app.get('/users/:id/edit', { name: 'editUser' }, (req, res) => {
    const { id } = req.params;
    const { username } = req.session;

    db.get(`SELECT * FROM users WHERE id = ${id}`, (err, data) => {
      if (err) {
        res.redirect(app.reverse('users'));
        return;
      }
      const templateData = {
        user: data,
        flash: res.flash(),
        username,
      };

      res.view('src/views/users/edit', templateData);
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