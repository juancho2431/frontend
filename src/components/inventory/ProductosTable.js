import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ProductosTable({ isReadOnly }) {
  const [productos, setProductos] = useState([]);
  const [newProducto, setNewProducto] = useState({
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
    fetchProductos();
    fetchIngredientes();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/productos`);
      setProductos(response.data);
    } catch (error) {
      console.error('Error al obtener los productos:', error);
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

  const handleAddProducto = async () => {
    try {
      if (newProducto.ingredientes.length === 0) {
        alert('Debe agregar al menos un ingrediente con una cantidad válida.');
        return;
      }

      // Validar que todos los ingredientes tengan una cantidad mayor a 0
      for (const ing of newProducto.ingredientes) {
        if (isNaN(ing.amount) || ing.amount <= 0) {
          alert('Debe ingresar un ID de ingrediente válido y una cantidad mayor a cero.');
          return;
        }
      }

      // Asegurarse de que el precio sea un número y los ingredientes estén bien formados
      const productoToSend = {
        name: newProducto.name,
        price: parseFloat(newProducto.price),
        ingredientes: newProducto.ingredientes.map((ing) => ({
          id: parseInt(ing.ingredient_id),
          amount: parseFloat(ing.amount)
        }))
      };

      console.log('Datos del producto a enviar:', JSON.stringify(productoToSend, null, 2));
      await axios.post(`${apiUrl}/api/productos`, productoToSend);
      fetchProductos();
      setNewProducto({ name: '', price: 0, ingredientes: [] });
    } catch (error) {
      console.error('Error al agregar el producto:', error);
      if (error.response) {
        console.error('Detalles del error:', error.response.data);
      }
    }
  };

  const handleEditProducto = async (id) => {
    try {
      const updatedProducto = productos.find((prod) => prod.producto_id === id);
      await axios.put(`${apiUrl}/api/productos/${id}`, updatedProducto);
      fetchProductos();
    } catch (error) {
      console.error('Error al editar el producto:', error);
    }
  };

  const handleDeleteProducto = async (id) => {
    try {
      await axios.delete(`${apiUrl}/api/productos/${id}`);
      fetchProductos();
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
    }
  };

  const handleAddIngredient = () => {
    console.log('Ingrediente seleccionado:', ingredienteSeleccionado);
    const ingredientId = parseInt(ingredienteSeleccionado.ingredient_id);
    const amount = parseFloat(ingredienteSeleccionado.amount);

    if (isNaN(ingredientId) || isNaN(amount) || amount <= 0) {
      alert('Debe ingresar un ID de ingrediente válido y una cantidad mayor a cero.');
      return;
    }

    const ingrediente = ingredientesDisponibles.find((ing) => ing.ingredient_id === ingredientId);
    if (!ingrediente) {
      alert('El ID del ingrediente ingresado no es válido.');
      return;
    }

    setNewProducto((prev) => ({
      ...prev,
      ingredientes: [...prev.ingredientes, { ingredient_id: ingredientId, amount }]
    }));
    setIngredienteSeleccionado({ ingredient_id: '', amount: '' });
  };

  return (
    <div>
      <h2>Productos</h2>
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
          {productos.map((producto) => (
            <tr key={producto.producto_id}>
              <td>{producto.producto_id}</td>
              <td>
                {isReadOnly ? (
                  producto.name
                ) : (
                  <input
                    type="text"
                    value={producto.name}
                    onChange={(e) =>
                      setProductos((prev) =>
                        prev.map((p) =>
                          p.producto_id === producto.producto_id ? { ...p, name: e.target.value } : p
                        )
                      )
                    }
                  />
                )}
              </td>
              <td>
                {isReadOnly ? (
                  producto.price
                ) : (
                  <input
                    type="number"
                    step="0.1"
                    value={producto.price}
                    onChange={(e) =>
                      setProductos((prev) =>
                        prev.map((p) =>
                          p.producto_id === producto.producto_id ? { ...p, price: parseFloat(e.target.value) } : p
                        )
                      )
                    }
                  />
                )}
              </td>
              <td>
                {producto.Ingredientes && producto.Ingredientes.map((ingrediente) => (
                  <span key={ingrediente.ingredient_id}>
                    {ingrediente.name} {ingrediente.amount}
                  </span>
                ))}
              </td>
              {!isReadOnly && (
                <td>
                  <button onClick={() => handleEditProducto(producto.producto_id)}>Editar</button>
                  <button onClick={() => handleDeleteProducto(producto.producto_id)}>Eliminar</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {!isReadOnly && (
        <div>
          <h3>Agregar Producto</h3>
          <input
            type="text"
            placeholder="Nombre"
            value={newProducto.name}
            onChange={(e) => setNewProducto({ ...newProducto, name: e.target.value })}
          />
          <input
            type="number"
            step="0.1"
            placeholder="Precio"
            value={newProducto.price}
            onChange={(e) => setNewProducto({ ...newProducto, price: parseFloat(e.target.value) })}
          />
          <h4>Agregar Ingrediente</h4>
          <select
            value={ingredienteSeleccionado.ingredient_id}
            onChange={(e) =>
              setIngredienteSeleccionado({ ...ingredienteSeleccionado, ingredient_id: e.target.value })
            }
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
            step="0.1"
            placeholder="Cantidad"
            value={ingredienteSeleccionado.amount}
            onChange={(e) =>
              setIngredienteSeleccionado({ ...ingredienteSeleccionado, amount: parseFloat(e.target.value) })
            }
          />
          <button onClick={handleAddIngredient}>Agregar Ingrediente</button>

          <button onClick={handleAddProducto}>Agregar Producto</button>
        </div>
      )}
    </div>
  );
}

export default ProductosTable;
