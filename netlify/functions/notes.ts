import { Handler } from "@netlify/functions";
import { Note, ErrorResponse } from "./types";
import { validateAuthorizationHeader } from "./utils";

const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
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
    // TODO: Implementar a lógica de listagem das notas
    // 1. Extrair o token
    // 2. Buscar as notas do usuário
    // 3. Retornar a lista

    const response: Note[] = [
      {
        id: "1",
        user: "user_id",
        title: "Exemplo 1",
        content: "Conteúdo exemplo 1",
        date: Date.now(),
        public: false
      },
      {
        id: "2",
        user: "user_id",
        title: "Exemplo 2",
        content: "Conteúdo exemplo 2",
        date: Date.now(),
        public: true
      }
    ];

    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        pt: {
          message: "Erro ao listar notas",
          code: "Erro durante processamento"
        },
        en: {
          message: "Error listing notes",
          code: "Error during processing"
        }
      } as ErrorResponse)
    };
  }
};

export { handler }; 