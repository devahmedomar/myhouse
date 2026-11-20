import app from './app.js';

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Household Expense Tracker API listening on port ${port}`);
});
