import { Handler } from "@netlify/functions";
import { SuccessResponse, ErrorResponse } from "./types";
import { validateAuthorizationHeader, validateQueryStringParameters } from "./utils";

const handler: Handler = async (event) => {
  if (event.httpMethod !== "PUT") {
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

  const queryValidationError = validateQueryStringParameters(event, ["id"]);
  if (queryValidationError) {
    return {
      statusCode: 400,
      body: JSON.stringify(queryValidationError)
    };
  }

  try {
    // TODO: Implementar a lógica de publicação da nota
    // 1. Extrair o token e o ID
    // 2. Atualizar o status de publicação da nota
    // 3. Retornar sucesso

    const response: SuccessResponse = {
      pt: {
        message: "Sua nota foi atualizada com sucesso!",
        code: "Sucesso"
      },
      en: {
        message: "Your note was updated successfully!",
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
          message: "Erro ao publicar nota",
          code: "Erro durante processamento"
        },
        en: {
          message: "Error publishing note",
          code: "Error during processing"
        }
      } as ErrorResponse)
    };
  }
};

export { handler }; 