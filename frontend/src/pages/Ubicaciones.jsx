import EntityPage from './EntityPage';
import service from '../services/ubicaciones';
export default function Ubicaciones() { return <EntityPage entity="ubicaciones" service={service}/>; }
