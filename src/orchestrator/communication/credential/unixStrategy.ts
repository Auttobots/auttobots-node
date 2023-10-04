import { OrchestratorCredential, OrchetratorCredentialRequest, RequestType, CustomError, OrchetratorCredentialResponse } from "../../types";

const requestCredentialForUnix = async (assetName: string, timeout: number = 5000): Promise<OrchestratorCredential> => new Promise((resolve, reject) => {
  if (typeof assetName !== 'string' || assetName?.trim() === '') throw new Error(CustomError.INVALID_ASSET_NAME);

  const uniqueTimestamp = new Date();

  if (process) {
    process.on('message', (response: OrchetratorCredentialResponse) => {
      const { data, error, timestamp } = response;

      if (typeof error && error === CustomError.ASSET_NOT_FOUND) {
        reject(new Error(CustomError.ASSET_NOT_FOUND));
      }
      if (data && timestamp === uniqueTimestamp) {
        resolve(data);
      }

      if (data === null && timestamp === uniqueTimestamp) {
        reject(new Error(CustomError.REQUEST_ERROR));
      }
    });

    const request: OrchetratorCredentialRequest = {
      requestType: RequestType.GET_ORCHESTRATOR_CREDENTIAL,
      data: {
        assetName,
      },
      timestamp: uniqueTimestamp,
    }

    if (process.send) {
      process.send(request, null, {}, (error) => {
        if (error) reject(new Error(CustomError.CLIENT_DISCONNECTED));
      });
    }
  }
  setTimeout(() => reject(new Error(CustomError.TIMEOUT_EXCEEDED)), timeout)
});

export { requestCredentialForUnix };
