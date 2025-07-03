/**
 * Rate Limiter Utility
 * Implementa rate limiting para proteger endpoints de API
 */

interface RateLimitConfig {
  windowMs: number; // Ventana de tiempo en milisegundos
  maxRequests: number; // Máximo número de requests por ventana
  message?: string; // Mensaje de error personalizado
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      message: 'Too many requests, please try again later.',
      ...config,
    };
  }

  /**
   * Verifica si una IP o identificador ha excedido el límite
   */
  isRateLimited(identifier: string): { limited: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.store[identifier];

    // Si no hay registro o la ventana ha expirado, crear uno nuevo
    if (!record || now > record.resetTime) {
      this.store[identifier] = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };
      return {
        limited: false,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs,
      };
    }

    // Si el contador ha excedido el límite
    if (record.count >= this.config.maxRequests) {
      return {
        limited: true,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }

    // Incrementar contador
    record.count++;
    return {
      limited: false,
      remaining: this.config.maxRequests - record.count,
      resetTime: record.resetTime,
    };
  }

  /**
   * Limpia registros expirados para evitar memory leaks
   */
  cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (now > this.store[key].resetTime) {
        delete this.store[key];
      }
    });
  }

  /**
   * Obtiene estadísticas del rate limiter
   */
  getStats(): { totalIdentifiers: number; config: RateLimitConfig } {
    return {
      totalIdentifiers: Object.keys(this.store).length,
      config: this.config,
    };
  }
}

// Instancias predefinidas para diferentes tipos de endpoints
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 5, // 5 intentos de login por 15 minutos
  message: 'Too many login attempts, please try again in 15 minutes.',
});

export const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  maxRequests: 60, // 60 requests por minuto
  message: 'Too many API requests, please slow down.',
});

export const contactRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  maxRequests: 3, // 3 formularios de contacto por hora
  message: 'Too many contact form submissions, please try again later.',
});

// Limpiar registros expirados cada 5 minutos
setInterval(() => {
  authRateLimiter.cleanup();
  apiRateLimiter.cleanup();
  contactRateLimiter.cleanup();
}, 5 * 60 * 1000);

export default RateLimiter; 