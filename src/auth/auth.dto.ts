export class AuthDto {
    email: string;
    password: string;
    name: string;
    account_type: 1;
}

export class LoginDto {
    email: string;
    password: string;
}

export class VerificationDto {
    token: string;
}

export class verifiedDataDto {
    user: {
        name: string;
        email: string;
        account_type: number;
        role: number;
        password: string
    }
}

export class forgotPasswordDto {
    email: string;
}