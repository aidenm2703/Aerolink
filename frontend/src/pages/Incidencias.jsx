import EntityPage from './EntityPage';
import service from '../services/incidencias';
export default function Incidencias() { return <EntityPage entity="incidencias" service={service}/>; }
