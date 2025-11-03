import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PublicacionesService } from './publicaciones.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Publicaciones')
@Controller('api/publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Get('completas')
  @Public()
  @ApiOperation({
    summary: 'Obtiene publicaciones con reacciones y comentarios',
    description:
      'Retorna un listado paginado de publicaciones con datos básicos, autor, reacciones (tipo y usuario) y comentarios (contenido, fecha y usuario).',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página (default 1)', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Resultados por página (default 10)', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Listado de publicaciones completas',
    schema: {
      example: {
        success: true,
        message: 'Operación exitosa',
        data: {
          publicaciones: [
            {
              id: 'uuid-post',
              description: 'Contenido de la publicación',
              createdAt: '2024-01-01T12:00:00.000Z',
              hasImage: true,
              imageUrl: '/posts/uuid-post/image',
              author: { id: 'uuid-user', name: 'Autor' },
              reactions: [
                { type: 'LIKE', createdAt: '2024-01-01T12:01:00.000Z', user: { id: 'uuid-user', name: 'Usuario' } },
              ],
              comments: [
                { id: 'uuid-comment', content: 'Buen post', createdAt: '2024-01-01T12:02:00.000Z', user: { id: 'uuid-user', name: 'Usuario' } },
              ],
            },
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
        timestamp: '2024-01-01T12:00:00.000Z',
      },
    },
  })
  async getCompletas(@Query() pagination: PaginationDto) {
    return await this.publicacionesService.getCompletas(pagination);
  }
}