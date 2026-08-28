import { Controller, Get } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import {
  HealthService,
  LivenessStatus,
  ReadinessStatus,
} from "./health.service";

@SkipThrottle()
@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get("live")
  live(): LivenessStatus {
    return this.healthService.live();
  }

  @Get("ready")
  ready(): Promise<ReadinessStatus> {
    return this.healthService.ready();
  }
}
