import { OrchestratorVariable, OrchetratorVariableRequest, RequestType, CustomError, OrchetratorVariableResponse } from "../../types";
import { convertVariableValue } from "./_utils";

const requestVariableForUnix = async (key: string, timeout: number = 5000): Promise<OrchestratorVariable> => new Promise((resolve, reject) => {
  if (typeof key !== 'string' || key?.trim() === '') throw new Error(CustomError.INVALID_ASSET_NAME);

  const uniqueTimestamp = new Date();

  if (process) {
    process.on('message', (response: OrchetratorVariableResponse) => {
      const { data, error, timestamp } = response;

      if (typeof error && error === CustomError.ASSET_NOT_FOUND) {
        reject(new Error(CustomError.ASSET_NOT_FOUND));
      }

      if (data && timestamp === uniqueTimestamp) {
        const convertedVariable = convertVariableValue(data);
        resolve(convertedVariable);
      }

      if (data === null && timestamp === uniqueTimestamp) {
        reject(new Error(CustomError.REQUEST_ERROR));
      }
    });

    const request: OrchetratorVariableRequest = {
      requestType: RequestType.GET_ORCHESTRATOR_VARIABLE,
      data: {
        key,
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

export { requestVariableForUnix };
