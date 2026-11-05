import EntityPage from './EntityPage';
import service from '../services/sucursales';
export default function Sucursales() { return <EntityPage entity="sucursales" service={service}/>; }
