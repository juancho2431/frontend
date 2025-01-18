import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ArepasTable({ isReadOnly }) {
  const [arepas, setArepas] = useState([]);
  const [newArepa, setNewArepa] = useState({
    name: '',
    price: 0,
    ingredientes: []
  });
  const [ingredientesDisponibles, setIngredientesDisponibles] = useState([]);
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState({
    ingredient_id: '',
    amount: ''
  });
  const apiUrl = process.env.REACT_APP_API_URL;
  useEffect(() => {
    fetchArepas();
    fetchIngredientes();
  }, []);

  const fetchArepas = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/arepas`);
      setArepas(response.data);
    } catch (error) {
      console.error('Error al obtener las arepas:', error);
    }
  };

  const fetchIngredientes = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/ingredientes`);
      setIngredientesDisponibles(response.data);
    } catch (error) {
      console.error('Error al obtener los ingredientes:', error);
    }
  };

  const handleAddArepa = async () => {
    try {
      if (newArepa.ingredientes.length === 0) {
        alert('Debe agregar al menos un ingrediente con una cantidad válida.');
        return;
      }

      // Validar que todos los ingredientes tengan una cantidad mayor a 0
      for (const ing of newArepa.ingredientes) {
        if (isNaN(ing.amount) || ing.amount <= 0) {
          alert('Debe ingresar un ID de ingrediente válido y una cantidad mayor a cero.');
          return;
        }
      }

      // Asegurarse de que el precio sea un número y los ingredientes estén bien formados
      const arepaToSend = {
        name: newArepa.name,
        price: parseFloat(newArepa.price),
        ingredientes: newArepa.ingredientes.map((ing) => ({
          id: parseInt(ing.ingredient_id),
          amount: parseFloat(ing.amount) // Convertir a número decimal
        }))
      };
      console.log('Datos de la arepa a enviar:', JSON.stringify(arepaToSend, null, 2));
      await axios.post(`${apiUrl}/api/arepas`, arepaToSend);
      fetchArepas();
      setNewArepa({ name: '', price: 0, ingredientes: [] });
    } catch (error) {
      console.error('Error al agregar la arepa:', error);
      if (error.response) {
        console.error('Detalles del error:', error.response.data);
      }
    }
  };

  const handleEditArepa = async (id) => {
    try {
      const updatedArepa = arepas.find((arepa) => arepa.arepa_id === id);
      await axios.put(`${apiUrl}/api/arepas/${id}`, updatedArepa);
      fetchArepas();
    } catch (error) {
      console.error('Error al editar la arepa:', error);
    }
  };

  const handleDeleteArepa = async (id) => {
    try {
      await axios.delete(`${apiUrl}/api/arepas/${id}`);
      fetchArepas();
    } catch (error) {
      console.error('Error al eliminar la arepa:', error);
    }
  };

  const handleAddIngredient = () => {
    console.log('Ingrediente seleccionado:', ingredienteSeleccionado);
    const ingredientId = parseInt(ingredienteSeleccionado.ingredient_id);
    const amount = parseFloat(ingredienteSeleccionado.amount); // Permitir valores decimales

    if (isNaN(ingredientId) || isNaN(amount) || amount <= 0) {
      alert('Debe ingresar un ID de ingrediente válido y una cantidad mayor a cero.');
      return;
    }

    const ingrediente = ingredientesDisponibles.find((ing) => ing.ingredient_id === ingredientId);
    if (!ingrediente) {
      alert('El ID del ingrediente ingresado no es válido.');
      return;
    }

    setNewArepa((prev) => ({
      ...prev,
      ingredientes: [...prev.ingredientes, { ingredient_id: ingredientId, amount }]
    }));
    setIngredienteSeleccionado({ ingredient_id: '', amount: '' });
  };

  return (
    <div>
      <h2>Arepas</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Ingredientes</th>
            {!isReadOnly && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {arepas.map((arepa) => (
            <tr key={arepa.arepa_id}>
              <td>{arepa.arepa_id}</td>
              <td>
                {isReadOnly ? (
                  arepa.name
                ) : (
                  <input
                    type="text"
                    value={arepa.name}
                    onChange={(e) =>
                      setArepas((prev) =>
                        prev.map((a) =>
                          a.arepa_id === arepa.arepa_id ? { ...a, name: e.target.value } : a
                        )
                      )
                    }
                  />
                )}
              </td>
              <td>
                {isReadOnly ? (
                  arepa.price
                ) : (
                  <input
                    type="number"
                    step="0.1" // Permitir decimales
                    value={arepa.price}
                    onChange={(e) =>
                      setArepas((prev) =>
                        prev.map((a) =>
                          a.arepa_id === arepa.arepa_id ? { ...a, price: parseFloat(e.target.value) } : a
                        )
                      )
                    }
                  />
                )}
              </td>
              <td>
                {arepa.Ingredientes && arepa.Ingredientes.map((ingrediente) => (
                  <span key={ingrediente.ingredient_id}>
                    {ingrediente.name} {ingrediente.amount}
                  </span>
                ))}
              </td>
              {!isReadOnly && (
                <td>
                  <button onClick={() => handleEditArepa(arepa.arepa_id)}>Editar</button>
                  <button onClick={() => handleDeleteArepa(arepa.arepa_id)}>Eliminar</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {!isReadOnly && (
        <div>
          <h3>Agregar Arepa</h3>
          <input
            type="text"
            placeholder="Nombre"
            value={newArepa.name}
            onChange={(e) => setNewArepa({ ...newArepa, name: e.target.value })}
          />
          <input
            type="number"
            step="0.1" // Permitir decimales
            placeholder="Precio"
            value={newArepa.price}
            onChange={(e) => setNewArepa({ ...newArepa, price: parseFloat(e.target.value) })}
          />
          <h4>Agregar Ingrediente</h4>
          <select
            value={ingredienteSeleccionado.ingredient_id}
            onChange={(e) => setIngredienteSeleccionado({ ...ingredienteSeleccionado, ingredient_id: e.target.value })}
          >
            <option value="">Seleccione un ingrediente</option>
            {ingredientesDisponibles.map((ing) => (
              <option key={ing.ingredient_id} value={ing.ingredient_id}>
                {ing.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.1" // Permitir decimales
            placeholder="Cantidad"
            value={ingredienteSeleccionado.amount}
            onChange={(e) => setIngredienteSeleccionado({ ...ingredienteSeleccionado, amount: parseFloat(e.target.value) })}
          />
          <button onClick={handleAddIngredient}>Agregar Ingrediente</button>

          <button onClick={handleAddArepa}>Agregar Arepa</button>
        </div>
      )}
    </div>
  );
}

export default ArepasTable;