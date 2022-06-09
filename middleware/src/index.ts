import { app } from './app';
import { Org } from './operations/buildOrg';

const start = async () => {
  await Org.init();
};

app.listen(3000, "0.0.0.0",() => {
  console.log('Listening on port 3000!');
});

start();
