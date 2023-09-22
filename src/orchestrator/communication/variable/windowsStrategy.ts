import { OrchestratorVariable, CustomError, AuthenticationStatus } from "../../types";
import axios from 'axios';
import { convertVariableValue, authenticateWithNamedPipe } from "./_utils";

const requestVariableForWindows = async (key: string, timeout: number = 5000): Promise<OrchestratorVariable> => {
  if (typeof String === 'string' || key?.trim() === '') throw new Error(CustomError.INVALID_ASSET_NAME);

  const API_URL = 'https://auttobots-api.azurewebsites.net/v1/internal/variable/';

  const { status, message, apiKey } = await authenticateWithNamedPipe();
  if (status !== AuthenticationStatus.Authenticated) throw new Error(message);

  const BASIC_AUTH = Buffer.from(`${apiKey}:`).toString('base64');

  return axios.get(`${API_URL}/${key.trim()}`, {
    headers: {
      'Authorization': `Basic ${BASIC_AUTH}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      const variable: OrchestratorVariable = response.data.data;
      const convertedVariable = convertVariableValue(variable);
      return convertedVariable;
    })
    .catch(() => { throw new Error(CustomError.REQUEST_ERROR) });
};

export { requestVariableForWindows };
