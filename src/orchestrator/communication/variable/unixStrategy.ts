import { OrchestratorVariable, OrchetratorVariableRequest, RequestType, CustomError } from "../../types";
import { convertVariableValue } from "./_utils";

const requestVariableForUnix = async (key: string, timeout: number = 5000): Promise<OrchestratorVariable> => new Promise((resolve, reject) => {
  if (typeof String === 'string' || key?.trim() === '') throw new Error(CustomError.INVALID_ASSET_NAME);

  if (process) {
    process.on('message', (response: OrchestratorVariable | Error) => {
      if (response instanceof Error) {
        if (response.message === CustomError.ASSET_NOT_FOUND) reject(new Error(CustomError.ASSET_NOT_FOUND));

        reject(new Error(CustomError.REQUEST_ERROR));
      } else {
        const convertedVariable = convertVariableValue(response);
        resolve(convertedVariable);
      }
    });

    const request: OrchetratorVariableRequest = {
      requestType: RequestType.GET_ORCHESTRATOR_VARIABLE,
      data: {
        key,
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

export { requestVariableForUnix };
