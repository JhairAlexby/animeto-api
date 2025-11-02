import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const ValidateImageFile = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const file = request.file;

    if (!file) {
      return null;
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipo de archivo no válido. Solo se permiten imágenes JPEG, PNG y WebP.',
      );
    }

    if (file.size > maxSize) {
      throw new BadRequestException(
        'El archivo es demasiado grande. El tamaño máximo es 5MB.',
      );
    }

    return file;
  },
);

export const GetCurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);