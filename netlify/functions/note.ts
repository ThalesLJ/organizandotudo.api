import { Handler } from "@netlify/functions";
import { Note, CreateNoteRequest, UpdateNoteRequest, SuccessResponse, ErrorResponse } from "./types";
import { validateAuthorizationHeader, validateRequiredFields, validateQueryStringParameters } from "./utils";
import { connectToDatabase, closeConnection } from "./config/mongodb";
import { ObjectId } from "mongodb";

const handler: Handler = async (event) => {
  const validationError = validateAuthorizationHeader(event);
  if (validationError) {
    return {
      statusCode: 401,
      body: JSON.stringify(validationError)
    };
  }

  if (event.httpMethod === "GET") {
    const validationError = validateQueryStringParameters(event, ["id"]);
    if (validationError) {
      return {
        statusCode: 400,
        body: JSON.stringify(validationError)
      };
    }

    try {
      const { notes } = await connectToDatabase();
      const noteId = event.queryStringParameters?.id;
      
      if (!noteId) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            pt: { message: "ID da nota não fornecido", code: "MissingNoteId" },
            en: { message: "Note ID not provided", code: "MissingNoteId" }
          })
        };
      }

      const note = await notes.findOne({ _id: new ObjectId(noteId) });
      
      if (!note) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            pt: { message: "Nota não encontrada", code: "NoteNotFound" },
            en: { message: "Note not found", code: "NoteNotFound" }
          })
        };
      }

      await closeConnection();

      return {
        statusCode: 200,
        body: JSON.stringify({
          id: note._id.toString(),
          title: note.title,
          content: note.content,
          date: note.date,
          public: note.public
        })
      };
    } catch (error) {
      console.error("Erro ao buscar nota:", error);
      await closeConnection();
      
      return {
        statusCode: 500,
        body: JSON.stringify({
          pt: { message: "Erro interno do servidor", code: "ServerError" },
          en: { message: "Internal server error", code: "ServerError" }
        })
      };
    }
  } else if (event.httpMethod === "POST") {
    const validationError = validateRequiredFields(event, ["note.title", "note.content"]);
    if (validationError) {
      return {
        statusCode: 400,
        body: JSON.stringify(validationError)
      };
    }

    try {
      const { note } = JSON.parse(event.body!) as CreateNoteRequest;

      // TODO: Implementar a lógica de criação da nota
      // 1. Extrair o token
      // 2. Criar a nota
      // 3. Retornar sucesso

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
        statusCode: 200,
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
    }
  } else if (event.httpMethod === "PUT") {
    const validationError = validateQueryStringParameters(event, ["id"]);
    if (validationError) {
      return {
        statusCode: 400,
        body: JSON.stringify(validationError)
      };
    }

    const bodyValidationError = validateRequiredFields(event, ["newNote.title", "newNote.content"]);
    if (bodyValidationError) {
      return {
        statusCode: 400,
        body: JSON.stringify(bodyValidationError)
      };
    }

    try {
      const { newNote } = JSON.parse(event.body!) as UpdateNoteRequest;

      // TODO: Implementar a lógica de atualização da nota
      // 1. Extrair o token e o ID
      // 2. Atualizar a nota
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
            message: "Erro ao atualizar nota",
            code: "Erro durante processamento"
          },
          en: {
            message: "Error updating note",
            code: "Error during processing"
          }
        } as ErrorResponse)
      };
    }
  } else if (event.httpMethod === "DELETE") {
    const validationError = validateQueryStringParameters(event, ["id"]);
    if (validationError) {
      return {
        statusCode: 400,
        body: JSON.stringify(validationError)
      };
    }

    try {
      // TODO: Implementar a lógica de exclusão da nota
      // 1. Extrair o token e o ID
      // 2. Excluir a nota
      // 3. Retornar sucesso

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