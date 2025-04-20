import { Handler } from "@netlify/functions";
import { UserResponse, UpdateUserRequest, SuccessResponse, ErrorResponse } from "./types";
import { validateAuthorizationHeader, validateRequiredFields } from "./utils";

const handler: Handler = async (event) => {
  const validationError = validateAuthorizationHeader(event);
  if (validationError) {
    return {
      statusCode: 401,
      body: JSON.stringify(validationError)
    };
  }

  if (event.httpMethod === "GET") {
    try {
      // TODO: Implementar a lógica de obtenção dos dados do usuário
      // 1. Extrair o token
      // 2. Buscar os dados do usuário
      // 3. Retornar os dados

      const response: UserResponse = {
        username: "exemplo",
        email: "exemplo@exemplo.com"
      };

      return {
        statusCode: 200,
        body: JSON.stringify(response)
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          pt: {
            message: "Erro ao obter dados do usuário",
            code: "Erro durante processamento"
          },
          en: {
            message: "Error getting user data",
            code: "Error during processing"
          }
        } as ErrorResponse)
      };
    }
  } else if (event.httpMethod === "PUT") {
    const validationError = validateRequiredFields(event, ["data.username", "data.email", "data.password"]);
    if (validationError) {
      return {
        statusCode: 400,
        body: JSON.stringify(validationError)
      };
    }

    try {
      const { data } = JSON.parse(event.body!) as UpdateUserRequest;

      // TODO: Implementar a lógica de atualização do usuário
      // 1. Extrair o token
      // 2. Atualizar os dados do usuário
      // 3. Retornar sucesso

      const response: SuccessResponse = {
        pt: {
          message: "Sua conta foi atualizada com sucesso!",
          code: "Sucesso"
        },
        en: {
          message: "Your account has been successfully updated!",
          code: "Success"
        }
      };

      return {
        statusCode: 200,
        body: JSON.stringify(response)
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          pt: {
            message: "Erro ao atualizar usuário",
            code: "Erro durante processamento"
          },
          en: {
            message: "Error updating user",
            code: "Error during processing"
          }
        } as ErrorResponse)
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({
      pt: {
        message: "Método não permitido",
        code: "Erro durante processamento"
      },
      en: {
        message: "Method not allowed",
        code: "Error during processing"
      }
    } as ErrorResponse)
  };
};

export { handler }; 