// src/pages/ImprimirFactura.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import logo from '../../assets/LOGO_AREPASAURIOS-bn.png';
import '../../styles/ImprimirFactura.css';

const ImprimirFactura = () => {
  const { ventaId } = useParams();
  const [venta, setVenta] = useState(null);
  const [error, setError] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    console.log('Intentando obtener la venta con ID:', ventaId);
    const fetchVenta = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/ventas/${ventaId}`);
        console.log('Datos de la venta obtenidos:', response.data);
        setVenta(response.data);
      } catch (error) {
        setError('Error al obtener la venta');
        console.error('Detalles del error:', error);
      }
    };
  
    if (ventaId) {
      fetchVenta();
    }
  }, [ventaId, apiUrl]);

  // Función para imprimir la factura en PDF
  const handlePrint = () => {
    if (!venta || !venta.VentaDetalles || venta.VentaDetalles.length === 0) {
      console.error('No hay detalles de venta disponibles');
      return;
    }
  
    const doc = new jsPDF({
      unit: 'mm',
      format: [80, 200], // Ajustar la altura según el contenido
    });
  
    let yOffset = 5;
  
    // 1. Logo
    if (logo) {
      doc.addImage(logo, 'PNG', 20, yOffset, 40, 30);
      yOffset += 35;
    }
  
    // 2. NIT
    doc.setFont('fantasia', 'normal');
    doc.setFontSize(13);
    doc.text('NIT: 1027520378-9', 23, yOffset);
    yOffset += 10;
  
    // 3. Factura de venta con el ID
    doc.setFont('fantasia', 'bold');
    doc.text(`Factura de venta: ${venta.ventas_id}`, 5, yOffset);
    yOffset += 5;
  
    // 4. Fecha de venta
    doc.text(`Fecha de venta: ${new Date(venta.fecha).toLocaleString()}`, 5, yOffset);
    yOffset += 5;
    doc.setFont('fantasia', 'normal');

    // 5. Cliente
    doc.text(`Cliente: ${venta.cliente || 'No especificado'}`, 5, yOffset);
    yOffset += 5;
  
    // 6. Método de pago
    doc.text(`Método de pago: ${venta.metodo_pago || 'No especificado'}`, 5, yOffset);
    yOffset += 5;
  
    // Línea de separación
    doc.setFontSize(10);
    doc.text(
      '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -',
      10,
      yOffset
    );
    yOffset += 5;
    doc.setFontSize(12);

    // 7. Cabecera de la tabla de productos
    doc.setFont('fantasia', 'bold');
    doc.text('Producto              Cant.  Vlr. Und.  Total', 5, yOffset);
    doc.setFont('helvetica', 'normal');
    yOffset += 5;
    
    // 8. Detalles de la venta
    venta.VentaDetalles.forEach((detalle) => {
      // Cambio principal: si tipo_producto === 'producto' => detalle.producto
      //                   si tipo_producto === 'bebida'   => detalle.bebida
      const item = detalle.tipo_producto === 'producto' ? detalle.producto : detalle.bebida;
      const nombreProducto = item ? item.name : 'Producto desconocido';
      const cantidad = detalle.cantidad;
      const precioUnitario = detalle.precio.toLocaleString('es-CO', { maximumFractionDigits: 0 });
      const totalProducto = (detalle.cantidad * detalle.precio).toLocaleString('es-CO', { maximumFractionDigits: 0 });
  
      doc.text(`${nombreProducto}`, 5, yOffset);
      doc.text(`${cantidad}`, 38, yOffset);
      doc.text(`$ ${precioUnitario}`, 43, yOffset);
      doc.text(`$ ${totalProducto}`, 63, yOffset);
      yOffset += 5;
    });
    doc.setFontSize(10);

    // Línea de separación
    doc.text(
      '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -',
      10,
      yOffset
    );
    yOffset += 8;
  
    // 9. Total de la venta
    const totalFormateado = venta.total.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    });
    doc.setFont('fantasia', 'bold');
    doc.setFontSize(20);
    doc.text(`Total: ${totalFormateado}`, 30, yOffset);
    yOffset += 10;
  
    // 10. Gracias por su compra
    doc.setFontSize(18);
    doc.text('¡¡Gracias por su compra!!', 5, yOffset);
    yOffset += 10;
  
    // 11. Atendido por (vendedor)
    doc.setFontSize(13);
    doc.setFont('fantasia', 'normal');
    doc.text(
      `Atendido por: ${
        venta.vendedor
          ? venta.vendedor.nombre + ' ' + venta.vendedor.apellido
          : 'No especificado'
      }`,
      10,
      yOffset
    );
    yOffset += 10;
  
    // 12. Teléfono de la empresa
    doc.text('Teléfono: 3229614209', 10, yOffset);
    yOffset += 10;
  
    // 13. Régimen
    doc.text('Régimen: No responsable de IVA', 10, yOffset);
    yOffset += 20;
  
    // 14. Información adicional
    doc.setFont('courier', 'bold');
    doc.text('Coding Web Design', 15, yOffset);
    doc.text('Tel: 3223165793', 15, (yOffset += 5));
    
    yOffset += 20;
  
    // Abrir el PDF en una ventana nueva y enviarlo directamente a impresión
    const pdfBlob = doc.output('blob');
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
  
    const pdfURL = URL.createObjectURL(pdfBlob);
    iframe.src = pdfURL;
  
    iframe.onload = () => {
      iframe.contentWindow.print();
    };
  };

  return (
    <div>
      <h2>Imprimir Factura</h2>
      {error && <p>{error}</p>}
      {venta && (
        <div>
          <h3>Detalles de la Venta</h3>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Valor Unitario</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {venta.VentaDetalles.map((detalle) => {
                // Ajuste en la tabla también
                const item = detalle.tipo_producto === 'producto' ? detalle.producto : detalle.bebida;
                const nombreProducto = item ? item.name : 'Producto desconocido';
                const cantidad = detalle.cantidad;
                const precioUnitario = detalle.precio.toLocaleString('es-CO', { maximumFractionDigits: 0 });
                const totalProducto = (detalle.cantidad * detalle.precio).toLocaleString('es-CO', { maximumFractionDigits: 0 });

                return (
                  <tr key={detalle.venta_detalle_id}>
                    <td>{nombreProducto}</td>
                    <td>{cantidad}</td>
                    <td>$ {precioUnitario}</td>
                    <td>$ {totalProducto}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p>
            <strong>Cliente:</strong> {venta.cliente || 'No especificado'}
          </p>
          <p>
            <strong>Atendido por:</strong>{' '}
            {venta.vendedor
              ? `${venta.vendedor.nombre} ${venta.vendedor.apellido}`
              : 'No especificado'}
          </p>
          <button onClick={handlePrint}>Imprimir Factura</button>
        </div>
      )}
    </div>
  );
};

export default ImprimirFactura;
