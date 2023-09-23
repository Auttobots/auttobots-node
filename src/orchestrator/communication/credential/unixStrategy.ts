import { OrchestratorCredential, OrchetratorCredentialRequest, RequestType, CustomError } from "../../types";

const requestCredentialForUnix = async (assetName: string, timeout: number = 5000): Promise<OrchestratorCredential> => new Promise((resolve, reject) => {
  if (typeof String === 'string' || assetName?.trim() === '') throw new Error(CustomError.INVALID_ASSET_NAME);

  if (process) {
    process.on('message', (response: OrchestratorCredential | Error) => {
      if (response instanceof Error) {
        if (response.message === CustomError.ASSET_NOT_FOUND) reject(new Error(CustomError.ASSET_NOT_FOUND));

        reject(new Error(CustomError.REQUEST_ERROR));
      } else {
        resolve(response);
      }
    });

    const request: OrchetratorCredentialRequest = {
      requestType: RequestType.GET_ORCHESTRATOR_CREDENTIAL,
      data: {
        assetName,
      },
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
