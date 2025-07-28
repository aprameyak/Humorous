import { jokeService } from './jokeService';

class BackgroundJobService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private readonly JOB_INTERVAL = 5 * 60 * 1000; // 5 minutes

  start(): void {
    if (this.isRunning) {
      console.log('Background job already running');
      return;
    }

    console.log('Starting background joke generation job...');
    this.isRunning = true;
    this.runJob();
    this.intervalId = setInterval(() => {
      this.runJob();
    }, this.JOB_INTERVAL);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Background job stopped');
  }

  private async runJob(): Promise<void> {
    console.log('Running background joke generation...');
    
    try {
      // Generate multiple batches to ensure fresh content
      for (let i = 0; i < 3; i++) {
        try {
          console.log(`Generating batch ${i + 1}/3...`);
          // Generate a mixed batch of API and Gemini jokes
          await jokeService.generateJokesBatch();
          
          // Add delay between batches to avoid rate limiting
          if (i < 2) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } catch (error) {
          console.error(`Error generating batch ${i + 1}:`, error);
        }
      }
      
      console.log('Background job completed successfully');
    } catch (error) {
      console.error('Background job error:', error);
    }
  }
}

export const backgroundJobService = new BackgroundJobService(); 