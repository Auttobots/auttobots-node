import { OrchestratorCredential, CustomError, AuthenticationStatus } from "../../types";
import net from 'node:net';
import axios from 'axios';


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
    .then((response) => response.data.data)
    .catch((error) => { throw new Error(CustomError.REQUEST_ERROR) });
};

export { requestCredentialForWindows };
