import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse } from "@nestjs/swagger";
import { AppService } from "./app.service";
import { ApiInfoResponseDto } from "./api-info.response.dto";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOkResponse({ type: ApiInfoResponseDto })
  getInfo(): ApiInfoResponseDto {
    return this.appService.getInfo();
  }
}
