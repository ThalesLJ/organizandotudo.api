import { Handler, HandlerEvent } from "@netlify/functions";
import { Note, ErrorResponse } from "./types";
import { validateAuthorizationHeader } from "./utils";
import { MongoClient } from "mongodb";
import { decryptData } from "./utils/crypto";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db(process.env.MONGODB_DATABASE);

const handler: Handler = async (event: HandlerEvent) => {
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

    const notes = await db.collection(process.env.MONGODB_COLLECTION_NOTES!)
      .find({ userId: user._id })
      .sort({ date: -1 })
      .toArray();

    const response: Note[] = notes.map(note => ({
      id: note._id.toString(),
      title: decryptData(note.title),
      content: decryptData(note.content),
      date: note.date.getTime(),
      public: note.public
    }));

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
  } finally {
    await client.close();
  }
};

export { handler }; 