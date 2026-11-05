import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatFlotante,{ConversacionAgente} from '../../components/v2/ChatFlotante';
import Campana from '../../components/v2/CampanaNotificaciones';
import Centro from '../../pages/v2/CentroAgente';
import {api} from '../../services/api';
vi.mock('../../services/api',()=>({api:vi.fn()}));afterEach(()=>vi.resetAllMocks());
it('chat flotante llama al agente y conserva conversación al cerrar',async()=>{
 api.mockResolvedValue({data:{respuesta:'Tu paquete sigue en tránsito.',origen:'gemini',herramientas:['buscar_paquete']}});const user=userEvent.setup();render(<ChatFlotante/>);
 await user.click(screen.getByRole('button',{name:'Abrir asistente Aerolink'}));await user.type(screen.getByLabelText('Mensaje al agente'),'Dónde está AER-DEMO-0003');await user.click(screen.getByRole('button',{name:'Enviar al agente'}));expect(await screen.findByText('Tu paquete sigue en tránsito.')).toBeVisible();expect(screen.getByText(/Generado con Gemini/)).toBeVisible();
 await user.click(screen.getByRole('button',{name:'Cerrar chat del asistente'}));expect(screen.getByText('Tu paquete sigue en tránsito.')).not.toBeVisible();await user.click(screen.getByRole('button',{name:'Abrir asistente Aerolink'}));expect(screen.getByText('Tu paquete sigue en tránsito.')).toBeVisible();
 await user.type(screen.getByLabelText('Mensaje al agente'),'Gracias');await user.click(screen.getByRole('button',{name:'Enviar al agente'}));await waitFor(()=>expect(api).toHaveBeenCalledTimes(2));expect(api.mock.calls[1][1].body.historial).toHaveLength(2);
});
it('cada aplicación del agente se envía con su modo y muestra respaldo honesto',async()=>{
 api.mockResolvedValue({data:{respuesta:'No hay datos disponibles; es un borrador.',origen:'respaldo',herramientas:[]}});const user=userEvent.setup();render(<ConversacionAgente/>);await user.selectOptions(screen.getByRole('combobox',{name:'Modo del agente'}),'incidencia');await user.type(screen.getByLabelText('Mensaje al agente'),'El embalaje está dañado');await user.click(screen.getByRole('button',{name:'Enviar al agente'}));expect(await screen.findByText(/Respuesta de respaldo/)).toBeVisible();expect(api.mock.calls[0][1].body.modo).toBe('incidencia');
});
it('campana obtiene avisos y permite marcarlos como leídos',async()=>{
 let read=false;api.mockImplementation(async path=>{if(path.includes('/leida')){read=true;return{data:{leida:true}};}return{data:{noLeidas:read?0:1,notificaciones:[{id:1,mensaje:'Tu paquete llegó a la sucursal.',leida:read,fecha:'2026-11-05T15:00:00Z',origenTexto:'plantilla'}]}};});
 const user=userEvent.setup();render(<Campana/>);await user.click(await screen.findByRole('button',{name:'Notificaciones: 1 sin leer'}));expect(screen.getByText('Tu paquete llegó a la sucursal.')).toBeVisible();await user.click(screen.getByRole('button',{name:'Marcar notificación 1 como leída'}));expect(await screen.findByRole('button',{name:'Notificaciones: 0 sin leer'})).toBeVisible();expect(api).toHaveBeenCalledWith('/v2/notificaciones/1/leida',{method:'PATCH'});
});
it('centro conecta clima, mapa y QR a sus herramientas',async()=>{
 api.mockImplementation(async path=>path==='/v2/asistente/mapa'?{data:[{codigo:'DEMO-CR-HER',nombre:'Heredia demo',coordenadas:{lat:10,lon:-84}}]}:path.includes('/clima/')?{data:{disponible:true,actual:{temperature_2m:23,precipitation:0},pronostico:{time:[]}}}:path.includes('/qr/')?{data:{tracking:'AER-DEMO-0001',dataUrl:'data:image/png;base64,AAAA',nota:'Requiere iniciar sesión.'}}:{data:{}});
 const user=userEvent.setup();render(<Centro/>);await screen.findByRole('option',{name:'Heredia demo'});await user.click(screen.getByRole('button',{name:'Consultar clima'}));expect(await screen.findByText('23 °C')).toBeVisible();await user.click(screen.getByRole('button',{name:'Mostrar mapa'}));expect(screen.getByTitle('Mapa de referencia de la sucursal')).toHaveAttribute('src',expect.stringContaining('openstreetmap.org'));
 await user.type(screen.getByLabelText('Tracking para herramientas'),'AER-DEMO-0001');await user.click(screen.getByRole('button',{name:'Generar QR'}));expect(await screen.findByAltText('QR de seguimiento de AER-DEMO-0001')).toBeVisible();
});
