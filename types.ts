
export interface AuthData {
  token: string;
  clientId: string;
  email: string;
}

export interface ApiError {
  erro: string;
  code?: string;
}

export interface Order {
  cliente: string;
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    referencia?: string;
  };
  itens: Record<string, any>;
  telefone: string;
  valor_total: number;
  pagamento: string;
  taxa?: number;
}
