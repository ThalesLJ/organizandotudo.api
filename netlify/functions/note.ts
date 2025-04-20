import { Handler, HandlerEvent } from "@netlify/functions";
import { Note, CreateNoteRequest, UpdateNoteRequest, SuccessResponse, ErrorResponse } from "./types";
import { validateAuthorizationHeader } from "./utils";
import { MongoClient, ObjectId } from "mongodb";
import { encryptData, decryptData } from "./utils/crypto";

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
      const noteId = event.queryStringParameters?.id;

      if (!noteId) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            pt: {
              message: "ID da nota não fornecido",
              code: "Erro durante processamento"
            },
            en: {
              message: "Note ID not provided",
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

      const response: Note = {
        id: note._id.toString(),
        title: decryptData(note.title),
        content: decryptData(note.content),
        date: note.date.getTime(),
        public: note.public
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
            message: "Erro ao buscar nota",
            code: "Erro durante processamento"
          },
          en: {
            message: "Error getting note",
            code: "Error during processing"
          }
        } as ErrorResponse)
      };
    } finally {
      await client.close();
    }
  } else if (event.httpMethod === "POST") {
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
      const { note } = JSON.parse(event.body) as CreateNoteRequest;

      if (!note.title || !note.content) {
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

      const encryptedTitle = encryptData(note.title);
      const encryptedContent = encryptData(note.content);
      const now = new Date();

      const newNote = {
        userId: user._id,
        title: encryptedTitle,
        content: encryptedContent,
        date: now,
        public: note.public || false
      };

      const result = await db.collection(process.env.MONGODB_COLLECTION_NOTES!)
        .insertOne(newNote);

      const response: SuccessResponse = {
        pt: {
          message: "Sua nota foi criada com sucesso!",
          code: "Sucesso"
        },
        en: {
          message: "Your note was successfully created!",
          code: "Success"
        }
      };

      return {
        statusCode: 201,
        body: JSON.stringify(response)
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          pt: {
            message: "Erro ao criar nota",
            code: "Erro durante processamento"
          },
          en: {
            message: "Error creating note",
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
      const noteId = event.queryStringParameters?.id;
      const { newNote } = JSON.parse(event.body) as UpdateNoteRequest;

      if (!noteId) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            pt: {
              message: "ID da nota não fornecido",
              code: "Erro durante processamento"
            },
            en: {
              message: "Note ID not provided",
              code: "Error during processing"
            }
          } as ErrorResponse)
        };
      }

      if (!newNote.title || !newNote.content) {
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

      const encryptedTitle = encryptData(newNote.title);
      const encryptedContent = encryptData(newNote.content);

      const result = await db.collection(process.env.MONGODB_COLLECTION_NOTES!)
        .updateOne(
          { _id: new ObjectId(noteId), userId: user._id },
          { 
            $set: { 
              title: encryptedTitle,
              content: encryptedContent,
              public: newNote.public ?? false
            } 
          }
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
            message: "Erro ao atualizar nota",
            code: "Erro durante processamento"
          },
          en: {
            message: "Error updating note",
            code: "Error during processing"
          }
        } as ErrorResponse)
      };
    } finally {
      await client.close();
    }
  } else if (event.httpMethod === "DELETE") {
    try {
      const token = event.headers.authorization!.replace('Bearer ', '');
      const noteId = event.queryStringParameters?.id;

      if (!noteId) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            pt: {
              message: "ID da nota não fornecido",
              code: "Erro durante processamento"
            },
            en: {
              message: "Note ID not provided",
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

      const result = await db.collection(process.env.MONGODB_COLLECTION_NOTES!)
        .deleteOne({ _id: new ObjectId(noteId), userId: user._id });

      if (result.deletedCount === 0) {
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
          message: "Sua nota foi excluída com sucesso!",
          code: "Sucesso"
        },
        en: {
          message: "Your note was deleted successfully!",
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
            message: "Erro ao excluir nota",
            code: "Erro durante processamento"
          },
          en: {
            message: "Error deleting note",
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

export { handler }; 