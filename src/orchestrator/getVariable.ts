import { requestVariableForUnix } from "./communication/variable/unixStrategy";
import { requestVariableForWindows } from "./communication/variable/windowsStrategy";
import { OrchestratorVariable, CustomError } from "./types";
import os from 'node:os';

const getVariable = async (key: string, timeout?: number): Promise<OrchestratorVariable> => {
  const platform: NodeJS.Platform = os.platform();

  if (['darwin', 'linux'].includes(platform)) {
    const variable = await requestVariableForUnix(key, timeout);
    return variable;
  }

  if (platform === 'win32') {
    const variable = await requestVariableForWindows(key, timeout);
    return variable;
  }

  throw new Error(CustomError.INVALID_OS_ERROR);
};

export { getVariable };
