import { Handler } from "@netlify/functions";
import { connectToDatabase, closeConnection } from './config/mongodb';
import { encryptData, decryptData } from './utils/crypto';
import jwt from 'jsonwebtoken';
import { withCors } from './middleware/cors';

const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        pt: {
          message: "Método não permitido",
          code: "MethodNotAllowed"
        },
        en: {
          message: "Method not allowed",
          code: "MethodNotAllowed"
        }
      })
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        pt: { message: "Corpo da requisição não fornecido", code: "MissingBody" },
        en: { message: "Request body not provided", code: "MissingBody" }
      })
    };
  }

  try {
    const { username, password } = JSON.parse(event.body);

    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          pt: { message: "Username e senha são obrigatórios", code: "MissingFields" },
          en: { message: "Username and password are required", code: "MissingFields" }
        })
      };
    }

    const { users } = await connectToDatabase();
    const encryptedUsername = encryptData(username);
    const user = await users.findOne({ username: encryptedUsername });
    
    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          pt: { message: "Username ou senha inválidos", code: "InvalidCredentials" },
          en: { message: "Invalid username or password", code: "InvalidCredentials" }
        })
      };
    }

    try {
      const decryptedPassword = decryptData(user.password);
      const isValidPassword = password === decryptedPassword;
      
      if (!isValidPassword) {
        return {
          statusCode: 401,
          body: JSON.stringify({
            pt: { message: "Username ou senha inválidos", code: "InvalidCredentials" },
            en: { message: "Invalid username or password", code: "InvalidCredentials" }
          })
        };
      }

      const tokenData = {
        username: user.username,
        email: user.email,
        password: user.password,
        issuedAt: new Date().toISOString()
      };

      const token = jwt.sign(
        tokenData,
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '30d' }
      );

      await users.updateOne(
        { _id: user._id },
        { $set: { token } }
      );

      await closeConnection();

      const response = {
        token,
        username: decryptData(user.username),
        email: decryptData(user.email)
      };

      return {
        statusCode: 200,
        body: JSON.stringify(response)
      };
    } catch (decryptError) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          pt: { message: "Erro ao processar credenciais", code: "InvalidCredentials" },
          en: { message: "Error processing credentials", code: "InvalidCredentials" }
        })
      };
    }
  } catch (error) {
    await closeConnection();
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        pt: { message: "Erro interno do servidor", code: "ServerError" },
        en: { message: "Internal server error", code: "ServerError" }
      })
    };
  }
};

const corsHandler = withCors(handler);
export { corsHandler as handler }; 