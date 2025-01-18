import React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';

function IngredientesTable({ isReadOnly }) {
  const [ingredientes, setIngredientes] = useState([]);
  const [newIngrediente, setNewIngrediente] = useState({
    name: '',
    stock_current: 0,
    stock_minimum: 0
  });

  useEffect(() => {
    fetchIngredientes();
  }, []);
  const apiUrl = process.env.REACT_APP_API_URL;
  const fetchIngredientes = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/ingredientes`);
      setIngredientes(response.data);
    } catch (error) {
      console.error('Error al obtener los ingredientes:', error);
    }
  };

  const handleAddIngrediente = async () => {
    try {
      const ingredienteData = {
        ingredientes: [newIngrediente] // Enviar como lista de un solo elemento
      };
      await axios.post(`${apiUrl}/api/ingredientes`, ingredienteData);
      fetchIngredientes();
      setNewIngrediente({ name: '', stock_current: 0, stock_minimum: 0 });
    } catch (error) {
      if (error.response) {
        console.error('Error al agregar el ingrediente:', error.response.data);
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor:', error.request);
      } else {
        console.error('Error al configurar la solicitud:', error.message);
      }
    }
  };

  const handleEditIngrediente = async (id) => {
    try {
      const updatedIngrediente = ingredientes.find((ingrediente) => ingrediente.ingredient_id === id);
      await axios.put(`${apiUrl}/api/ingredientes/${id}`, updatedIngrediente);
      fetchIngredientes();
    } catch (error) {
      console.error('Error al editar el ingrediente:', error);
    }
  };

  const handleDeleteIngrediente = async (id) => {
    try {
      await axios.delete(`${apiUrl}/api/ingredientes/${id}`);
      fetchIngredientes();
    } catch (error) {
      console.error('Error al eliminar el ingrediente:', error);
    }
  };

  return (
    <div>
      <h2>Ingredientes</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Stock Actual</th>
            <th>Stock Mínimo</th>
            {!isReadOnly && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {ingredientes.map((ingrediente) => (
            <tr key={ingrediente.ingredient_id}>
              <td>{ingrediente.ingredient_id}</td>
              <td>
                {isReadOnly ? (
                  ingrediente.name
                ) : (
                  <input
                    type="text"
                    value={ingrediente.name}
                    onChange={(e) =>
                      setIngredientes((prev) =>
                        prev.map((i) =>
                          i.ingredient_id === ingrediente.ingredient_id ? { ...i, name: e.target.value } : i
                        )
                      )
                    }
                  />
                )}
              </td>
              <td>
                {isReadOnly ? (
                  ingrediente.stock_current
                ) : (
                  <input
                    type="number"
                    value={ingrediente.stock_current}
                    onChange={(e) =>
                      setIngredientes((prev) =>
                        prev.map((i) =>
                          i.ingredient_id === ingrediente.ingredient_id ? { ...i, stock_current: e.target.value } : i
                        )
                      )
                    }
                  />
                )}
              </td>
              <td>
                {isReadOnly ? (
                  ingrediente.stock_minimum
                ) : (
                  <input
                    type="number"
                    value={ingrediente.stock_minimum}
                    onChange={(e) =>
                      setIngredientes((prev) =>
                        prev.map((i) =>
                          i.ingredient_id === ingrediente.ingredient_id ? { ...i, stock_minimum: e.target.value } : i
                        )
                      )
                    }
                  />
                )}
              </td>
              {!isReadOnly && (
                <td>
                  <button onClick={() => handleEditIngrediente(ingrediente.ingredient_id)}>Editar</button>
                  <button onClick={() => handleDeleteIngrediente(ingrediente.ingredient_id)}>Eliminar</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {!isReadOnly && (
        <div>
          <h3>Agregar Ingrediente</h3>
          <input
            type="text"
            placeholder="Nombre"
            value={newIngrediente.name}
            onChange={(e) => setNewIngrediente({ ...newIngrediente, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Stock Actual"
            value={newIngrediente.stock_current}
            onChange={(e) => setNewIngrediente({ ...newIngrediente, stock_current: e.target.value })}
          />
          <input
            type="number"
            placeholder="Stock Mínimo"
            value={newIngrediente.stock_minimum}
            onChange={(e) => setNewIngrediente({ ...newIngrediente, stock_minimum: e.target.value })}
          />
          <button onClick={handleAddIngrediente}>Agregar</button>
        </div>
      )}
    </div>
  );
}

export default IngredientesTable;
