import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,within} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Rastrear from '../../pages/v2/RastrearPaquete';
import {api} from '../../services/api';
vi.mock('../../services/api',()=>({api:vi.fn()}));
afterEach(()=>vi.resetAllMocks());
it('tracking presenta etapas, línea de tiempo y ETA estimada sin inventar horas',async()=>{
 api.mockResolvedValue({data:{paquete:{tracking:'AER-TEST',descripcion:'Audífonos',pesoKg:'1.5',estado:'en_transito'},etapaNombre:'En tránsito',progreso:{indice:2,etapas:[{codigo:'recibido_miami',nombre:'Recibido en Miami'},{codigo:'consolidado',nombre:'Consolidado'},{codigo:'en_transito',nombre:'En tránsito'}]},lineaTiempo:[{id:'mov-1',fecha:'2026-11-05',fechaHora:null,horaRegistrada:false,evento:'entrada',detalle:'Recepción histórica',ubicacion:null}],eta:{desde:'2026-11-10',hasta:'2026-11-14',demoraIncidencias:0,nota:'Rango estimado'},sucursalDestino:{nombre:'Heredia demo'},servicio:{nombre:'Estándar'},transportista:{nombre:'Transportista demo'},ubicacionActual:null,ultimaUbicacionRegistrada:null,incidencias:[],entregas:[],notaEntregas:'Intentos del envío'}});
 const user=userEvent.setup();render(<MemoryRouter><Rastrear/></MemoryRouter>);await user.type(screen.getByLabelText('Tracking del paquete'),'AER-TEST');await user.click(screen.getByRole('button',{name:'Rastrear'}));
 expect(await screen.findByRole('heading',{name:'AER-TEST'})).toBeVisible();expect(screen.getByText(/hora no registrada/)).toBeVisible();expect(screen.getByText(/Destino: Heredia demo/)).toBeVisible();expect(screen.getByText(/Siempre estimado/)).toBeVisible();expect(within(screen.getByRole('list',{name:'Etapas del recorrido'})).getByText('En tránsito')).toBeVisible();expect(api).toHaveBeenCalledWith('/v2/tracking/AER-TEST');
});
it('tracking informa falta de vínculo y no muestra datos de paquetes',async()=>{
 api.mockRejectedValue(new Error('Tu cuenta no tiene un cliente vinculado.'));const user=userEvent.setup();render(<MemoryRouter initialEntries={['/v2/rastrear?codigo=PRIVADO']}><Rastrear/></MemoryRouter>);await user.click(screen.getByRole('button',{name:'Rastrear'}));expect(await screen.findByRole('alert')).toHaveTextContent('no tiene un cliente vinculado');expect(screen.queryByRole('list',{name:'Etapas del recorrido'})).not.toBeInTheDocument();
});
it('tracking muestra error cuando el paquete no pertenece al cliente',async()=>{
 api.mockRejectedValue(new Error('Paquete no encontrado para tu cuenta.'));const user=userEvent.setup();render(<MemoryRouter><Rastrear/></MemoryRouter>);await user.type(screen.getByLabelText('Tracking del paquete'),'OTRO');await user.click(screen.getByRole('button',{name:'Rastrear'}));expect(await screen.findByRole('alert')).toHaveTextContent('Paquete no encontrado');
});
