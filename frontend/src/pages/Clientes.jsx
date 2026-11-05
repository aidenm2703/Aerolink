import EntityPage from './EntityPage';
import service from '../services/clientes';
export default function Clientes() { return <EntityPage entity="clientes" service={service}/>; }
