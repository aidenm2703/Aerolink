import { api } from '../api';
export const listBranches = params => api('/v2/sucursales?' + new URLSearchParams(params));
export const getBranch = id => api('/v2/sucursales/' + id);
