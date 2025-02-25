import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Empleados = () => {
    const [empleados, setEmpleados] = useState([]);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [nuevoEmpleado, setNuevoEmpleado] = useState({ 
        nombre: '', 
        apellido: '', 
        rol: 'Cajero' 
    });
    const [contraseñaGenerada, setContraseñaGenerada] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        obtenerEmpleados();
    }, []);
    const apiUrl = process.env.REACT_APP_API_URL;
    const obtenerEmpleados = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/empleados/empleados`);
            setEmpleados(response.data);
        } catch (error) {
            console.error('Error al obtener empleados:', error);
            setError('Error al obtener empleados');
        }
    };

    const eliminarEmpleado = async (id) => {
        try {
            await axios.delete(`${apiUrl}/api/empleados/empleados/${id}`);
            obtenerEmpleados(); // Refresh the list after deletion
        } catch (error) {
            console.error('Error al eliminar empleado:', error);
            setError('Error al eliminar empleado');
        }
    };

    
   

    const crearEmpleado = async () => {
        if (!nuevoEmpleado.nombre || !nuevoEmpleado.apellido) {
            setError('Por favor, complete todos los campos.');
            return;
        }
    
        try {
            if (empleadoSeleccionado) {
                // Editar empleado
                console.log('Datos para editar:', nuevoEmpleado);
                await axios.put(`${apiUrl}/api/empleados/empleados/${empleadoSeleccionado.empleado_id}`, nuevoEmpleado);
                setEmpleadoSeleccionado(null);
            } else {
                // Generar usuario y contraseña antes de crear
                const usuarioGenerado = `${nuevoEmpleado.nombre.toLowerCase()}.${nuevoEmpleado.apellido.toLowerCase()}`;
                const contraseñaGenerada = Math.random().toString(36).slice(-8);
                
                // Asignar usuario y contraseña generados al nuevo empleado
                const empleadoConCredenciales = {
                    ...nuevoEmpleado,
                    usuario: usuarioGenerado,
                    contraseña: contraseñaGenerada
                };
    
                console.log('Datos para crear:', empleadoConCredenciales);
                await axios.post(`${apiUrl}/api/empleados/empleados`, empleadoConCredenciales);
    
                setContraseñaGenerada(contraseñaGenerada);
            }
    
            // Limpiar el formulario
            setNuevoEmpleado({ nombre: '', apellido: '', rol: 'Cajero', usuario: '', contraseña: '' });
            setContraseñaGenerada('');
            obtenerEmpleados();
            setError('');
        } catch (error) {
            console.error('Error al crear o editar empleado:', error);
            setError('Error al crear o editar empleado');
        }
    };
    

    const seleccionarEmpleado = (empleado) => {
        setEmpleadoSeleccionado(empleado);
        setNuevoEmpleado({ 
            nombre: empleado.nombre, 
            apellido: empleado.apellido, 
            rol: empleado.rol, 
            usuario: empleado.usuario, 
            contraseña: ''  // No mostrar la contraseña actual por seguridad
        });
    };

    const cancelarEdicion = () => {
        setEmpleadoSeleccionado(null);
        setNuevoEmpleado({ nombre: '', apellido: '', rol: 'Cajero', usuario: '', contraseña: '' });
        setContraseñaGenerada('');
        setError('');
    };

    return (
        <div>
            <h2>Gestión de Empleados</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <input
                    type="text"
                    placeholder="Nombre"
                    value={nuevoEmpleado.nombre}
                    onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, nombre: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Apellido"
                    value={nuevoEmpleado.apellido}
                    onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, apellido: e.target.value })}
                />
                <select
                    value={nuevoEmpleado.rol}
                    onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, rol: e.target.value })}
                >
                    <option value="Cajero">Cajero</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Mesero">Mesero</option>
                </select>
                <button onClick={crearEmpleado}>
                    {empleadoSeleccionado ? 'Guardar Cambios' : 'Agregar Empleado'}
                </button>
                {empleadoSeleccionado && <button onClick={cancelarEdicion}>Cancelar</button>}
            </div>

            {contraseñaGenerada && (
                <p>Contraseña generada: <strong>{contraseñaGenerada}</strong></p>
            )}

            <h3>Lista de Empleados</h3>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Rol</th>
                        <th>Usuario</th>
                        <th>Contraseña</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {empleados.map((empleado) => (
                        <tr key={empleado.empleado_id}>
                            <td>{empleado.empleado_id}</td>
                            <td>{empleado.nombre}</td>
                            <td>{empleado.apellido}</td>
                            <td>{empleado.rol}</td>
                            <td>{empleado.usuario}</td>
                            <td>{empleado.contraseña}</td>
                            <td>
                                <button onClick={() => seleccionarEmpleado(empleado)}>Editar</button>
                                <button onClick={() => eliminarEmpleado(empleado.empleado_id)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Empleados;
