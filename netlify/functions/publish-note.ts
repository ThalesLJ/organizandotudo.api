import { Handler } from "@netlify/functions";
import { SuccessResponse, ErrorResponse } from "./types";
import { validateAuthorizationHeader, validateQueryStringParameters } from "./utils";
import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db(process.env.MONGODB_DATABASE);

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
    const token = event.headers.authorization!.replace('Bearer ', '');
    const noteId = event.queryStringParameters?.id;

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

    const note = await db.collection(process.env.MONGODB_COLLECTION_NOTES!)
      .findOne({ _id: new ObjectId(noteId), userId: user._id });

    if (!note) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          pt: {
            message: "Nota não encontrada",
            code: "Erro durante processamento"
          },
          en: {
            message: "Note not found",
            code: "Error during processing"
          }
        } as ErrorResponse)
      };
    }

    const result = await db.collection(process.env.MONGODB_COLLECTION_NOTES!)
      .updateOne(
        { _id: new ObjectId(noteId), userId: user._id },
        { $set: { public: !note.public } }
      );

    if (result.matchedCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          pt: {
            message: "Nota não encontrada",
            code: "Erro durante processamento"
          },
          en: {
            message: "Note not found",
            code: "Error during processing"
          }
        } as ErrorResponse)
      };
    }

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
  } finally {
    await client.close();
  }
};

export { handler }; 