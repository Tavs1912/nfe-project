
export const generateToken = (user) => {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const payload = {
    id: user.id,
    email: user.email,
    papel: user.papel,
    empresa: user.empresa,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
  };

  // Simulação de JWT (em produção, usar biblioteca adequada)
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = btoa(`${encodedHeader}.${encodedPayload}.secret`);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export const verifyToken = (token) => {
  try {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Verificar expiração
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
};

export const hasPermission = (userRole, requiredRole) => {
  const roleHierarchy = {
    'administrador': 3,
    'operador': 2,
    'fornecedor': 1
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};
