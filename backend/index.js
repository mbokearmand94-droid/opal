const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'opal-backend' });
});

app.get('/', (req, res) => {
  res.send('Opal backend — prototype');
});

app.listen(port, () => {
  console.log(`Opal backend listening on port ${port}`);
});
