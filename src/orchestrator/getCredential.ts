import { requestCredentialForUnix } from "./communication/credential/unixStrategy";
import { requestCredentialForWindows } from "./communication/credential/windowsStrategy";
import { OrchestratorCredential, CustomError } from "./types";
import os from 'node:os';

const getCredential = async (assetName: string, timeout?: number): Promise<OrchestratorCredential> => {
  const platform: NodeJS.Platform = os.platform();

  if (['darwin', 'linux'].includes(platform)) {
    const credential = await requestCredentialForUnix(assetName, timeout);
    return credential;
  }

  if (platform === 'win32') {
    const credential = await requestCredentialForWindows(assetName, timeout);
    return credential;
  }

  throw new Error(CustomError.INVALID_OS_ERROR);
};

export { getCredential };
