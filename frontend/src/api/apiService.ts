// apiService.ts
export const API_URL = 'http://localhost:8000/api/';

export const fetchWithToken = async (endpoint: string) => {
  const token = localStorage.getItem("token"); // pega o token salvo no login
  if (!token) throw new Error("Usuário não autenticado");

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // envia o token
    },
  });

  if (!response.ok) {
    throw new Error(`Erro: ${response.status}`);
  }

  return response.json();
};
