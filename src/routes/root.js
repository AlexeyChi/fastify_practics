
export default (app) => {
  app.get('/', { name: 'root' }, (req, res) => {
    const visited = req.cookies.visited;
    const { username } = req.session;
    const templateData = {
      flash: res.flash(),
      visited,
      username,
    };
    res.cookie('visited', true);

    res.view('src/views/index', templateData);
  });
};
