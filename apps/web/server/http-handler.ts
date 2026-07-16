import type { WorkspaceApi } from '../api-contract';
import type { WebWorkspaceState } from '../app/web-store';

export type ApiRequest = { method: 'GET' | 'PUT'; path: string; headers: Record<string, string | undefined>; body?: unknown };
export type ApiResponse = { status: 200 | 400 | 401 | 403 | 404 | 409 | 500; body: unknown };

export function createWorkspaceHttpHandler(api: WorkspaceApi, authenticate: (token: string) => { tenantId: string } | null) {
  return async function handle(request: ApiRequest): Promise<ApiResponse> {
    const match = request.path.match(/^\/api\/v1\/workspaces\/([^/]+)$/);
    if (!match) return { status: 404, body: { error: 'Not found' } };
    const token = request.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return { status: 401, body: { error: 'Authentication required' } };
    const identity = authenticate(token);
    if (!identity || identity.tenantId !== decodeURIComponent(match[1])) return { status: 403, body: { error: 'Forbidden' } };
    const tenantId = identity.tenantId;
    if (request.method === 'GET') return mapResponse(await api.getWorkspace(tenantId));
    if (!request.body || typeof request.body !== 'object') return { status: 400, body: { error: 'JSON workspace body required' } };
    return mapResponse(await api.saveWorkspace(tenantId, request.body as WebWorkspaceState, request.headers['if-match']));
  };
}

function mapResponse(response: { data?: unknown; error?: { code: string; message: string }; requestId: string }): ApiResponse {
  if (!response.error) return { status: 200, body: { data: response.data, requestId: response.requestId } };
  const status = response.error.code === 'UNAUTHENTICATED' ? 401 : response.error.code === 'FORBIDDEN' ? 403 : response.error.code === 'CONFLICT' ? 409 : response.error.code === 'VALIDATION_ERROR' ? 400 : 500;
  return { status, body: { error: response.error, requestId: response.requestId } };
}
