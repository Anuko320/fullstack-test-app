import { Body, Controller, Post } from '@nestjs/common';
import { SupportDto } from './dto/support.dto';
import { SupportService } from './support.service';

@Controller('support')
export class SupportController {
  constructor(
    private readonly supportService: SupportService,
  ) {}

  @Post()
  send(@Body() dto: SupportDto) {
    return this.supportService.send(dto);
  }
}