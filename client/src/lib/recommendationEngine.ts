
import { Video } from './types';

interface VideoScore {
  video: Video;
  score: number;
}

export class RecommendationEngine {
  // Content-based filtering score (category, tags matching)
  private getContentScore(video: Video, userHistory: Video[]): number {
    if (!userHistory.length) return 0;
    
    const userCategories = new Set(userHistory.map(v => v.categoryId));
    const categoryMatch = userCategories.has(video.categoryId) ? 0.3 : 0;
    
    return categoryMatch;
  }

  // Collaborative filtering score (user behavior similarity)
  private getCollaborativeScore(video: Video): number {
    const viewScore = Math.log10((video.views || 1) / 100) * 0.2;
    const likeScore = Math.log10((video.likes || 1) / 10) * 0.2;
    return Math.min(viewScore + likeScore, 0.3);
  }

  // Recency score
  private getRecencyScore(video: Video): number {
    const now = new Date().getTime();
    const videoDate = new Date(video.createdAt).getTime();
    const daysDiff = (now - videoDate) / (1000 * 60 * 60 * 24);
    return Math.max(0, 0.2 - (daysDiff / 30) * 0.2);
  }

  // Watch time optimization
  private getWatchTimeScore(video: Video): number {
    return video.duration ? Math.min(video.duration / 600, 0.1) : 0; // Favor 5-10 minute videos
  }

  // Personalized ranking
  private getPersonalizedScore(video: Video, userPreferences: any): number {
    if (!userPreferences) return 0;
    const deviceBonus = userPreferences.preferredDevice === 'mobile' ? 0.05 : 0;
    return deviceBonus;
  }

  public rankVideos(videos: Video[], userHistory: Video[] = [], userPreferences: any = null): Video[] {
    // Calculate scores for each video
    const scoredVideos: VideoScore[] = videos.map(video => ({
      video,
      score: 
        this.getContentScore(video, userHistory) +
        this.getCollaborativeScore(video) +
        this.getRecencyScore(video) +
        this.getWatchTimeScore(video) +
        this.getPersonalizedScore(video, userPreferences) +
        Math.random() * 0.1 // Add small random factor for diversity
    }));

    // Sort by score and return videos
    return scoredVideos
      .sort((a, b) => b.score - a.score)
      .map(sv => sv.video);
  }
}

export const recommendationEngine = new RecommendationEngine();
