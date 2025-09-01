import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Chave secreta para comunicação interna (deve ser a mesma em todos os microserviços)
export const INTERNAL_JWT_SECRET = process.env.INTERNAL_JWT_SECRET || generateSecureSecret();

// Chave para assinatura do gateway
export const GATEWAY_SECRET = process.env.GATEWAY_SECRET || generateSecureSecret();

export const INTERNAL_JWT_CONFIG = {
  secret: INTERNAL_JWT_SECRET,
  issuer: 'ecommerce-api-gateway',
  audience: 'ecommerce-microservices',
  expiresIn: '5m' as const // Token de curta duração para segurança
};

export interface InternalUserContext {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

/**
 * Gera um token JWT interno seguro para comunicação entre Gateway e microserviços
 */
export const generateInternalToken = (user: User): string => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    timestamp: Date.now()
  };

  const options: jwt.SignOptions = {
    issuer: INTERNAL_JWT_CONFIG.issuer,
    audience: INTERNAL_JWT_CONFIG.audience,
    expiresIn: INTERNAL_JWT_CONFIG.expiresIn,
    jwtid: generateJwtId()
  };

  return jwt.sign(payload, INTERNAL_JWT_CONFIG.secret, options);
};

/**
 * Verifica e decodifica um token JWT interno
 */
export const verifyInternalToken = (token: string): InternalUserContext => {
  try {
    return jwt.verify(token, INTERNAL_JWT_CONFIG.secret, {
      issuer: INTERNAL_JWT_CONFIG.issuer,
      audience: INTERNAL_JWT_CONFIG.audience
    }) as InternalUserContext;
  } catch (error) {
    throw new Error(`Invalid internal token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Gera uma assinatura HMAC para verificar a origem do Gateway
 */
export const generateGatewaySignature = (method: string, url: string, timestamp: number): string => {
  const payload = `${method}:${url}:${timestamp}`;
  return crypto
    .createHmac('sha256', GATEWAY_SECRET)
    .update(payload)
    .digest('hex');
};

/**
 * Verifica a assinatura do Gateway
 */
export const verifyGatewaySignature = (
  signature: string, 
  method: string, 
  url: string, 
  timestamp: number
): boolean => {
  const expectedSignature = generateGatewaySignature(method, url, timestamp);
  
  // Verificar se o timestamp não é muito antigo (5 minutos)
  const maxAge = 5 * 60 * 1000; // 5 minutos
  if (Date.now() - timestamp > maxAge) {
    return false;
  }
  
  // Comparação segura contra timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};

/**
 * Gera uma chave secreta segura
 */
function generateSecureSecret(): string {
  const secret = crypto.randomBytes(64).toString('hex');
  console.warn('⚠️  Using auto-generated secret. Set INTERNAL_JWT_SECRET and GATEWAY_SECRET in production!');
  return secret;
}

/**
 * Gera um ID único para JWT
 */
function generateJwtId(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Lista de IPs permitidos para acessar microserviços diretamente
 * Em produção, isso deve ser configurado para incluir apenas o Gateway
 */
export const ALLOWED_GATEWAY_IPS = process.env.ALLOWED_GATEWAY_IPS?.split(',') || [
  '127.0.0.1',
  '::1',
  'localhost',
  '172.18.0.0/16', // Docker default network
  '10.0.0.0/8'     // Kubernetes default network
];

/**
 * Verifica se um IP está na lista de IPs permitidos
 */
export const isAllowedGatewayIP = (ip: string): boolean => {
  // Remover prefixos IPv6-to-IPv4
  const cleanIP = ip.replace(/^::ffff:/, '');
  
  return ALLOWED_GATEWAY_IPS.some(allowedIP => {
    if (allowedIP.includes('/')) {
      // CIDR notation
      return isIPInCIDR(cleanIP, allowedIP);
    }
    return cleanIP === allowedIP || allowedIP === 'localhost';
  });
};

/**
 * Verifica se um IP está em uma faixa CIDR
 */
function isIPInCIDR(ip: string, cidr: string): boolean {
  try {
    const [network, prefixLength] = cidr.split('/');
    const ipNum = ipToNumber(ip);
    const networkNum = ipToNumber(network);
    const mask = (-1 << (32 - parseInt(prefixLength))) >>> 0;
    
    return (ipNum & mask) === (networkNum & mask);
  } catch {
    return false;
  }
}

/**
 * Converte IP para número
 */
function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}
