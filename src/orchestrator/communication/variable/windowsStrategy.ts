import { OrchestratorVariable, CustomError, AuthenticationStatus } from "../../types";
import net from 'node:net';
import axios from 'axios';
import { convertVariableValue } from "./_utils";


const authenticateWithNamedPipe = async (): Promise<{ status: AuthenticationStatus, message?: string, apiKey?: string }> => {
  const PIPE_NAME = '\\\\.\\pipe\\AuttobotsRunSessionChecker';

  return new Promise<{ status: AuthenticationStatus, message?: string, apiKey?: string }>((resolve, reject) => {
    const client = net.createConnection(PIPE_NAME);

    // client.on('connect', () => {
    //   console.log('Connected to the named pipe server');
    // });

    client.on('error', (error) => {
      // console.error('Error connecting to the named pipe:', error);
      reject(error);
    });

    client.on('data', (data) => {
      const auth = data.toString().trim();
      console.log('Received data from server:', auth);

      if (!auth) {
        resolve({ status: AuthenticationStatus.Unauthenticated, message: 'No se pudieron obtener correctamente los datos de sesión activa' });
      } else {
        resolve({ status: AuthenticationStatus.Authenticated, apiKey: auth });
      }

      client.end();
    });

    client.on('end', () => {
      console.log('Disconnected from the named pipe server');
    });
  })
};

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
