import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/Facturacion.css';

const Facturacion = () => {
  const [ventas, setVentas] = useState([]);
  const [arepas, setArepas] = useState([]);
  const [bebidas, setBebidas] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const [cliente, setCliente] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [empleados, setEmpleados] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchArepas();
    fetchBebidas();
    fetchVentas();
    fetchEmpleados(); // Obtener la lista de empleados al cargar el componente
  }, []);

  const formatPrice = (price) => {
    return price.toLocaleString('es-CO'); // Usando la configuración regional de Colombia
  };

  const fetchArepas = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/arepas`);
      setArepas(response.data);
    } catch (err) {
      setError('Error al obtener las arepas');
    }
  };

  const fetchBebidas = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/bebidas`);
      setBebidas(response.data);
    } catch (err) {
      setError('Error al obtener las bebidas');
    }
  };

  const fetchVentas = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/ventas`);
      setVentas(response.data);
    } catch (err) {
      setError('Error al obtener las ventas');
    }
  };

  const fetchEmpleados = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/empleados`);
      setEmpleados(response.data);
    } catch (err) {
      setError('Error al obtener los empleados');
    }
  };

  const handleAddToCarrito = (item) => {
    setCarrito([...carrito, item]);
    setTotal(total + item.price);
  };

  const handleRemoveFromCarrito = (index) => {
    const itemToRemove = carrito[index];
    setCarrito(carrito.filter((_, i) => i !== index));
    setTotal(total - itemToRemove.price);
  };

  const handleConfirmSale = async () => {
    if (carrito.length === 0) {
      setError('El carrito está vacío');
      return;
    }
    if (!cliente || !empleadoSeleccionado) {
      setError('Por favor, complete todos los campos');
      return;
    }

    const ventaData = {
      cliente: cliente,
      metodo_pago: metodoPago,
      vendedor_id: empleadoSeleccionado,
      fecha: new Date().toISOString(),
      total: total,
      detalles: carrito.map((item) => ({
        tipo_producto: item.type,
        producto_id: item.arepa_id || item.bebida_id,
        cantidad: 1,
        precio: item.price,
      })),
    };

    try {
      console.log('Datos de la venta:', ventaData);
      await axios.post(`${apiUrl}/api/ventas`, ventaData);
      setCarrito([]);
      setTotal(0);
      setCliente('');
      setMetodoPago('Efectivo');
      setEmpleadoSeleccionado('');
      fetchVentas(); // Actualizar lista de ventas después de confirmar la venta
    } catch (err) {
      setError('Error al realizar la venta');
    }
  };

  return (
    <div>
      <h1>Facturación</h1>
      {error && <p className="error">{error}</p>}

      <div className="productos">
        <div className="arepas">
          <h2>Arepas</h2>
          {arepas.map((arepa) => (
            <div key={arepa.arepa_id}>
              <span>{arepa.name} - ${formatPrice(arepa.price)}</span>
              <button onClick={() => handleAddToCarrito({ ...arepa, type: 'arepa' })}>Agregar</button>
            </div>
          ))}
        </div>

        <div className="bebidas">
          <h2>Bebidas</h2>
          {bebidas.map((bebida) => (
            <div key={bebida.bebida_id}>
              <span>{bebida.name} - ${formatPrice(bebida.price)}</span>
              <button onClick={() => handleAddToCarrito({ ...bebida, type: 'bebida' })}>Agregar</button>
            </div>
          ))}
        </div>
      </div>

      <div className="carrito">
        <h2>Carrito de Compra</h2>
        {carrito.length === 0 ? (
          <p>No hay productos seleccionados</p>
        ) : (
          <ul>
            {carrito.map((item, index) => (
              <li key={index}>
                {item.name} - ${formatPrice(item.price)}
                <button onClick={() => handleRemoveFromCarrito(index)}>Eliminar</button>
              </li>
            ))}
          </ul>
        )}
        <p>Total: ${formatPrice(total)}</p>

        <div>
          <label>Cliente:</label>
          <input
            type="text"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            placeholder="Nombre del cliente"
          />
        </div>

        <div>
          <label>Método de Pago:</label>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>

        <div>
          <label>Empleado (Vendedor):</label>
          <select
            value={empleadoSeleccionado}
            onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
          >
            <option value="">Seleccione un empleado</option>
            {empleados.map((empleado) => (
              <option key={empleado.empleado_id} value={empleado.empleado_id}>
                {empleado.nombre} {empleado.apellido}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleConfirmSale}
          disabled={carrito.length === 0}
        >
          Confirmar Venta
        </button>
      </div>

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
                <td> <Link to={`/facturacion/imprimir/${venta.ventas_id}`} className="btn">Imprimir Factura</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Facturacion;
