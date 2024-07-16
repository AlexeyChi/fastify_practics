import courses from './courses.js';
import users from './users.js';
import root from './root.js';

const controllers = [
  root,
  courses,
  users,
];

export default (app, state) => controllers.forEach((f) => f(app, state));
