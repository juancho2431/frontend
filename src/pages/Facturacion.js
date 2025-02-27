import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/Facturacion.css';

const Facturacion = () => {
  // Estados generales
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]); // Productos con sus datos originales
  const [bebidas, setBebidas] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const [cliente, setCliente] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [empleados, setEmpleados] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');

  const apiUrl = process.env.REACT_APP_API_URL;

  // Estado para el modal de ingredientes
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  // Función para formatear el precio
  const formatPrice = (price) => price.toLocaleString('es-CO');

  // ----- FETCHS -----

  const fetchProductos = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/productos`);
      setProductos(response.data);
    } catch (error) {
      setError('Error al obtener los productos');
      console.error(error);
    }
  }, [apiUrl]);

  const fetchBebidas = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/bebidas`);
      setBebidas(response.data);
    } catch (error) {
      setError('Error al obtener las bebidas');
      console.error(error);
    }
  }, [apiUrl]);

  const fetchIngredientes = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/ingredientes`);
      setIngredientes(response.data);
    } catch (error) {
      setError('Error al obtener los ingredientes');
      console.error(error);
    }
  }, [apiUrl]);

  const fetchVentas = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/ventas`);
      setVentas(response.data);
    } catch (error) {
      setError('Error al obtener las ventas');
      console.error(error);
    }
  }, [apiUrl]);

  const fetchEmpleados = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/empleados/empleados`);
      setEmpleados(response.data);
    } catch (error) {
      setError('Error al obtener los empleados');
      console.error(error);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchProductos();
    fetchBebidas();
    fetchIngredientes();
    fetchVentas();
    fetchEmpleados();
  }, [fetchProductos, fetchBebidas, fetchIngredientes, fetchVentas, fetchEmpleados]);

  // ----- Modal de Ingredientes -----

  const handleOpenIngredientsModal = (producto) => {
    setCurrentProduct(producto);
  
    // Obtener los ingredientes específicos del producto
    const ingredientesProducto = producto.Ingredientes.map((ing) => ({
      ...ing,
      checked: true, // Lo marcamos por defecto como seleccionado
      amount: ing.ProductoIngrediente.amount || 1, // Usamos la cantidad del producto
    }));
  
    setSelectedIngredients(ingredientesProducto);
    setShowIngredientsModal(true);
  };
  
  const handleToggleIngredient = (ingredientId) => {
    setSelectedIngredients((prev) =>
      prev.map((ing) =>
        ing.ingredient_id === ingredientId ? { ...ing, checked: !ing.checked } : ing
      )
    );
  };

  const handleChangeAmount = (ingredientId, value) => {
    setSelectedIngredients((prev) =>
      prev.map((ing) =>
        ing.ingredient_id === ingredientId
          ? { ...ing, amount: parseFloat(value) || 1 } // Mantiene un valor válido
          : ing
      )
    );
  };
  
  const handleConfirmIngredients = () => {
    if (!currentProduct) return;
    const ingredientesSeleccionados = selectedIngredients
      .filter((ing) => ing.checked && ing.amount > 0)
      .map(({ ingredient_id, name, amount }) => ({ ingredient_id, name, amount }));
    // Se crea un objeto con la propiedad "id" unificada a partir de producto_id
    const productoConIngredientes = {
      ...currentProduct,
      type: "producto",
      // Dos columnas approach: 'producto_id' no se mezcla con 'bebida_id'
      producto_id: currentProduct.producto_id,
      bebida_id: null,
      ingredientesSeleccionados,
    };
    handleAddToCarrito(productoConIngredientes);
    setShowIngredientsModal(false);
  };

  // ----- Carrito -----

// En tu Facturacion.js (o donde manejes el carrito):
const handleAddToCarrito = (item) => {
  // Verifica si el item viene con algo como item.type === 'producto' o 'bebida'
  let newItem = { ...item };

  // Ajustar para el modelo de 2 columnas:
  if (newItem.type === 'producto') {
    // Aseguramos que producto_id tenga valor y bebida_id sea null
    newItem.producto_id = newItem.producto_id ?? newItem.id; 
    // O si tu item ya tiene .producto_id, úsalo
    newItem.bebida_id = null;
  } else if (newItem.type === 'bebida') {
    // Aseguramos que bebida_id tenga valor y producto_id sea null
    newItem.bebida_id = newItem.bebida_id ?? newItem.id; 
    newItem.producto_id = null;
  }

  setCarrito((prev) => [...prev, newItem]);
  setTotal((prev) => prev + newItem.price);
};


  const handleRemoveFromCarrito = (index) => {
    const itemToRemove = carrito[index];
    setCarrito(carrito.filter((_, i) => i !== index));
    setTotal((prev) => prev - itemToRemove.price);
  };

  // ----- Confirmar Venta -----

  const handleConfirmSale = async () => {
    if (carrito.length === 0) {
      setError('El carrito está vacío');
      return;
    }
    if (!cliente || !empleadoSeleccionado) {
      setError('Por favor, complete todos los campos');
      return;
    }
    // Se construye la data de la venta usando la propiedad "id" unificada
    const ventaData = {
      cliente,
      metodo_pago: metodoPago,
      vendedor_id: empleadoSeleccionado,
      fecha: new Date().toISOString(),
      total,
      detalles: carrito.map((item) => {
        // Si item.type = 'producto', 'producto_id' no es null, 'bebida_id' es null
        // Si item.type = 'bebida', 'bebida_id' no es null, 'producto_id' es null
        return {
          tipo_producto: item.type, // 'producto' o 'bebida'
          producto_id: item.type === "producto" ? item.producto_id : null,
          bebida_id: item.type === "bebida" ? item.bebida_id : null,
          cantidad: 1,
          precio: item.price,
          // Si es producto, enviamos los ingredientes (opcional)
          ingredientes: item.type === "producto" ? item.ingredientesSeleccionados || [] : [],
        };
      }),
    };

    try {
      console.log('Datos de la venta:', JSON.stringify(ventaData, null, 2));
      await axios.post(`${apiUrl}/api/ventas`, ventaData);
      // Reiniciamos el carrito y refrescamos datos
      setCarrito([]);
      setTotal(0);
      setCliente('');
      setMetodoPago('Efectivo');
      setEmpleadoSeleccionado('');
      fetchVentas();
      fetchIngredientes();
    } catch (err) {
      setError('Error al realizar la venta');
      console.error(err);
    }
  };

  return (
    <div className="facturacion-container">
      <h1>Facturación</h1>
      {error && <p className="error">{error}</p>}

      {/* Listado de Productos y Bebidas */}
      <div className="productos-bebidas">
        <div className="productos-list">
          <h2>Productos</h2>
          {productos.map((producto) => (
            <div key={producto.producto_id} className="item">
              <span>
                {producto.name} - ${formatPrice(producto.price)}
              </span>
              <button onClick={() => handleOpenIngredientsModal(producto)}>
                Seleccionar Ingredientes
              </button>
            </div>
          ))}
        </div>

        <div className="bebidas-list">
          <h2>Bebidas</h2>
          {bebidas.map((bebida) => (
            <div key={bebida.bebida_id} className="item">
              <span>
                {bebida.name} - ${formatPrice(bebida.price)}
              </span>
              <button
                onClick={() =>
                  handleAddToCarrito({ ...bebida, type: 'bebida', id: bebida.bebida_id })
                }
              >
                Agregar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Carrito */}
      <div className="carrito">
        <h2>Carrito de Compra</h2>
        {carrito.length === 0 ? (
          <p>No hay productos seleccionados</p>
        ) : (
          <ul>
            {carrito.map((item, index) => (
              <li key={index}>
                <strong>{item.name}</strong> - ${formatPrice(item.price)}
                {item.type === 'producto' &&
                  item.ingredientesSeleccionados &&
                  item.ingredientesSeleccionados.length > 0 && (
                    <ul>
                      {item.ingredientesSeleccionados.map((ing, i) => (
                        <li key={i}>
                          {ing.name} x {ing.amount}
                        </li>
                      ))}
                    </ul>
                  )}
                <button onClick={() => handleRemoveFromCarrito(index)}>Eliminar</button>
              </li>
            ))}
          </ul>
        )}
        <p>Total: ${formatPrice(total)}</p>

        {/* Datos de la Venta */}
        <div className="venta-datos">
          <label>Cliente:</label>
          <input
            type="text"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            placeholder="Nombre del cliente"
          />
          <label>Método de Pago:</label>
          <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
            <option value="Efectivo">Efectivo</option>
            <option value="Nequi">Nequi</option>
            <option value="Daviplata">Daviplata</option>
            <option value="Transferencia">Transferencia</option>
          </select>
          <label>Empleado (Vendedor):</label>
          <select value={empleadoSeleccionado} onChange={(e) => setEmpleadoSeleccionado(e.target.value)}>
            <option value="">Seleccione un empleado</option>
            {empleados.map((empleado) => (
              <option key={empleado.empleado_id} value={empleado.empleado_id}>
                {empleado.nombre} {empleado.apellido}
              </option>
            ))}
          </select>
        </div>

        <button onClick={handleConfirmSale} disabled={carrito.length === 0}>
          Confirmar Venta
        </button>
      </div>

      {/* Historial de Ventas */}
      <div className="ventas">
        <h2>Historial de Ventas</h2>
        <table>
          <thead>
            <tr>
              <th>ID Venta</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((venta) => (
              <tr key={venta.ventas_id}>
                <td>{venta.ventas_id}</td>
                <td>{new Date(venta.fecha).toLocaleString()}</td>
                <td>${formatPrice(venta.total)}</td>
                <td>
                  <Link to={`/facturacion/imprimir/${venta.ventas_id}`} className="btn">
                    Imprimir Factura
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para seleccionar ingredientes */}
      {showIngredientsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Seleccionar Ingredientes</h2>
            <p>Producto: {currentProduct?.name}</p>
            <div className="ingredientes-list">
  {selectedIngredients.map((ing) => (
    <div key={ing.ingredient_id} className="ingrediente-item">
      <label>
        <input
          type="checkbox"
          checked={ing.checked}
          onChange={() => handleToggleIngredient(ing.ingredient_id)}
        />
        {ing.name}
      </label>
      <input
        type="number"
        min="1"
        step="1"
        value={ing.amount} // Se usa el valor de ProductoIngrediente.amount
        onChange={(e) => handleChangeAmount(ing.ingredient_id, e.target.value)}
        placeholder="Cantidad"
      />
    </div>
  ))}
</div>

            <div className="modal-actions">
              <button onClick={handleConfirmIngredients}>Confirmar</button>
              <button onClick={() => setShowIngredientsModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Facturacion;
