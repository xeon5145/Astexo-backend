import { Injectable } from '@nestjs/common';
import { AuthDto } from './auth.dto';

@Injectable()
export class AuthService {
    async login({ email, password }: AuthDto) {
        if (email === 'abhisheksingh5145@outlook.com' && password === '123456') {
            return { message: 'Login successful', token: 'fake-jwt-token' };
        } else {
            return { message: 'Invalid credentials' };
        }
    }
}
