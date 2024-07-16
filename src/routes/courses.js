import yup from 'yup';

import { genereateId } from '../utils.js';

export default (app, state) => {
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
      //   const courseTitles = state.courses.map(({ title }) => title);
    
      //   if (courseTitles.includes(data.title)) {
      //     return {
      //       error: Error('Course title isn\'t unique')
      //     };
      //   }
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

    app.get('/courses/:id/edit', { name: 'editCourse' }, (req, res) => {
      const { id } = req.params;
      const course = state.courses.find((course) => course.id === id);
      if (!course) {
        res.code(404).send({ message: 'Course not found' });
      } else {
        res.view('src/views/courses/edit', { course });
      }
    });
};


