import fastify from 'fastify';
import pug from 'pug';
import view from '@fastify/view';
import formbody from '@fastify/formbody';
import { plugin as fastifyReverseRoutes } from 'fastify-reverse-routes';

import addRoutes from './routes/index.js';

export default async () => {
  const app = fastify({ exposeHeadRoutes: false });
  
  const route = (name, placeholderValues) => app.reverse(name, placeholderValues);
  
  await app.register(view, {
    engine: { pug },
    defaultContext: {
      route,
    },
  });
  await app.register(formbody);
  await app.register(fastifyReverseRoutes);
  
  let state = {
    courses: [
      {
        id: '1',
        title: 'JS: Массивы',
        description: 'Курс про массивы в JavaScript',
      },
      {
        id: '2',
        title: 'JS: Функции',
        description: 'Курс про функции в JavaScript',
      },
      {
        id: '3',
        title: 'Fastify',
        description: 'Курс по фреймворку Fastify'
      },
    ],
    users: [
      { id: '1', name: 'admin', email: 'admin@example.com', password: 'admin' },
    ],
  };

  addRoutes(app, state);
  return app;
};
