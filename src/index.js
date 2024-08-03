import fastify from 'fastify';
import pug from 'pug';
import view from '@fastify/view';
import formbody from '@fastify/formbody';
import { plugin as fastifyReverseRoutes } from 'fastify-reverse-routes';
import fastifyCookie from '@fastify/cookie';
import session from '@fastify/session';
import sqlite3 from 'sqlite3';

import addRoutes from './routes/index.js';

export default async () => {
  const app = fastify({ exposeHeadRoutes: false, logger: true });

  const db = new sqlite3.Database(':memory:');
  
  const prepareDatabase = () => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS courses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title VARCHAR(255) NOT NULL,
          description TEXT
        )
      `);
      db.run(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          password VASRCHAR(255) NOT NULL
        )
      `);
    });

    const courses = [
      { id: '1', title: 'JS: Массивы', description: 'Курс про массивы в JavaScript' },
      { id: '2', title: 'JS: Функции', description: 'Курс про функции в JavaScript' },
    ];

    const stmtCourses = db.prepare(`INSERT INTO courses VALUES (?, ?, ?)`);

    courses.forEach((course) => {
      stmtCourses.run(course.id, course.title, course.description);
    });

    stmtCourses.finalize();

    const users = [
      { id: '1', name: 'admin', email: 'admin@example.com', password: 'admin' },
    ];

    const stmtUsers = db.prepare(`INSERT INTO users VALUES (?, ?, ?, ?)`);

    users.forEach((user) => {
      stmtUsers.run(user.id, user.name, user.email, user.password);
    })

    stmtUsers.finalize();
  }

  prepareDatabase();
    
  await app.register(fastifyReverseRoutes);
  await app.register(formbody);
  await app.register(view, {
    engine: { pug },
    defaultContext: {
      route(name, placeholderValues) {
        return app.reverse(name, placeholderValues);
      },
    },
  });
  await app.register(fastifyCookie);
  await app.register(session, {
    secret: 'a secret with minimum length of 32 characters',
    cookie: {
      secure: false,
    },
  });

  addRoutes(app, db);
  return app;
};
