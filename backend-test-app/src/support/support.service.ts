import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { SupportDto } from './dto/support.dto';

@Injectable()
export class SupportService {
  private readonly resend = new Resend(
    process.env.RESEND_API_KEY,
  );

  async send(dto: SupportDto) {
    const result = await this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.SUPPORT_EMAIL!,
      subject: 'Support Request',
      html: `
        <h2>Новая заявка</h2>

        <p><b>Имя:</b> ${dto.name}</p>
        <p><b>Email:</b> ${dto.email}</p>

        <p><b>Сообщение:</b></p>
        <p>${dto.message}</p>
      `,
    });

    return result;
  }
}