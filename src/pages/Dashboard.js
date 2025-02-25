import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const apiUrl = "http://localhost:3000/api"; // Ajusta esto si tu backend está en otro lugar

  // Estado para el reporte de ventas
  const [salesData, setSalesData] = useState([]);
  const [error, setError] = useState(null);

  // Estado para alertas de inventario
  const [lowStockIngredients, setLowStockIngredients] = useState([]);
  const [lowStockBebidas, setLowStockBebidas] = useState([]);

  // 1️⃣ Función para obtener las ventas del día
  const fetchSalesReport = async () => {
    try {
      const response = await axios.get(`${apiUrl}/dashboard/ventas/hoy`);
      console.log("📊 Ventas del día recibidas:", response.data);

      // Verificamos si la respuesta es válida
      if (!response.data || response.data.length === 0) {
        console.warn("⚠️ No hay ventas registradas hoy.");
      }

      // Guardamos los datos en el estado
      setSalesData(response.data);
    } catch (err) {
      setError("Error al obtener las ventas del día");
      console.error(err);
    }
  };

  // 2️⃣ Función para obtener ingredientes con bajo stock
  const fetchLowStockIngredients = async () => {
    try {
      const response = await axios.get(`${apiUrl}/ingredientes`);
      const lowStock = response.data.filter(
        (ing) => parseFloat(ing.stock_current) < parseFloat(ing.stock_minimum)
      );
      setLowStockIngredients(lowStock);
    } catch (err) {
      setError("Error al obtener los ingredientes");
      console.error(err);
    }
  };

  // 3️⃣ Función para obtener bebidas con bajo stock
  const fetchLowStockBebidas = async () => {
    try {
      const response = await axios.get(`${apiUrl}/bebidas`);
      const threshold = 5; // Umbral para bajo stock
      const lowStock = response.data.filter(
        (bebida) => parseFloat(bebida.stock) < threshold
      );
      setLowStockBebidas(lowStock);
    } catch (err) {
      setError("Error al obtener las bebidas");
      console.error(err);
    }
  };

  // 🔄 useEffect para cargar datos al montar el componente
  useEffect(() => {
    fetchSalesReport();
    fetchLowStockIngredients();
    fetchLowStockBebidas();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 Dashboard (Ventas del Día)</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Gráfica de Serie de Tiempo */}
      <section>
        <h2>📈 Ventas del Día por Hora</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hora_exacta" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total_ventas" stroke="#8884d8" name="Total Ventas" />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Alertas de Inventario */}
      <section style={{ marginTop: "40px" }}>
        <h2>⚠️ Alertas de Inventario</h2>

        <div>
          <h3>🛒 Ingredientes con bajo stock</h3>
          {lowStockIngredients.length === 0 ? (
            <p>No hay alertas de inventario en ingredientes.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Stock Actual</th>
                  <th>Stock Mínimo</th>
                </tr>
              </thead>
              <tbody>
                {lowStockIngredients.map((ing) => (
                  <tr key={ing.ingredient_id}>
                    <td>{ing.name}</td>
                    <td>{ing.stock_current}</td>
                    <td>{ing.stock_minimum}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ marginTop: "20px" }}>
          <h3>🍹 Bebidas con bajo stock</h3>
          {lowStockBebidas.length === 0 ? (
            <p>No hay alertas de inventario en bebidas.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStockBebidas.map((bebida) => (
                  <tr key={bebida.bebida_id}>
                    <td>{bebida.name}</td>
                    <td>{bebida.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
