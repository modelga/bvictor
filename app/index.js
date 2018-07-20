const config = require('../config');
const app = require('./app');

const port = config.get('PORT');

app.listen(port, () => {
  console.log(`Listening now on port ${port}`);
});
