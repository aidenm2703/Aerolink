import {Navigate,useParams} from 'react-router-dom';
export default function AccesoEtiqueta(){const {codigo}=useParams();return <Navigate replace to={'/v2/rastrear?codigo='+encodeURIComponent(codigo)}/>;}
