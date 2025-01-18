import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HistorialVentas.css';

const HistorialVentas = () => {
  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const response = await axios.get('/api/ventas/historial');
        setVentas(response.data);
      } catch (error) {
        console.error('Error al obtener el historial de ventas:', error);
      }
    };

    fetchVentas();
  }, []);

  return (
    <div className="historial-ventas-container">
      <h2>Historial de Ventas</h2>
      <table className="ventas-table">
        <thead>
          <tr>
            <th>ID Venta</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Detalles</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((venta) => (
            <tr key={venta.venta_id}>
              <td>{venta.venta_id}</td>
              <td>{new Date(venta.fecha).toLocaleString()}</td>
              <td>${venta.total}</td>
              <td>
                {venta.VentaDetalles.map((detalle, index) => (
                  <div key={index}>
                    {detalle.tipo_producto}: {detalle.cantidad} x ${detalle.precio}
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistorialVentas;
