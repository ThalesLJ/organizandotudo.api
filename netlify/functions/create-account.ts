import { Handler } from "@netlify/functions";
import { connectToDatabase, closeConnection } from './config/mongodb';
import { UserDocument } from './types/mongodb';
import { hashPassword } from './utils/auth';
import { encryptData } from './utils/crypto';

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
        pt: { message: 'Corpo da requisição não fornecido', code: 'MissingBody' },
        en: { message: 'Request body not provided', code: 'MissingBody' }
      })
    };
  }

  try {
    const { username, email, password } = JSON.parse(event.body);

    if (!username || !email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          pt: { message: 'Campos obrigatórios não fornecidos', code: 'MissingFields' },
          en: { message: 'Required fields not provided', code: 'MissingFields' }
        })
      };
    }

    const { users } = await connectToDatabase();

    const encryptedUsername = encryptData(username);
    const existingUser = await users.findOne({ $or: [{ username: encryptedUsername }, { email }] });
    if (existingUser) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          pt: { message: 'Usuário ou email já existe', code: 'DuplicateUser' },
          en: { message: 'User or email already exists', code: 'DuplicateUser' }
        })
      };
    }

    const hashedPassword = await hashPassword(password);
    const encryptedPassword = encryptData(hashedPassword);
    const now = new Date();

    const newUser: UserDocument = {
      username: encryptedUsername,
      email,
      password: encryptedPassword,
      createdAt: now,
      updatedAt: now
    };

    await users.insertOne(newUser);
    await closeConnection();

    return {
      statusCode: 201,
      body: JSON.stringify({
        pt: { message: 'Conta criada com sucesso', code: 'Success' },
        en: { message: 'Account created successfully', code: 'Success' }
      })
    };
  } catch (error) {
    console.error('Erro ao criar conta:', error);
    await closeConnection();
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        pt: { message: 'Erro interno do servidor', code: 'ServerError' },
        en: { message: 'Internal server error', code: 'ServerError' }
      })
    };
  }
};

export { handler }; 