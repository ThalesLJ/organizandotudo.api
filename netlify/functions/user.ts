import { Handler, HandlerEvent } from "@netlify/functions";
import { UserResponse, UpdateUserRequest, SuccessResponse, ErrorResponse } from "./types";
import { validateAuthorizationHeader } from "./utils";
import { MongoClient } from "mongodb";
import { encryptData, decryptData } from "./utils/crypto";
import { withCors } from './middleware/cors';

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db(process.env.MONGODB_DATABASE);

const handler: Handler = async (event: HandlerEvent) => {
  const validationError = validateAuthorizationHeader(event);
  if (validationError) {
    return {
      statusCode: 401,
      body: JSON.stringify(validationError)
    };
  }

  if (event.httpMethod === "GET") {
    try {
      const token = event.headers.authorization!.replace('Bearer ', '');

      await client.connect();
      const user = await db.collection(process.env.MONGODB_COLLECTION_USERS!)
        .findOne({ token });

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

      const response: UserResponse = {
        username: decryptData(user.username),
        email: decryptData(user.email)
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
    } finally {
      await client.close();
    }
  } else if (event.httpMethod === "PUT") {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          pt: {
            message: "Corpo da requisição não fornecido",
            code: "Erro durante processamento"
          },
          en: {
            message: "Request body not provided",
            code: "Error during processing"
          }
        } as ErrorResponse)
      };
    }

    try {
      const token = event.headers.authorization!.replace('Bearer ', '');
      const { data } = JSON.parse(event.body) as UpdateUserRequest;

      if (!data.username || !data.email || !data.password) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            pt: {
              message: "Campos obrigatórios não fornecidos",
              code: "Erro durante processamento"
            },
            en: {
              message: "Required fields not provided",
              code: "Error during processing"
            }
          } as ErrorResponse)
        };
      }

      await client.connect();
      const user = await db.collection(process.env.MONGODB_COLLECTION_USERS!)
        .findOne({ token });

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

      const encryptedUsername = encryptData(data.username);
      const encryptedEmail = encryptData(data.email);
      const encryptedPassword = encryptData(data.password);

      await db.collection(process.env.MONGODB_COLLECTION_USERS!)
        .updateOne(
          { token },
          { 
            $set: { 
              username: encryptedUsername,
              email: encryptedEmail,
              password: encryptedPassword
            } 
          }
        );

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
    } finally {
      await client.close();
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

const corsHandler = withCors(handler);
export { corsHandler as handler }; 