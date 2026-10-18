export interface GreetingMessage {
  message: string;
  recipient: string;
  timestamp: string;
}

export class GreetingService {
  public greet(name = "World"): GreetingMessage {
    return {
      message: `Hello, ${name}! Welcome to Veap + Hono.`,
      recipient: name,
      timestamp: new Date().toISOString(),
    };
  }
}
