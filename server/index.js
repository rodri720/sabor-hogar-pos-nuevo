import app from './src/app.js';
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Dev server corriendo en http://localhost:${PORT}`);
});