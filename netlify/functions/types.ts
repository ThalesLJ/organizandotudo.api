export interface ApiResponse {
  pt: {
    message: string;
    code: string;
  };
  en: {
    message: string;
    code: string;
  };
}

export interface ErrorResponse extends ApiResponse {
  pt: {
    message: string;
    code: "Erro durante processamento";
  };
  en: {
    message: string;
    code: "Error during processing";
  };
}

export interface SuccessResponse extends ApiResponse {
  pt: {
    message: string;
    code: "Sucesso";
  };
  en: {
    message: string;
    code: "Success";
  };
}

export interface CreateAccountRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  email: string;
}

export interface UserResponse {
  username: string;
  email: string;
}

export interface UpdateUserRequest {
  data: {
    username: string;
    email: string;
    password: string;
  };
}

export interface CreateNoteRequest {
  note: {
    title: string;
    content: string;
    public?: boolean;
  };
}

export interface UpdateNoteRequest {
  newNote: {
    title: string;
    content: string;
    public?: boolean;
  };
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: number;
  public: boolean;
} 