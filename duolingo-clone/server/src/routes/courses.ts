import express from 'express';
import { auth, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Get available courses
router.get('/', (req, res) => {
  // Mock courses data
  const courses = [
    {
      id: 'english-basics',
      name: 'English Basics',
      description: 'Learn fundamental English skills',
      languageFrom: 'zh',
      languageTo: 'en',
      difficulty: 1,
      totalLessons: 50,
      estimatedTime: '2-3 months',
      iconUrl: '/icons/english-flag.svg',
    },
  ];

  res.json({
    success: true,
    data: courses,
  });
});

// Get specific course with units and skills
router.get('/:courseId', (req, res) => {
  const { courseId } = req.params;

  // Mock course structure
  const course = {
    id: courseId,
    name: 'English Basics',
    description: 'Learn fundamental English skills',
    languageFrom: 'zh',
    languageTo: 'en',
    units: [
      {
        id: 'unit-1',
        name: 'Basics 1',
        description: 'Learn basic greetings and introductions',
        orderIndex: 1,
        skills: [
          {
            id: 'skill-1',
            name: 'Greetings',
            description: 'Learn how to say hello and goodbye',
            iconUrl: '/icons/greetings.svg',
            level: 1,
            xpEarned: 50,
            lessonsCompleted: 3,
            totalLessons: 5,
            strength: 0.8,
            isAvailable: true,
            orderIndex: 1,
          },
          {
            id: 'skill-2',
            name: 'Introductions',
            description: 'Learn how to introduce yourself',
            iconUrl: '/icons/introductions.svg',
            level: 0,
            xpEarned: 0,
            lessonsCompleted: 0,
            totalLessons: 4,
            strength: 0.0,
            isAvailable: false,
            orderIndex: 2,
          },
        ],
      },
    ],
    userProgress: {
      totalXP: 50,
      completionPercentage: 15.5,
      currentUnitId: 'unit-1',
    },
  };

  res.json({
    success: true,
    data: course,
  });
});

export default router;