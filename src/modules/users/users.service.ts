import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EncryptionService } from '../common/services/encryption.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly encryptionService: EncryptionService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    return this.userModel.findOne({ username }).exec();
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByUsernameOrEmail(username: string, email: string): Promise<User> {
    return this.userModel.findOne({
      $or: [{ username }, { email }],
    }).exec();
  }

  async update(id: string, updateUserDto: Partial<UpdateUserDto>): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { ...updateUserDto, updatedAt: new Date() },
      { new: true },
    ).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async getProfile(userId: string) {
    const user = await this.findById(userId);
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    // Get current user to verify password
    const currentUser = await this.userModel.findById(userId).exec();
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await this.encryptionService.comparePassword(
      updateUserDto.password,
      currentUser.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    // Check if username or email already exists (excluding current user)
    if (updateUserDto.username) {
      const existingUser = await this.userModel.findOne({
        username: updateUserDto.username,
        _id: { $ne: userId },
      }).exec();
      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
    }

    if (updateUserDto.email) {
      const existingUser = await this.userModel.findOne({
        email: updateUserDto.email,
        _id: { $ne: userId },
      }).exec();
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // Remove password from update data (it's only for authentication)
    const { password, ...updateData } = updateUserDto;

    const user = await this.update(userId, updateData);
    return {
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        updatedAt: user.updatedAt,
      },
    };
  }
}
