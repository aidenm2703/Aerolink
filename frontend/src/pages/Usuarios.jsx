import EntityPage from './EntityPage';
import service from '../services/usuarios';
export default function Usuarios() { return <EntityPage entity="usuarios" service={service}/>; }
