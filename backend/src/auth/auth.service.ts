import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PortalUser } from '../entities';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(PortalUser)
    private userRepo: Repository<PortalUser>,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const payload = {
      sub: user.id,
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      assignedOfficeCode: user.assignedOfficeCode,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        userId: user.userId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        assignedOfficeCode: user.assignedOfficeCode,
      },
    };
  }

  async findById(id: string): Promise<PortalUser> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findAll(): Promise<PortalUser[]> {
    return this.userRepo.find();
  }

  async createUser(data: Partial<PortalUser>): Promise<PortalUser> {
    if (data.passwordHash) {
      data.passwordHash = await bcrypt.hash(data.passwordHash, 10);
    }
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async updateUser(id: string, data: Partial<PortalUser>): Promise<PortalUser> {
    if (data.passwordHash) {
      data.passwordHash = await bcrypt.hash(data.passwordHash, 10);
    }
    await this.userRepo.update(id, data);
    return this.userRepo.findOne({ where: { id } });
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepo.delete(id);
  }
}
