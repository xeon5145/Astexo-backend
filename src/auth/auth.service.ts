import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthDto } from './auth.dto';
import { User } from './entities/user.entity';
import { MailerService } from 'src/mailer/mailer.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private readonly mailerService: MailerService,
        private readonly jwtService: JwtService
    ) { }

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
        

        // Generate JWT token
        const payload = {
            name: user.name,
            email: user.email,
            account_type: user.account_type,
            role: user.role,
            id: user.id
        };
        const token = this.jwtService.sign(payload);


        // Return success response
        return {
            message: 'Login successful',
            token: token,
        };
    }

    async register({ name, email, password }: AuthDto) {
        // Check if user already exists
        const existingUser = await this.userRepository.findOne({
            where: { email }
        });

        if (existingUser) {
            throw new UnauthorizedException('Email already exists');
        }

        // Set account_type = 1 for new users as Client Group and role = 0 as business admin 
        const account_type = 1;
        const role = 0;

        // Create new user
        const newUser = this.userRepository.create({
            name,
            email,
            password,
            account_type,
            role
        });

        // Save user to database
        await this.userRepository.save(newUser);

        const html = `<p>Your Account Created Successfully</p>`;
        await this.mailerService.sendEmail(email, 'Password Reset', html);

        // Return success response
        return {
            message: 'Registration successful',
            user: {
                name: newUser.name,
                email: newUser.email,
                account_type: newUser.account_type,
                role: newUser.role
            }
        };
    }

}
