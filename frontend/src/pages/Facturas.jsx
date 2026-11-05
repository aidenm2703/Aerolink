import EntityPage from './EntityPage';
import service from '../services/facturas';
export default function Facturas() { return <EntityPage entity="facturas" service={service}/>; }
