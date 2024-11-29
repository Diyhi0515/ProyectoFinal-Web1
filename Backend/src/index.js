require('dotenv').config();

const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors()); 




const port = process.env.PORT || 3001;

app.use(express.json());

const usuarioRouter = require('./routes/usuarioRouter');
const categoriaRouter = require('./routes/categoriaRouter');
const productoRouter = require('./routes/productoRouter');
const carritoRouter = require('./routes/carritoRouter');
const pedidoRouter = require('./routes/pedidoRouter');
const imagenRouter = require('./routes/imagenRouter');
const adminRouter = require('./routes/adminRouter');
const subcategoriaRouter = require('./routes/subcategoriaRouter');
const banerRouter = require('./routes/banerRouter');
const rolesRouter = require('./routes/rolesRouter');

app.use('/api/usuario', usuarioRouter);
app.use('/api/categoria', categoriaRouter);
app.use('/api/producto', productoRouter);
app.use('/api/carrito', carritoRouter);
app.use('/api/pedido', pedidoRouter);
app.use('/api/imagen', imagenRouter);
app.use('/api/admin', adminRouter);
app.use('/api/subcategoria', subcategoriaRouter);
app.use('/api/baner', banerRouter);
app.use('/api/roles', rolesRouter);




app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});