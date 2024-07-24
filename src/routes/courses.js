import yup from 'yup';

export default (app, db) => {
  // <--- View courses list --->
  app.get('/courses', {name: 'courses'}, (req, res) => {
    const filterOptions = req.query;
    const query = filterOptions.description
      ? `SELECT * FROM courses WHERE description LIKE '%${filterOptions.description}%'`
      : `SELECT * FROM courses`;

    db.all(query, (error, data) => {
      if (error) {
        console.error(error);
        res.view('src/views/courses/index', { error: error });
        return;
      }
      const templateData = {
        courses: data,
      };
      res.view('src/views/courses/index.pug', templateData);
    });
  });
    
  // <--- Form for adding a new course --->
  app.get('/courses/new', { name: 'newCourse' }, (req, res) => res.view('src/views/courses/new'));

  // <--- View course by ID --->
  app.get('/courses/:id', { name: 'course' }, (req, res) => {
    const { id } = req.params;

    db.get(`SELECT * FROM courses WHERE id = ${id}`, (error, data) => {
      const templateData = {
        course: data,
        error,
      };
      console.log(templateData)
      res.view('src/views/courses/show.pug', templateData);
    });
  });

  // <--- Form for creating a new course --->
  app.post('/courses', {
    attachValidation: true,
    schema: {
      body: yup.object({
        title: yup.string().min(2, 'Title must contain at last 2 characters'),
        description: yup.string().min(10, 'Description must contain at last 10 characters'),
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
          res.redirect(app.reverse('newCourse', templateData));
          reject();
        }
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
        res.redirect(app.reverse('courses'));
        return;
      }
      res.view('src/views/courses/edit', { course: data });
    });
  });

  // <--- Edit course --->
  app.post('/courses/:id', {
    attachValidation: true,
    schema: {
      body: yup.object({
        title: yup.string().min(2, 'Title must contain at last 2 characters'),
        description: yup.string().min(10, 'Description must contain at last 10 characters'),
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
      const templateData = {
        title,
        description,
        error: req.validationError,
      };
      res.view('src/views/courses/new', templateData);
    }

    const course = { title, description };

    const stmt = db.prepare('UPDATE courses SET title = ?, description = ? WHERE id = ?');

    return new Promise((resolve, reject) => {
      stmt.run([course.title, course.description, id], (error) => {
        if (error) {
          res.redirect(app.reverse('course', { id }));
          reject();
        }
        res.redirect(app.reverse('courses'));
        resolve(true);
      });
    });
  });

  // <--- Delete course --->
  app.post('/delete/:id', {name: 'deleteCourse' }, (req, res) => {
    const { id } = req.params;

    const stmt = db.prepare('DELETE FROM courses WHERE id = ?');
    return new Promise((resolve, reject) => {
      stmt.run(id, (err) => {
        if (err) {
          res.redirect(app.reverse('course', { id }));
          reject();
        }
        res.redirect(app.reverse('courses'));
        resolve(true);
      });
    });
  });
};
