import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class EmailService {
  private transporter;
  constructor(private jwtService: JwtService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GOOGLE_USER,
        pass: process.env.GOOGLE_APP_PASSWORD,
      },
    });
  }

  async sendMail(options: any) {
    console.log(`Email sent out to ${options.to}`);
    await this.transporter.sendMail(options);
  }

  async sendResetPassword(email: string, token: string) {
    const resetPassUrl = `${process.env.FRONTEND}/auth/reset-password?token=${token}`;
    const options = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Bunnies - Reset Password',
      text: `Halo! Kami mendapatkan permintaan reset password untuk akun ${email}. Jika Anda benar mengirim permintaan ini, silakan lakukan reset password menggunakan link:\n${resetPassUrl}\n\nLink akan kadaluarsa dalam 15 menit.`,
    };
    return await this.sendMail(options);
  }
}
