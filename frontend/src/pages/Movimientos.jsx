import EntityPage from './EntityPage';
import service from '../services/movimientos';
export default function Movimientos() { return <EntityPage entity="movimientos" service={service}/>; }
