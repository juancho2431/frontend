// src/pages/Compras.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Compras.css';

const Compras = () => {
  const [ingredientes, setIngredientes] = useState([]);
  const [bebidas, setBebidas] = useState([]);
  const [stockIngrediente, setStockIngrediente] = useState({ id: '', cantidad: 0 });
  const [stockBebida, setStockBebida] = useState({ id: '', cantidad: 0 });
  const apiUrl = process.env.REACT_APP_API_URL;
  useEffect(() => {
    // Cargar la lista de ingredientes y bebidas al montar el componente
    obtenerIngredientes();
    obtenerBebidas();
  }, []);

  const obtenerIngredientes = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/ingredientes`);
      setIngredientes(response.data);
    } catch (error) {
      console.error('Error al obtener ingredientes:', error);
    }
  };

  const obtenerBebidas = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/bebidas`);
      setBebidas(response.data);
    } catch (error) {
      console.error('Error al obtener bebidas:', error);
    }
  };

  const actualizarStockIngrediente = async () => {
    try {
      if (!stockIngrediente.id || !stockIngrediente.cantidad) {
        console.error('El ID del ingrediente o la cantidad no están definidos.');
        return;
      }

      // Obtener el ingrediente actual para sumar el stock
      const ingrediente = ingredientes.find(ing => ing.ingredient_id === parseInt(stockIngrediente.id, 10));
      if (!ingrediente) {
        console.error('Ingrediente no encontrado.');
        return;
      }

      const nuevoStock = ingrediente.stock_current + parseInt(stockIngrediente.cantidad, 10);

      // Realizar la solicitud PUT para actualizar el stock del ingrediente
      const response = await axios.put(`${apiUrl}/api/ingredientes/${stockIngrediente.id}`, {
        stock_current: nuevoStock
      });

      console.log('Stock actualizado:', response.data);
      obtenerIngredientes(); // Actualizar la lista de ingredientes
      setStockIngrediente({ id: '', cantidad: 0 }); // Reiniciar el formulario
    } catch (error) {
      console.error('Error al actualizar el stock del ingrediente:', error);
    }
  };

  const actualizarStockBebida = async () => {
    try {
      if (!stockBebida.id || !stockBebida.cantidad) {
        console.error('El ID de la bebida o la cantidad no están definidos.');
        return;
      }

      // Obtener la bebida actual para sumar el stock
      const bebida = bebidas.find(beb => beb.bebida_id === parseInt(stockBebida.id, 10));
      if (!bebida) {
        console.error('Bebida no encontrada.');
        return;
      }

      const nuevoStock = bebida.stock + parseFloat(stockBebida.cantidad);

      // Realizar la solicitud PUT para actualizar el stock de la bebida
      const response = await axios.put(`${apiUrl}/api/bebidas/${stockBebida.id}`, {
        stock: nuevoStock // Asegúrate de usar 'stock' aquí en lugar de 'stock_current'
      });

      console.log('Stock de la bebida actualizado:', response.data);
      obtenerBebidas(); // Actualizar la lista de bebidas
      setStockBebida({ id: '', cantidad: 0 }); // Reiniciar el formulario
    } catch (error) {
      console.error('Error al actualizar el stock de la bebida:', error);
    }
  };

  return (
    <div className="compras-container">
      <h2>Gestión de Compras</h2>

      <div className="seccion-compras">
        <h3>Actualizar Stock de Ingredientes</h3>
        <div className="formulario">
          <select
            value={stockIngrediente.id}
            onChange={(e) => setStockIngrediente({ ...stockIngrediente, id: e.target.value })}
          >
            <option value="">Selecciona un ingrediente</option>
            {ingredientes.map((ing) => (
              <option key={ing.ingredient_id} value={ing.ingredient_id}>
                {ing.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Cantidad a añadir"
            value={stockIngrediente.cantidad}
            onChange={(e) => setStockIngrediente({ ...stockIngrediente, cantidad: parseFloat(e.target.value) })}
          />
          <button onClick={actualizarStockIngrediente}>Actualizar Stock</button>
        </div>
      </div>

      <div className="seccion-compras">
        <h3>Actualizar Stock de Bebidas</h3>
        <div className="formulario">
          <select
            value={stockBebida.id}
            onChange={(e) => setStockBebida({ ...stockBebida, id: e.target.value })}
          >
            <option value="">Selecciona una bebida</option>
            {bebidas.map((beb) => (
              <option key={beb.bebida_id} value={beb.bebida_id}>
                {beb.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Cantidad a añadir"
            value={stockBebida.cantidad}
            onChange={(e) => setStockBebida({ ...stockBebida, cantidad: parseFloat(e.target.value) })}
          />
          <button onClick={actualizarStockBebida}>Actualizar Stock</button>
        </div>
      </div>
    </div>
  );
};

export default Compras;
