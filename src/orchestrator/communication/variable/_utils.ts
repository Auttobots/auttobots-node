import { OrchestratorVariable, CustomError, VariableType } from "../../types";

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

export { convertVariableValue };