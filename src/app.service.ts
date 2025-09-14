import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiInfo() {
    return {
      name: 'Organizando Tudo API',
      version: '1.0.0',
      description: 'API robusta para organização de notas pessoais',
      author: 'ThalesLJ',
      documentation: '/api/docs',
      health: '/health',
    };
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
