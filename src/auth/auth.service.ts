import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthDto, VerificationDto, verifiedDataDto } from './auth.dto';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from 'src/mailer/mailer.service';
import { RedisService } from 'src/redis/redis.service';
import { randomBytes, randomInt } from 'crypto';


@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

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

        const userData = JSON.stringify(
            {
                "name": name,
                "email": email,
                "account_type": account_type,
                "role": role,
            });

        // create a redis entry of user data
        const redis = this.redisService.getClient();
        const userToken = randomBytes(32).toString('hex');
        await redis.set(userToken, userData, 'EX', 300);
        // create a redis entry of user data

        const html = `<p>We have received a request to create account for Email : "${email}" , To verify you account creation please verify the email at link below .</p><a href="${process.env.FRONT_END_URL}/emal-verification?token=${userToken}">Verify Email</a>`;
        await this.mailerService.sendEmail(email, 'Astexo : Email Verification', html);

        // Return success response
        return {
            status: 200,
            message: 'Registration successful',
        };
    }

    async get_token_data({ token }: VerificationDto) {
        const redis = this.redisService.getClient();
        const userData = await redis.get(token);

        if (!userData) {
            throw new UnauthorizedException('Invalid or Expired token');
        } else {
            return {
                "data": JSON.parse(userData)
            };
        }
    }

    async create_verified_account({ user }: verifiedDataDto) {
        try {
            // Check if user already exists
            const existingUser = await this.userRepository.findOne({
                where: { email: user.email }
            });

            if (existingUser) {
                throw new UnauthorizedException('Email already exists');
            }

            // Add encryption to name , email and password before db insertion

            // Create new user
            const newUser = this.userRepository.create({
                name: user.name,
                email: user.email,
                password: user.password,
                account_type: user.account_type,
                role: user.role,
                status: 1 // Set as active
            });

            // Save user to database
            await this.userRepository.save(newUser);
            
            // Send welcome email
            const html = `<p>Hi ${user.name} ,</p>
                <p>Your account has been created successfully.</p>
                <p>Thank you for joining Astexo.</p>
                <p>Best regards,</p>
                <p>Astexo Team</p>
            `;
            await this.mailerService.sendEmail(user.email, 'Welcome To Astexo', html);

            // Return success response
            return {
                status: 200,
                message: 'Account verified successfully',
            };
        } catch (error) {
            throw error;
        }
    }

}
