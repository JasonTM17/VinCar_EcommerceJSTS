import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}
  async register(email: string, password: string, name: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('Email already registered');
    const hash = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({ data: { email, passwordHash: hash, name } });
    return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token: this.sign(user) };
  }
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new UnauthorizedException('Invalid credentials');
    return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token: this.sign(user) };
  }
  private sign(user: { id: string; email: string; role: string }) {
    return this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
  }
}
