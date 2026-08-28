import { Injectable } from "@nestjs/common";
import { API_INFO, ApiInfoResponseDto } from "./api-info.response.dto";

@Injectable()
export class AppService {
  getInfo(): ApiInfoResponseDto {
    return API_INFO;
  }
}
