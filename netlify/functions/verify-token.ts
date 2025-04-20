import { Handler, HandlerEvent } from "@netlify/functions";
import { SuccessResponse, ErrorResponse } from "./types";
import { validateAuthorizationHeader } from "./utils";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db(process.env.MONGODB_DATABASE);

const handler: Handler = async (event: HandlerEvent) => {
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
    const token = event.headers.authorization!.replace('Bearer ', '');

    await client.connect();
    const user = await db.collection(process.env.MONGODB_COLLECTION_USERS!)
      .findOne({ token: token });

    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          pt: {
            message: "Token inválido",
            code: "Erro durante processamento"
          },
          en: {
            message: "Invalid token",
            code: "Error during processing"
          }
        } as ErrorResponse)
      };
    }

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
  } finally {
    await client.close();
  }
};

export { handler }; 