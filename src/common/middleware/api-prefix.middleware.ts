import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ApiPrefixMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const originalUrl = req.originalUrl;
    
    // Rutas excluidas de la redirección
    const excludedRoutes = [
      '/api',
      '/health',
      '/docs',
      '/swagger',
      '/api-json',
      '/api-yaml',
      '/',
      '/favicon.ico'
    ];
    
    // Verificar si la ruta está excluida
    const isExcluded = excludedRoutes.some(route => 
      originalUrl === route || originalUrl.startsWith(route + '/')
    );
    
    // Si la ruta no comienza con /api y no está excluida
    if (!originalUrl.startsWith('/api') && !isExcluded) {
      // Construir la nueva URL con el prefijo /api
      const newUrl = `/api${originalUrl}`;
      
      // Redirigir con código 301 (moved permanently)
      return res.redirect(301, newUrl);
    }
    
    next();
  }
}