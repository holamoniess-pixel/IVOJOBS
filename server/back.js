const express = require('express');
const app = express();
const port = 3000;

// AI agent code
const aiAgent = require('./aiAgent');
app.use('/ai', aiAgent);

// Customer support system code
const customerSupport = require('./customerSupport');
app.use('/support', customerSupport);

// Routes for the frontend
app.use(express.static('path/to/frontend'));

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
