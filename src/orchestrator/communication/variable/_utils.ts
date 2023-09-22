import { OrchestratorVariable, CustomError, VariableType, AuthenticationStatus } from "../../types";
import net from 'node:net';

const convertVariableValue = (variable: OrchestratorVariable): OrchestratorVariable => {
  if (variable === null || variable === undefined) throw new Error(CustomError.REQUEST_ERROR);

  const { type, value } = variable;

  if (type === VariableType.NUMBER) {
    const convertedValue = Number(value);
    if (isNaN(convertedValue)) throw new Error(CustomError.INVALID_ASSET_FORMAT)

    const convertedVariable = { ...variable, value: convertedValue };
    return convertedVariable;
  }

  if (type === VariableType.BOOLEAN) {
    let convertedValue: boolean;

    if (value === 'true') {
      convertedValue = true;
    } else if (value === 'false') {
      convertedValue = false;
    } else {
      throw new Error(CustomError.INVALID_ASSET_FORMAT)
    }

    const convertedVariable = { ...variable, value: convertedValue };
    return convertedVariable;
  }

  if (type === VariableType.STRING) {
    return variable;
  }

  throw new Error(CustomError.INVALID_ASSET_FORMAT)
};

const authenticateWithNamedPipe = async (): Promise<{ status: AuthenticationStatus, message?: string, apiKey?: string }> => new Promise((resolve, reject) => {
  const PIPE_NAME = '\\\\.\\pipe\\AuttobotsRunSessionChecker';

  try {
    const client = net.createConnection(PIPE_NAME);

    // client.on('connect', () => {
    //   console.log('Connected to the named pipe server');
    // });

    client.on('error', (error) => {
      // console.error('Error connecting to the named pipe:', error);
      if (error.message.toUpperCase().includes('ENOENT')) throw new Error(CustomError.CLIENT_DISCONNECTED);
      throw new Error(CustomError.CONNECTION_ERROR);
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
    reject(error);
  }
});

export { convertVariableValue, authenticateWithNamedPipe };