import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCurrentUser, ValidateImageFile } from '../common/decorators/file-validation.decorator';
import { User } from './entities/user.entity';

@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({
    summary: 'Obtener perfil del usuario actual',
    description: 'Obtiene la información del perfil del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario obtenido exitosamente',
  })
  async getProfile(@GetCurrentUser() user: User) {
    return this.usersService.getUserProfile(user.id);
  }

  @Patch('profile')
  @ApiOperation({
    summary: 'Actualizar perfil del usuario',
    description: 'Actualiza la información del perfil del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado exitosamente',
  })
  async updateProfile(
    @GetCurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.update(user.id, updateUserDto);
    return this.usersService.getUserProfile(updatedUser.id);
  }

  @Post('profile/photo')
  @UseInterceptors(FileInterceptor('photo'))
  @ApiOperation({
    summary: 'Subir foto de perfil',
    description: 'Sube o actualiza la foto de perfil del usuario autenticado',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Foto de perfil subida exitosamente',
  })
  async uploadProfilePhoto(
    @GetCurrentUser() user: User,
    @ValidateImageFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('No se proporcionó ningún archivo');
    }

    await this.usersService.updateProfilePhoto(user.id, file);
    return { message: 'Foto de perfil actualizada exitosamente' };
  }

  @Get('profile/photo')
  @ApiOperation({
    summary: 'Obtener foto de perfil del usuario actual',
    description: 'Obtiene la foto de perfil del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Foto de perfil obtenida exitosamente',
  })
  async getProfilePhoto(
    @GetCurrentUser() user: User,
    @Res() res: Response,
  ) {
    const { photo, mimeType } = await this.usersService.getProfilePhoto(user.id);
    
    res.set({
      'Content-Type': mimeType,
      'Content-Length': photo.length.toString(),
    });
    
    res.send(photo);
  }

  @Get(':id/photo')
  @ApiOperation({
    summary: 'Obtener foto de perfil de un usuario',
    description: 'Obtiene la foto de perfil de un usuario específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Foto de perfil obtenida exitosamente',
  })
  async getUserPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const { photo, mimeType } = await this.usersService.getProfilePhoto(id);
    
    res.set({
      'Content-Type': mimeType,
      'Content-Length': photo.length.toString(),
    });
    
    res.send(photo);
  }

  @Delete('profile/photo')
  @ApiOperation({
    summary: 'Eliminar foto de perfil',
    description: 'Elimina la foto de perfil del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Foto de perfil eliminada exitosamente',
  })
  async deleteProfilePhoto(@GetCurrentUser() user: User) {
    await this.usersService.deleteProfilePhoto(user.id);
    return { message: 'Foto de perfil eliminada exitosamente' };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener perfil de usuario por ID',
    description: 'Obtiene la información pública del perfil de un usuario específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario obtenido exitosamente',
  })
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getUserProfile(id);
  }
}