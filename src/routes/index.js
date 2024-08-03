import courses from './courses.js';
import users from './users.js';
import root from './root.js';
import sessions from './sessions.js';

const controllers = [
  root,
  courses,
  users,
  sessions,
];

export default (app, db) => controllers.forEach((f) => f(app, db));
