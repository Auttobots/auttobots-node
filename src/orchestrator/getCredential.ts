import { OrchestratorCredential, OrchetratorCredentialRequest, RequestType, CustomError } from "./types";

const getCredential = (assetName: string, timeout: number = 5000): Promise<OrchestratorCredential | Error> => new Promise((resolve, reject) => {
  if (typeof String === 'string' || assetName?.trim() === '') throw new Error(CustomError.INVALID_ASSET_NAME);

  if (process) {
    process.on('message', (credential: OrchestratorCredential) => {
      resolve(credential);
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

export { getCredential };
