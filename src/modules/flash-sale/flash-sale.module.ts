import { Module } from '@nestjs/common';
import { FlashSaleController } from './flash-sale.controller';
import { FlashSaleService } from './flash-sale.service';

@Module({
  controllers: [FlashSaleController],
  providers: [FlashSaleService]
})
export class FlashSaleModule {}
