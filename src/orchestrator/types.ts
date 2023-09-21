enum RequestType {
  GET_ORCHESTRATOR_CREDENTIAL,
  GET_ORCHESTRATOR_VARIABLE,
}

interface ParentProcessRequest {
  requestType: RequestType,
  data: object,
}

interface OrchetratorCredentialRequest extends ParentProcessRequest {
  data: {
    assetName: string,
  },
}

type OrchestratorCredential = {
  name: string,
  description: string,
  username: string,
  password: string,
}

enum CustomError {
  INVALID_ASSET_NAME = 'INVALID_ASSET_NAME',
  TIMEOUT_EXCEEDED = 'TIMEOUT_EXCEEDED',
  CLIENT_DISCONNECTED = 'CLIENT_DISCONNECTED',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  REQUEST_ERROR = 'REQUEST_ERROR',
  INVALID_OS_ERROR = 'INVALID_OS_ERROR',
}

enum AuthenticationStatus {
  Unauthenticated = 'Unauthenticated',
  Authenticated = 'Authenticated',
  TimeoutError = 'TimeoutError',
}

export {
  OrchestratorCredential,
  OrchetratorCredentialRequest,
  ParentProcessRequest,
  RequestType,
  CustomError,
  AuthenticationStatus,
};