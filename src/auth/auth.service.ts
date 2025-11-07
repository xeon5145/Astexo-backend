import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthDto } from './auth.dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async login({ email, password }: AuthDto) {

        // Find user by email
        const user = await this.userRepository.findOne({
            where: { email }
        });

        // Check if user exists
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if user is active (allow null or 0 as active for now)
        if (user.status !== 1) {
            throw new UnauthorizedException('Account is inactive or blocked');
        }

        // Verify password (plain text comparison - you should use bcrypt in production)
        if (user.password !== password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Return success response
        return {
            message: 'Login successful',
            // token: 'fake-jwt-token', // Replace with actual JWT token generation
            user: {
                name: user.name,
                email: user.email,
                account_type: user.account_type,
                role: user.role
            }
        };
    }
}
