import { Handler } from "@netlify/functions";
import { SuccessResponse, ErrorResponse } from "./types";
import { validateAuthorizationHeader } from "./utils";

const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
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
  }

  const validationError = validateAuthorizationHeader(event);
  if (validationError) {
    return {
      statusCode: 401,
      body: JSON.stringify(validationError)
    };
  }

  try {
    // TODO: Implementar a lógica de verificação do token
    // 1. Extrair o token do header
    // 2. Verificar se o token é válido
    // 3. Retornar sucesso

    const response: SuccessResponse = {
      pt: {
        message: "Token válido",
        code: "Sucesso"
      },
      en: {
        message: "Valid token",
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
          message: "Erro ao verificar token",
          code: "Erro durante processamento"
        },
        en: {
          message: "Error verifying token",
          code: "Error during processing"
        }
      } as ErrorResponse)
    };
  }
};

export { handler }; 