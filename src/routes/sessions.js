import { decrypt, encrypt } from '../utils.js';

export default (app, db) => {
  //<--- Sing up form --->
  app.get('/sessions/new', {name: 'newSession'}, (req, res) => {
    res.view('src/views/sessions/new');
  });
  
  //<--- User Log in --->
  app.post('/sessions', (req, res) => {
    const { name, password } = req.body;

    db.all(`SELECT * FROM users WHERE name = ?`, [name], (err, data) => {      
      if (err) {
        console.error(err);
        res.view('src/views/sessions/new', { error: err });
        return;
      }

      const user = data.find((u) => decrypt(u.password) === password && u.name === name);
      if (!user) {
        const message = 'Wrong username or password';
        res.view('src/views/sessions/new', { error: message });
        return;
      }
      req.session.username = user.name;
      res.redirect(app.reverse('root', {}));
    });
  });

  //<--- User Log out --->
  app.post('/sessions/delete', {name: 'sessionClosed'}, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).send('Internal Server Error');
      } else {
        res.redirect(app.reverse('root'));
      }
    });
  });
};
