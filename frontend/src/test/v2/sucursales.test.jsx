import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Directorio from '../../pages/v2/DirectorioSucursales';
import {listBranches,getBranch} from '../../services/v2/sucursales';
vi.mock('../../services/v2/sucursales',()=>({listBranches:vi.fn(),getBranch:vi.fn()}));
afterEach(()=>vi.resetAllMocks());
it('directorio: horario, oficina demo, detalle de bodega y filtro de país',async()=>{
 const branch={id:1,codigo:'DEMO-US-MIA',nombre:'Miami · Recepción (demo)',direccion:'Referencia de demostración',telefono:'+1 305 555 0100',horario:'Lunes a viernes 09:00–17:00',estado:'activo',paisNombre:'Estados Unidos',datosDemo:true};
 listBranches.mockResolvedValue({data:[branch],meta:{total:1}});getBranch.mockResolvedValue({data:{...branch,bodegas:[{id:1,nombre:'Bodega Miami',direccion:'Dirección demo',ubicaciones:[{id:1,codigo:'A01',pasillo:'A',estante:'01',estado:'disponible'}]}]}});
 const user=userEvent.setup();render(<Directorio/>);
 expect(await screen.findByRole('heading',{name:'Miami · Recepción (demo)'})).toBeVisible();expect(screen.getByText(branch.horario)).toBeVisible();expect(screen.getByText('Demo')).toBeVisible();
 await user.click(screen.getByRole('button',{name:'Ver oficina y bodegas'}));expect(await screen.findByText('Bodega Miami')).toBeVisible();expect(screen.getByText(/Pasillo A, estante 01/)).toBeVisible();
 await user.click(screen.getByRole('button',{name:'Cerrar ventana'}));await user.selectOptions(screen.getByRole('combobox',{name:'País de la sucursal'}),'US');await waitFor(()=>expect(listBranches).toHaveBeenLastCalledWith({q:'',pais:'US',page:1,limit:12}));
});
it('directorio muestra errores de API',async()=>{listBranches.mockRejectedValue(new Error('No se pudo consultar el directorio.'));render(<Directorio/>);expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo consultar el directorio.');});
