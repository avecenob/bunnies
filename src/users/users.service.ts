import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../common/dto/users/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { UpdateUserDto } from '../common/dto/users/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async checkRegistered(email: string) {
    if (await this.findOne(email)) {
      throw new ConflictException('Email ini sudah terdaftar');
    }

    return null;
  }

  async create(createUserDto: CreateUserDto) {
    const { email, password, role, name } = createUserDto;

    await this.checkRegistered(email);

    const hashedPassword: string = await bcrypt.hash(password, 10);
    const id: string = nanoid(10);
    const user: User = this.userRepository.create({
      id,
      email,
      name,
      password: hashedPassword,
      role,
    });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    return user;
  }

  async findAll() {
    const users: User[] = await this.userRepository.find();

    return {
      status: HttpStatus.OK,
      message: 'success',
      data: users,
    };
  }

  async findOne(key: string) {
    const user = await this.userRepository.findOne({
      where: [{ id: key }, { email: key }, { resetToken: key }],
    });

    return user;
  }

  async updateById(id: string, updateUserDto: UpdateUserDto) {
    const userToUpdate = await this.findOne(id);

    if (!userToUpdate) {
      throw new NotFoundException(`User with id: ${id} not found`);
    }

    try {
      await this.userRepository.update(userToUpdate.id, updateUserDto);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    return {
      status: HttpStatus.OK,
      message: `user with id: ${userToUpdate.id} updated`,
    };
  }

  async updatePassword() {}

  async deleteById(id: string) {
    const userToDelete = await this.findOne(id);

    if (!userToDelete) {
      throw new NotFoundException(`User with id: ${id} not found`);
    }

    try {
      await this.userRepository.delete(userToDelete.id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    return {
      status: HttpStatus.OK,
      message: `user with ${userToDelete.id}  deleted`,
    };
  }
}
