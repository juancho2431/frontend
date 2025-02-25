import React from 'react';
import IngredientesTable from '../components/inventory/IngredientesTable';
import ArepasTable from '../components/inventory/ProductosTable';
import BebidasTable from '../components/inventory/BebidasTable';
import '../styles/Inventario.css';

function InventarioPage({ userRole }) {
  const isReadOnly = userRole === 'Cajero' || userRole === 'Mesero' || userRole === 'Empleado';

  return (
    <div>
      <h1>Inventario</h1>
      <IngredientesTable isReadOnly={isReadOnly} />
      <ArepasTable isReadOnly={isReadOnly} />
      <BebidasTable isReadOnly={isReadOnly} />
    </div>
  );
}

export default InventarioPage;
