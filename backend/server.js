const express = require('express');

const app = express();

const PORT = 5173;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});