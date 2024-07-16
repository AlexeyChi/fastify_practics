export default (app) => {
  app.get('/', { name: 'root' }, (req, res) => res.view('src/views/index'));
};
