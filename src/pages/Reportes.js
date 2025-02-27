import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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

  // Estado para la gráfica de productos/bebidas más vendidos
  const [bestSelling, setBestSelling] = useState([]);
  const [typeFilter, setTypeFilter] = useState("producto");
  const [periodBestSelling, setPeriodBestSelling] = useState("dia");

  // Estado para la gráfica de ventas por método de pago
  const [totalSales, setTotalSales] = useState([]);
  const [periodTotalSales, setPeriodTotalSales] = useState("dia");

  // Colores para la gráfica de torta
  const COLORS = ["#4CAF50", "#FFBB28", "#FF8042", "#0088FE"];

  // Obtener datos de best-selling (agrupados)
  const fetchBestSelling = useCallback(async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/reportes/best-selling?type=${typeFilter}&period=${periodBestSelling}`
      );
      console.log("Best Selling data:", response.data);
      let data = response.data;
      if (!data) {
        setBestSelling([]);
      } else if (Array.isArray(data)) {
        setBestSelling(data);
      } else {
        setBestSelling([data]);
      }
    } catch (error) {
      console.error("Error al obtener los productos más vendidos:", error);
      setBestSelling([]);
    }
  }, [apiUrl, typeFilter, periodBestSelling]);

  // Obtener datos de total sales
  const fetchTotalSales = useCallback(async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/reportes/total-sales?period=${periodTotalSales}`
      );
      console.log("Total Sales data:", response.data);
      // Convertir el objeto de respuesta a array
      const formattedData = Object.keys(response.data).map((key) => ({
        metodo: key,
        total_ventas: Number(response.data[key]),
      }));
      setTotalSales(formattedData);
    } catch (error) {
      console.error("Error al obtener el total de ventas:", error);
      setTotalSales([]);
    }
  }, [apiUrl, periodTotalSales]);

  useEffect(() => {
    fetchBestSelling();
  }, [fetchBestSelling]);

  useEffect(() => {
    fetchTotalSales();
  }, [fetchTotalSales]);

  // Calcular el total vendido (suma de todos los métodos)
  const overallTotal = totalSales.reduce(
    (acc, cur) => acc + cur.total_ventas,
    0
  );

  return (
    <div className="reportes-container">
      {/* Sección: Productos/Bebidas más vendidos */}
      <div className="report-section">
        <h2>📊 Productos/Bebidas Más Vendidos</h2>
        <div className="filters">
          <label>Tipo:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="producto">Producto</option>
            <option value="bebida">Bebida</option>
          </select>
          <label>Período:</label>
          <select
            value={periodBestSelling}
            onChange={(e) => setPeriodBestSelling(e.target.value)}
          >
            <option value="dia">Día</option>
            <option value="semana">Semana</option>
            <option value="mes">Mes</option>
            <option value="anio">Año</option>
          </select>
          <button onClick={fetchBestSelling}>Filtrar</button>
        </div>
        {bestSelling.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={bestSelling}
                layout="vertical"
                margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => Number(value).toLocaleString("es-CO")} />
                <Legend />
                <Bar
                  dataKey="cantidad_vendida"
                  fill="#82ca9d"
                  name="Cantidad Vendida"
                  barSize={25}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="lista">
              <h3>Lista de Más Vendidos</h3>
              <ul>
                {bestSelling.map((item, index) => (
                  <li key={index}>
                    <strong>{item.name}</strong> - {Number(item.cantidad_vendida).toLocaleString("es-CO")}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p>No hay datos disponibles para productos/bebidas más vendidos.</p>
        )}
      </div>

      {/* Sección: Total de Ventas por Método de Pago */}
      <div className="report-section">
        <h2>💰 Total de Ventas por Método de Pago</h2>
        <div className="filters">
          <label>Período:</label>
          <select
            value={periodTotalSales}
            onChange={(e) => setPeriodTotalSales(e.target.value)}
          >
            <option value="dia">Día</option>
            <option value="semana">Semana</option>
            <option value="mes">Mes</option>
            <option value="anio">Año</option>
          </select>
          <button onClick={fetchTotalSales}>Filtrar</button>
        </div>
        {/* Mostrar el total vendido global */}
        <p className="overall-total">
          Total Vendido: ${overallTotal.toLocaleString("es-CO")}
        </p>
        {totalSales.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={totalSales}
                  dataKey="total_ventas"
                  nameKey="metodo"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ metodo, total_ventas }) =>
                    `${metodo}: $${Number(total_ventas).toLocaleString()}`
                  }
                >
                  {totalSales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="lista">
              <h3>Lista Total de Ventas</h3>
              <ul>
                {totalSales.map((item, index) => (
                  <li key={index}>
                    <strong>{item.metodo}</strong>: ${Number(item.total_ventas).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p>No hay datos disponibles para total de ventas.</p>
        )}
      </div>
    </div>
  );
};

export default Reportes;
