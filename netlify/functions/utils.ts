import { HandlerEvent } from "@netlify/functions";
import { ErrorResponse } from "./types";
import jwt from "jsonwebtoken";
import { decryptData } from "./utils/crypto";

export function validateRequiredFields(event: HandlerEvent, fields: string[]): ErrorResponse | null {
  if (!event.body) {
    return {
      pt: {
        message: "O corpo da requisição não pode estar vazio",
        code: "Erro durante processamento"
      },
      en: {
        message: "Request body cannot be empty",
        code: "Error during processing"
      }
    };
  }

  const body = JSON.parse(event.body);
  
  for (const field of fields) {
    const value = field.split('.').reduce((obj, key) => obj?.[key], body);
    
    if (!value) {
      return {
        pt: {
          message: `O campo '${field}' é obrigatório`,
          code: "Erro durante processamento"
        },
        en: {
          message: `The field '${field}' is required`,
          code: "Error during processing"
        }
      };
    }
  }

  return null;
}

export function validateAuthorizationHeader(event: HandlerEvent): ErrorResponse | null {
  const authHeader = event.headers.authorization;

  if (!authHeader) {
    return {
      pt: {
        message: "Token inválido",
        code: "Erro durante processamento"
      },
      en: {
        message: "Invalid token",
        code: "Error during processing"
      }
    };
  }

  return null;
}

export function validateQueryStringParameters(event: HandlerEvent, params: string[]): ErrorResponse | null {
  if (!event.queryStringParameters) {
    return {
      pt: {
        message: "Parâmetros de consulta são obrigatórios",
        code: "Erro durante processamento"
      },
      en: {
        message: "Query parameters are required",
        code: "Error during processing"
      }
    };
  }

  for (const param of params) {
    if (!event.queryStringParameters[param]) {
      return {
        pt: {
          message: `O parâmetro '${param}' é obrigatório`,
          code: "Erro durante processamento"
        },
        en: {
          message: `The parameter '${param}' is required`,
          code: "Error during processing"
        }
      };
    }
  }

  return null;
} 

export function getUserFromToken(event: HandlerEvent): { username: string; email: string; password: string } | null {
  try {
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.replace('Bearer ', '');
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      return null;
    }

    const decoded = jwt.verify(token, secret) as any;
    
    if (!decoded || !decoded.username || !decoded.email || !decoded.password) {
      return null;
    }

    return {
      username: decryptData(decoded.username),
      email: decryptData(decoded.email),
      password: decryptData(decoded.password)
    };
  } catch (error) {
    return null;
  }
} 