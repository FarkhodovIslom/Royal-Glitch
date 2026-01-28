import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { STARTING_RATING, MIN_RATING } from '../shared/types';

interface RatingData {
  [playerId: string]: number;
}

@Injectable()
export class RatingService implements OnModuleInit {
  private ratings: RatingData = {};
  private readonly filePath: string;

  constructor() {
    this.filePath = path.join(process.cwd(), 'data', 'ratings.json');
  }

  onModuleInit() {
    this.loadRatings();
  }

  // Load ratings from JSON file
  private loadRatings(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        this.ratings = JSON.parse(data);
        console.log('📊 Loaded ratings for', Object.keys(this.ratings).length, 'players');
      } else {
        this.ratings = {};
        this.saveRatings();
        console.log('📊 Created new ratings file');
      }
    } catch (error) {
      console.error('Failed to load ratings:', error);
      this.ratings = {};
    }
  }

  // Save ratings to JSON file
  private saveRatings(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(this.filePath, JSON.stringify(this.ratings, null, 2));
    } catch (error) {
      console.error('Failed to save ratings:', error);
    }
  }

  // Get rating for a player
  getRating(playerId: string): number {
    return this.ratings[playerId] ?? STARTING_RATING;
  }

  // Update rating for a player
  updateRating(playerId: string, change: number): number {
    const currentRating = this.getRating(playerId);
    const newRating = Math.max(MIN_RATING, currentRating + change);
    this.ratings[playerId] = newRating;
    this.saveRatings();
    return newRating;
  }

  // Set rating directly (for testing or initialization)
  setRating(playerId: string, rating: number): void {
    this.ratings[playerId] = Math.max(MIN_RATING, rating);
    this.saveRatings();
  }

  // Get all ratings
  getAllRatings(): RatingData {
    return { ...this.ratings };
  }

  // Get leaderboard (top N players)
  getLeaderboard(limit: number = 10): { playerId: string; rating: number }[] {
    return Object.entries(this.ratings)
      .map(([playerId, rating]) => ({ playerId, rating }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }
}
