import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from '../common/dto/users/create-user.dto';
import { UpdateUserDto } from '../common/dto/users/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOneById(@Param() params: any) {
    return this.userService.findOneById(params.id);
  }

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Put(':id')
  update(@Param() params: any, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateById(params.id, updateUserDto);
  }

  @Delete(':id')
  delete(@Param() params: any) {
    return this.userService.deleteById(params.id);
  }
}
