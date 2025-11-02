import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'name', 'email', 'createdAt', 'updatedAt', 'isActive'],
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'password', 'profilePhoto', 'profilePhotoMimeType', 'createdAt', 'updatedAt', 'isActive'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password', 'profilePhoto', 'profilePhotoMimeType', 'createdAt', 'updatedAt', 'isActive'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async updateProfilePhoto(id: string, file: Express.Multer.File): Promise<User> {
    const user = await this.findById(id);
    
    user.profilePhoto = file.buffer;
    user.profilePhotoMimeType = file.mimetype;
    
    return this.userRepository.save(user);
  }

  async getProfilePhoto(id: string): Promise<{ photo: Buffer; mimeType: string | null }> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['profilePhoto', 'profilePhotoMimeType'],
    });

    if (!user || !user.profilePhoto) {
      throw new NotFoundException('Foto de perfil no encontrada');
    }

    return {
      photo: user.profilePhoto,
      mimeType: user.profilePhotoMimeType,
    };
  }

  async deleteProfilePhoto(id: string): Promise<User> {
    const user = await this.findById(id);
    
    user.profilePhoto = null;
    user.profilePhotoMimeType = null;
    
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.remove(user);
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.findById(id);
    user.isActive = false;
    return this.userRepository.save(user);
  }

  async activate(id: string): Promise<User> {
    const user = await this.findById(id);
    user.isActive = true;
    return this.userRepository.save(user);
  }

  async getUserProfile(id: string) {
    const user = await this.findById(id);
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      hasProfilePhoto: !!user.profilePhoto,
      isActive: user.isActive,
    };
  }
}