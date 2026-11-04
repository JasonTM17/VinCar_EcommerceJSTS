import { Body, Controller, Headers, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
@Controller('webhooks/payments/mock')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}
  @Post()
  handle(@Body() body: unknown, @Headers('x-signature') signature = '') {
    return this.payments.handleWebhook(JSON.stringify(body), signature);
  }
}
