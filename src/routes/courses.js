import yup from 'yup';

export default (app, db) => {
  // <--- View courses list --->
  app.get('/courses', { name: 'courses' }, (req, res) => {
    const filterOptions = req.query;
    const { username } = req.session;

    const query = filterOptions.description
      ? `SELECT * FROM courses WHERE description LIKE '%${filterOptions.description}%'`
      : `SELECT * FROM courses`;

    db.all(query, (error, data) => {
      if (error) {
        console.error(error);
        req.flash('warring', 'Error getting users list');
        res.redirect(app.reverse('courses'));
        return;
      }
      const templateData = {
        flash: res.flash(),
        courses: data,
        username,
      };
      res.view('src/views/courses/index', templateData);
    });
  });

  // <--- Form for adding a new course --->
  app.get('/courses/new', { name: 'newCourse' }, (req, res) => {
    const { username } = req.session;
    const templateData = {
      username,
    };

    res.view('src/views/courses/new', templateData)});

  // <--- View course by ID --->
  app.get('/courses/:id', { name: 'course' }, (req, res) => {
    const { id } = req.params;
    const { username } = req.session;

    db.get(`SELECT * FROM courses WHERE id = ${id}`, (err, data) => {
      if (err) {
        console.log(err);
        req.flash('warning', 'Error getting users list');
        res.render('index', { flash: res.flash() });
        return;
      }

      const templateData = {
        flash: res.flash(),
        course: data,
        username,
      };

      res.view('src/views/courses/show.pug', templateData);
    });
  });

  // <--- Creating a new course --->
  app.post('/courses', {
    attachValidation: true,
    schema: {
      body: yup.object({
        title: yup.string().min(2, 'Title must contain at least 2 characters'),
        description: yup.string().min(10, 'Description must contain at least 10 characters'),
      }),
    },
    validatorCompiler: ({ schema }) => async (data) => {
      try {
        const courseTitles = await new Promise((resolve, reject) => {
          db.all(`SELECT title FROM courses`, (error, data) => {
            if (error) {
              reject(Error('Uncorected database query'));
            }
            resolve(data.map((course) => course.title));
          })
        });

        if (courseTitles.includes(data.title)) {
          return {
            error: Error('Course title isn\'t unique'),
          };
        }

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

    const course = { title, description };

    const stmt = db.prepare('INSERT INTO courses(title, description) VALUES(?, ?)');
    return new Promise((reject, resolve) => {
      stmt.run([course.title, course.description], (error) => {
        if (error) {
          const templateData = {
            error,
            course: { title, description },
          };
          req.flash('warning', 'Course can\'t be added');
          res.redirect(app.reverse('newCourse', templateData));
          reject();
        }
        req.flash('success', 'Course has been added');
        res.redirect(app.reverse('courses'));
        resolve(true);
      })
    });
  });

  // <--- Course editing form --->
  app.get('/courses/:id/edit', { name: 'editCourse' }, (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM courses WHERE id = ${id}`, (error, data) => {
      if (error) {
        res.flash('warning', 'Course hasn\'t been find');
        res.redirect(app.reverse('courses'));
        return;
      }
      const templateData = {
        course: data,
        flash: res.flash(),
      };
      res.view('src/views/courses/edit', templateData);
    });
  });

  // <--- Edit course --->
  app.post('/courses/:id', {
    attachValidation: true,
    schema: {
      body: yup.object({
        title: yup.string().min(2, 'Title must contain at least 2 characters'),
        description: yup.string().min(10, 'Description must contain at least 10 characters'),
      }),
    },
    validatorCompiler: ({ schema }) => async (data) => {
      try {
        const courseTitles = await new Promise((resolve, reject) => {
          db.all('SELECT * FROM courses', (err, data) => {
            if (err) {
              reject(Error('Error editing course'));
            }
            resolve(data.map((course) => course.title));
          })
        });

        if (courseTitles.includes(data.title)) {
          return {
            error: Error('Course title isn\'t unique')
          };
        }

        const result = schema.validateSync(data);
        return { value: result };
      } catch (error) {
        return { error: error };
      }
    },
  }, (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    if (req.validationError) {
      const data = {
        title,
        description,
        error: req.validationError,
        flash: res.flash(),
      };
      res.view('src/views/courses/new', data);
      return;
    }

    const course = { title, description };

    const stmt = db.prepare('UPDATE courses SET title = ?, description = ? WHERE id = ?');

    return new Promise(() => {
      stmt.run([course.title, course.description, id], (error) => {
        if (error) {
          req.flash('warning', 'Course editing error');
          res.redirect(app.reverse('course', { id }));
          return;
        }

        req.flash('success', 'The course has been edited');
        res.redirect(app.reverse('courses'));
      });
    });
  });

  // <--- Delete course --->
  app.post('/courses/delete/:id', {name: 'deleteCourse' }, (req, res) => {
    const { id } = req.params;

    const stmt = db.prepare('DELETE FROM courses WHERE id = ?');
    return new Promise((resolve, reject) => {
      stmt.run(id, (err) => {
        if (err) {
          req.flash('warning', 'Error deliting course');
          res.redirect(app.reverse('course', { id }));
          reject();
        }
        req.flash('success', 'The course has been deleted');
        res.redirect(app.reverse('courses'));
        resolve(true);
      });
    });
  });
};
