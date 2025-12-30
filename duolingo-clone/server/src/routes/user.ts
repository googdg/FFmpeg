import express from 'express';
import { auth, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Get user stats
router.get('/stats', (req, res) => {
  // Mock user stats
  const stats = {
    totalXP: 1250,
    currentStreak: 7,
    longestStreak: 15,
    hearts: 5,
    gems: 150,
    level: 13,
    lessonsCompleted: 45,
    lastActivityDate: new Date().toISOString().split('T')[0],
  };

  res.json({
    success: true,
    data: stats,
  });
});

// Update user stats
router.patch('/stats', (req, res) => {
  const updates = req.body;
  
  // Mock update logic
  res.json({
    success: true,
    data: {
      ...updates,
      updatedAt: new Date().toISOString(),
    },
    message: 'Stats updated successfully',
  });
});

// Get user achievements
router.get('/achievements', (req, res) => {
  // Mock achievements
  const achievements = [
    {
      id: '1',
      name: 'First Lesson',
      description: 'Complete your first lesson',
      iconUrl: '/icons/first-lesson.svg',
      unlockedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      iconUrl: '/icons/week-warrior.svg',
      unlockedAt: new Date().toISOString(),
    },
  ];

  res.json({
    success: true,
    data: achievements,
  });
});

// Get weekly progress
router.get('/progress/weekly', (req, res) => {
  // Mock weekly progress
  const weeklyProgress = Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    xpEarned: Math.floor(Math.random() * 100),
    lessonsCompleted: Math.floor(Math.random() * 5),
  }));

  res.json({
    success: true,
    data: weeklyProgress,
  });
});

export default router;