import { jokeService } from './jokeService';

class BackgroundJobService {
  private static instance: BackgroundJobService;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly JOB_INTERVAL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): BackgroundJobService {
    if (!BackgroundJobService.instance) {
      BackgroundJobService.instance = new BackgroundJobService();
    }
    return BackgroundJobService.instance;
  }

  start(): void {
    if (this.intervalId) {
      console.log('Background job already running');
      return;
    }

    console.log('Starting background joke generation job...');
    
    // Run immediately
    this.runJob();
    
    // Then schedule periodic runs
    this.intervalId = setInterval(() => {
      this.runJob();
    }, this.JOB_INTERVAL);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Background job stopped');
    }
  }

  private async runJob(): Promise<void> {
    try {
      console.log('Running background joke generation...');
      
      // Generate mixed batches of jokes
      for (let i = 0; i < 3; i++) {
        try {
          console.log(`Generating batch ${i + 1}/3...`);
          // Generate a mixed batch of API and Gemini jokes
          await jokeService.generateJokesBatch();
          
          // Small delay between batches to avoid rate limits
          await this.delay(3000);
        } catch (error) {
          console.error(`Error generating joke batch ${i + 1}:`, error);
        }
      }
      
      console.log('Background job completed successfully');
    } catch (error) {
      console.error('Background job failed:', error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const backgroundJobService = BackgroundJobService.getInstance(); 