import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { ValidateImageFile } from '../common/decorators/file-validation.decorator';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @UseInterceptors(FileInterceptor('profilePhoto'))
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description: 'Registra un nuevo usuario en el sistema con foto de perfil opcional',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Datos de registro del usuario',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Nombre completo del usuario',
          example: 'Juan Pérez',
        },
        email: {
          type: 'string',
          format: 'email',
          description: 'Correo electrónico del usuario',
          example: 'juan@example.com',
        },
        password: {
          type: 'string',
          description: 'Contraseña del usuario',
          example: 'MiPassword123',
        },
        profilePhoto: {
          type: 'string',
          format: 'binary',
          description: 'Foto de perfil (opcional)',
        },
      },
      required: ['name', 'email', 'password'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Operación exitosa' },
        data: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'uuid' },
                name: { type: 'string', example: 'Juan Pérez' },
                email: { type: 'string', example: 'juan@example.com' },
                createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                hasProfilePhoto: { type: 'boolean', example: true },
              },
            },
            accessToken: { type: 'string', example: 'jwt-token' },
          },
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Datos de entrada inválidos' },
        errors: {
          type: 'array',
          items: {
            type: 'string',
            example: 'La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'
          }
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'El correo electrónico ya está registrado',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'El correo electrónico ya está registrado' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  async register(
    @Body() registerDto: RegisterDto,
    @ValidateImageFile() profilePhoto?: Express.Multer.File,
  ) {
    return this.authService.register(registerDto, profilePhoto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Autentica un usuario y devuelve un token de acceso',
  })
  @ApiBody({
    description: 'Credenciales de inicio de sesión',
    type: LoginDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Operación exitosa' },
        data: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'uuid' },
                name: { type: 'string', example: 'Juan Pérez' },
                email: { type: 'string', example: 'juan@example.com' },
                createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                hasProfilePhoto: { type: 'boolean', example: true },
              },
            },
            accessToken: { type: 'string', example: 'jwt-token' },
          },
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Credenciales inválidas' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Datos de entrada inválidos' },
        errors: {
          type: 'array',
          items: {
            type: 'string',
            example: 'El correo electrónico es obligatorio'
          }
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}