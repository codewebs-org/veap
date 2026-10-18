import { logger, ServiceProvider } from "@veap/kernel";
import { GreetingService } from "../services/greeting.service.js";

export class AppServiceProvider extends ServiceProvider {
  override register(): void {
    this.container.register({
      token: GreetingService,
      useClass: GreetingService,
      singleton: true,
    });
  }

  override async boot(): Promise<void> {
    logger.info("app:provider", "AppServiceProvider booted successfully.");
  }
}
