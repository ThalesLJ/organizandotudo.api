import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";

export interface CorsOptions {
  allowedOrigins?: string[];
  allowedMethods?: string[];
  allowedHeaders?: string[];
  allowCredentials?: boolean;
  maxAge?: number;
}

export const defaultCorsOptions: CorsOptions = {
  allowedOrigins: [
    "http://localhost:3000",
    "https://organizandotudo-staging.netlify.app",
    "https://organizandotudo.netlify.app"
  ],
  allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin"
  ],
  allowCredentials: true,
  maxAge: 86400
};

export function withCors(
  handler: Handler,
  options: CorsOptions = {}
): Handler {
  const corsOptions = { ...defaultCorsOptions, ...options };

  return async (event: HandlerEvent, context: HandlerContext) => {
    const origin = event.headers.origin || event.headers.Origin;
    const method = event.httpMethod;

    const corsHeaders: Record<string, string> = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400"
    };

    if (method === "OPTIONS") {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: ""
      };
    }

    try {
      const response = await handler(event, context);
      
      if (response && typeof response === "object") {
        return {
          ...response,
          headers: {
            ...corsHeaders,
            ...(response.headers || {})
          }
        };
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: ""
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          pt: { message: "Erro interno do servidor", code: "ServerError" },
          en: { message: "Internal server error", code: "ServerError" }
        })
      };
    }
  };
}
