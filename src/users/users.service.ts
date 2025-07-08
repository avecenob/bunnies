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

  /**
   *
   * extract method for checking valid user
   *
   * @param key {string} user id or email
   * @returns {User} data
   */
  async validUser(key: string) {
    const user = await this.userRepository.findOne({
      where: [{ id: key }, { email: key }],
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return user;
  }

  async checkRegistered(email: string) {
    if (await this.validUser(email)) {
      throw new ConflictException('email already registered');
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

    return {
      status: HttpStatus.CREATED,
      message: 'user created',
      data: user,
    };
  }

  async findAll() {
    const users: User[] = await this.userRepository.find();

    return {
      status: HttpStatus.OK,
      message: 'success',
      data: users,
    };
  }

  async findOneById(id: string) {
    const user = await this.validUser(id);

    return {
      status: HttpStatus.OK,
      message: 'user found',
      data: user,
    };
  }

  async findOneByEmail(email: string) {
    const user = await this.validUser(email);

    return {
      status: HttpStatus.OK,
      message: 'user found',
      data: user,
    };
  }

  async updateById(id: string, updateUserDto: UpdateUserDto) {
    const userToUpdate = await this.validUser(id);

    const { email, password, address, phoneNumber } = updateUserDto;
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    try {
      await this.userRepository.update(userToUpdate.id, {
        ...(email && { email }),
        ...(password && { password: hashedPassword }),
        ...(address && { address }),
        ...(phoneNumber && { phoneNumber }),
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

    return {
      status: HttpStatus.OK,
      message: `user with id: ${userToUpdate.id} updated`,
    };
  }

  async deleteById(id: string) {
    const userToDelete = await this.validUser(id);

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
