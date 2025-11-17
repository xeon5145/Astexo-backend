import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthDto } from './auth.dto';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from 'src/mailer/mailer.service';
import { RedisService } from 'src/redis/redis.service';
import { randomBytes, randomInt } from 'crypto';


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private readonly mailerService: MailerService,
        private readonly jwtService: JwtService,
        private redisService: RedisService,
        private redisClient: RedisService
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

    async register({ name, email }: AuthDto) {
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

        const userOTP = randomInt(100000, 999999).toString();
        const userData = JSON.stringify(
            {
                "name": name,
                "email": email,
                "account_type": account_type,
                "role": role,
                "otp": userOTP,
            });

        // Save user to database
        // await this.userRepository.save(newUser); will be adding user to db once email is verified

        // create a redis entry of user data
        const redis = this.redisService.getClient();
        const userToken = randomBytes(32).toString('hex');
        await redis.set(userToken, userData);
        // create a redis entry of user data

        const html = `<p>Your Account Created Successfully</p><a href="${process.env.FRONT_END_URL}/emal-verification?token=${userToken}">Verify Email</a>`;
        await this.mailerService.sendEmail(email, 'Welcome To Astexo', html);

        // Return success response
        return {
            status: 200,
            message: 'Registration successful',
        };
    }

}
