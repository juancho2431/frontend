import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "../styles/Reportes.css";

const Reportes = () => {
  const apiUrl = process.env.REACT_APP_API_URL;

  // 📊 Estado para la gráfica de los productos más vendidos
  const [bestSelling, setBestSelling] = useState([]);
  const [typeFilter, setTypeFilter] = useState("producto");
  const [periodBestSelling, setPeriodBestSelling] = useState("dia");

  // 💰 Estado para la gráfica de ventas por método de pago
  const [totalSales, setTotalSales] = useState([]);
  const [periodTotalSales, setPeriodTotalSales] = useState("dia");

  // 🎨 Colores para la gráfica de torta
  const COLORS = ["#4CAF50", "#FFBB28", "#FF8042", "#0088FE"];

  // 📊 Obtener los productos o bebidas más vendidos
  const fetchBestSelling = useCallback(async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/reportes/best-selling?type=${typeFilter}&period=${periodBestSelling}`
      );
      setBestSelling(response.data);
    } catch (error) {
      console.error("Error al obtener los productos más vendidos:", error);
    }
  }, [apiUrl, typeFilter, periodBestSelling]);

  // 💰 Obtener el total de ventas por método de pago
  const fetchTotalSales = useCallback(async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/reportes/total-sales?period=${periodTotalSales}`
      );
      const formattedData = Object.keys(response.data).map((key) => ({
        metodo: key,
        total_ventas: response.data[key],
      }));
      setTotalSales(formattedData);
    } catch (error) {
      console.error("Error al obtener el total de ventas:", error);
    }
  }, [apiUrl, periodTotalSales]);

  useEffect(() => {
    fetchBestSelling();
  }, [fetchBestSelling]);

  useEffect(() => {
    fetchTotalSales();
  }, [fetchTotalSales]);

  return (
    <div className="reportes-container">
      {/* 📊 Sección: Productos más vendidos */}
      <div className="report-section">
        <h2>📊 Productos Más Vendidos</h2>
        <div className="filters">
          <label>Tipo:</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="producto">Producto</option>
            <option value="bebida">Bebida</option>
          </select>

          <label>Período:</label>
          <select value={periodBestSelling} onChange={(e) => setPeriodBestSelling(e.target.value)}>
            <option value="dia">Día</option>
            <option value="semana">Semana</option>
            <option value="mes">Mes</option>
            <option value="anio">Año</option>
          </select>

          <button onClick={fetchBestSelling}>Filtrar</button>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={bestSelling}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="cantidad_vendida" fill="#4CAF50" name="Cantidad Vendida" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 💰 Sección: Total de Ventas por Método de Pago */}
      <div className="report-section">
        <h2>💰 Total de Ventas por Método de Pago</h2>
        <div className="filters">
          <label>Período:</label>
          <select value={periodTotalSales} onChange={(e) => setPeriodTotalSales(e.target.value)}>
            <option value="dia">Día</option>
            <option value="semana">Semana</option>
            <option value="mes">Mes</option>
            <option value="anio">Año</option>
          </select>

          <button onClick={fetchTotalSales}>Filtrar</button>
        </div>

        {totalSales.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={totalSales}
                dataKey="total_ventas"
                nameKey="metodo"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label
              >
                {totalSales.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p>No hay datos disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default Reportes;
