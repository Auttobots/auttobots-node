import { OrchestratorVariable, CustomError, AuthenticationStatus } from "../../types";
import net from 'node:net';
import axios from 'axios';
import { convertVariableValue } from "./_utils";


const authenticateWithNamedPipe = async (): Promise<{ status: AuthenticationStatus, message?: string, apiKey?: string }> => new Promise((resolve, reject) => {
  const PIPE_NAME = '\\\\.\\pipe\\AuttobotsRunSessionChecker';

  try {
    let client: net.Socket;

    try {
      client = net.createConnection(PIPE_NAME);
    } catch {
      throw new Error(CustomError.CLIENT_DISCONNECTED);
    }

    // client.on('connect', () => {
    //   console.log('Connected to the named pipe server');
    // });

    client.on('error', (error) => {
      // console.error('Error connecting to the named pipe:', error);
      throw error;
    });

    client.on('data', (data) => {
      const auth = data.toString().trim();
      // console.log('Received data from server:', auth);

      client.end();

      if (!auth) {
        resolve({ status: AuthenticationStatus.Unauthenticated, message: 'No se pudieron obtener correctamente los datos de sesión activa' });
      } else {
        resolve({ status: AuthenticationStatus.Authenticated, apiKey: auth });
      }

    });

    client.on('end', () => {
      // console.log('Disconnected from the named pipe server');
    });

  } catch (error) {
    if (error instanceof Error && error.message === CustomError.CLIENT_DISCONNECTED) {
      reject(error);
    }

    reject(new Error(CustomError.CONNECTION_ERROR));
  }
});

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
