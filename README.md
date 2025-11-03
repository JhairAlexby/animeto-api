# Animeto API

API backend para una red social de manga y anime desarrollada con NestJS, TypeORM y PostgreSQL.

## Características

- **Autenticación JWT**: Sistema seguro de registro y login
- **Gestión de usuarios**: Perfiles con fotos almacenadas en base de datos
- **Sistema de publicaciones**: Posts con imágenes, etiquetas y filtros
- **Comentarios anidados**: Sistema de comentarios con respuestas
- **Reacciones**: Sistema de likes y dislikes para posts y comentarios
- **Documentación Swagger**: API completamente documentada
- **Seguridad**: Rate limiting, CORS, validaciones y protección contra inyecciones
- **Compatible con Flutter**: Respuestas JSON estandarizadas

## Tecnologías

- **Framework**: NestJS 11.x
- **Base de datos**: PostgreSQL
- **ORM**: TypeORM
- **Autenticación**: JWT con Passport
- **Documentación**: Swagger/OpenAPI
- **Validaciones**: class-validator y class-transformer
- **Seguridad**: bcryptjs, rate limiting, CORS

## Requisitos previos

- Node.js 18+ 
- PostgreSQL 12+
- pnpm (recomendado) o npm

## Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd animeto-api
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Editar el archivo `.env` con tus configuraciones:
   ```env
   # Database Configuration
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=tu_usuario
   DATABASE_PASSWORD=tu_contraseña
   DATABASE_NAME=animeto_db

   # JWT Configuration
   JWT_SECRET=tu-clave-secreta-muy-segura
   JWT_EXPIRES_IN=7d

   # Application Configuration
   PORT=3000
   NODE_ENV=development

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000,http://localhost:8080
   ```

4. **Crear la base de datos**
   ```sql
   CREATE DATABASE animeto_db;
   ```

5. **Ejecutar la aplicación**
   ```bash
   # Desarrollo
   pnpm run start:dev

   # Producción
   pnpm run build
   pnpm run start:prod
   ```

## Estructura del proyecto

```
src/
├── auth/                 # Módulo de autenticación
│   ├── dto/             # DTOs para registro y login
│   ├── guards/          # Guards JWT y local
│   ├── strategies/      # Estrategias de Passport
│   └── decorators/      # Decoradores personalizados
├── users/               # Módulo de usuarios
│   ├── entities/        # Entidad User
│   ├── dto/            # DTOs para usuarios
│   └── ...
├── posts/               # Módulo de publicaciones
│   ├── entities/        # Entidad Post
│   ├── dto/            # DTOs para posts
│   └── ...
├── comments/            # Módulo de comentarios
│   ├── entities/        # Entidad Comment
│   ├── dto/            # DTOs para comentarios
│   └── ...
├── reactions/           # Módulo de reacciones
│   ├── entities/        # Entidad Reaction
│   ├── dto/            # DTOs para reacciones
│   └── ...
├── common/              # Utilidades comunes
│   ├── dto/            # DTOs compartidos
│   ├── decorators/     # Decoradores personalizados
│   ├── filters/        # Filtros de excepción
│   └── interceptors/   # Interceptores
├── config/              # Configuraciones
└── database/            # Configuración de base de datos
```

## API Endpoints

### Autenticación
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión

### Usuarios
- `GET /users/profile` - Obtener perfil actual
- `PATCH /users/profile` - Actualizar perfil
- `POST /users/profile/photo` - Subir foto de perfil
- `GET /users/profile/photo` - Obtener foto de perfil
- `GET /users/:id` - Obtener perfil público

### Posts
- `POST /posts` - Crear post
- `GET /posts` - Listar posts con filtros
- `GET /posts/:id` - Obtener post específico
- `PATCH /posts/:id` - Actualizar post
- `DELETE /posts/:id` - Eliminar post
- `GET /posts/:id/image` - Obtener imagen del post

### Comentarios
- `POST /comments` - Crear comentario
- `GET /comments/post/:postId` - Obtener comentarios de un post
- `GET /comments/:id/replies` - Obtener respuestas de un comentario
- `PATCH /comments/:id` - Actualizar comentario
- `DELETE /comments/:id` - Eliminar comentario

### Reacciones
- `POST /reactions` - Crear/actualizar reacción
- `GET /reactions/post/:postId` - Obtener reacciones de un post
- `GET /reactions/comment/:commentId` - Obtener reacciones de un comentario

## Documentación API

La documentación completa de la API está disponible en Swagger:
- **URL**: `http://localhost:3000/api/docs`
- **Autenticación**: Incluye soporte para JWT Bearer tokens
- **Ejemplos**: Todos los endpoints incluyen ejemplos de request/response

## Seguridad

### Autenticación
- JWT tokens con expiración configurable
- Contraseñas hasheadas con bcryptjs (salt rounds: 12)
- Validación de formato de email y contraseña

### Rate Limiting
- 3 requests por segundo (burst corto)
- 20 requests por 10 segundos (burst medio)
- 100 requests por minuto (límite general)

### Validaciones
- Validación automática de DTOs
- Sanitización de inputs
- Protección contra inyecciones SQL (TypeORM)

### CORS
- Configurado para dominios específicos
- Headers permitidos: Content-Type, Authorization

## Base de datos

### Entidades principales

1. **User**: Usuarios del sistema
   - Información personal y credenciales
   - Foto de perfil almacenada como BYTEA

2. **Post**: Publicaciones
   - Descripción, imagen, tipo (anime/manga/manhwa)
   - Etiquetas, contadores de reacciones

3. **Comment**: Comentarios anidados
   - Soporte para respuestas (parent-child)
   - Contadores de reacciones

4. **Reaction**: Likes y dislikes
   - Para posts y comentarios
   - Constraint único por usuario/elemento

### Relaciones
- User → Posts (1:N)
- User → Comments (1:N)
- User → Reactions (1:N)
- Post → Comments (1:N)
- Post → Reactions (1:N)
- Comment → Replies (1:N, self-referencing)
- Comment → Reactions (1:N)

## Scripts disponibles

```bash
# Desarrollo
pnpm run start:dev      # Modo desarrollo con hot reload
pnpm run start:debug    # Modo debug

# Producción
pnpm run build          # Compilar aplicación
pnpm run start:prod     # Ejecutar en producción

# Testing
pnpm run test           # Tests unitarios
pnpm run test:e2e       # Tests end-to-end
pnpm run test:cov       # Coverage de tests

# Linting y formato
pnpm run lint           # ESLint
pnpm run format         # Prettier
```

## Despliegue

### Variables de entorno para producción
```env
NODE_ENV=production
DATABASE_HOST=tu-host-produccion
DATABASE_SSL=true
JWT_SECRET=clave-super-secreta-produccion
CORS_ORIGIN=https://tu-dominio.com
```

## Compatibilidad con Flutter

La API está diseñada específicamente para ser consumida por aplicaciones Flutter:

- **Respuestas estandarizadas**: Todas las respuestas siguen el formato:
  ```json
  {
    "success": true,
    "message": "Operación exitosa",
    "data": { ... },
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
  ```

- **Manejo de errores consistente**
- **Paginación estándar**
- **Imágenes como BLOB en base de datos**
- **CORS configurado para desarrollo móvil**

## Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Para soporte técnico o preguntas:
- Crear un issue en GitHub
- Revisar la documentación Swagger
- Consultar los logs de la aplicación

---

**Desarrollado con ❤️ usando NestJS**
