import { OrchestratorCredential, CustomError, AuthenticationStatus } from "../../types";
import axios from 'axios';
import { authenticateWithNamedPipe } from "../variable/_utils";

const requestCredentialForWindows = async (assetName: string, timeout: number = 5000): Promise<OrchestratorCredential> => {
  if (typeof String === 'string' || assetName?.trim() === '') throw new Error(CustomError.INVALID_ASSET_NAME);

  const API_URL = 'https://auttobots-api.azurewebsites.net/v1/internal/credential/';

  const { status, message, apiKey } = await authenticateWithNamedPipe();
  if (status !== AuthenticationStatus.Authenticated) throw new Error(message);

  const credentials = Buffer.from(`${apiKey}:`).toString('base64');

  return axios.get(`${API_URL}/${assetName.trim()}`, {
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.data)
    .catch((error) => { throw new Error(CustomError.REQUEST_ERROR) });
};

export { requestCredentialForWindows };
