import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Project } from '../models/Project';
import { AIGeneration } from '../models/AIGeneration';
import { ActivityLog } from '../models/ActivityLog';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const timeframe = req.query.timeframe as string || '30d'; // 7d, 30d, 12m
    
    // 1. Get total users from Better Auth's 'user' collection
    const totalUsers = await mongoose.connection.db.collection('user').countDocuments();
    
    // 2. Get total projects
    const totalProjects = await Project.countDocuments();
    
    // 3. Get total AI generations
    const totalAIGenerations = await AIGeneration.countDocuments();
    
    // 4. Get total activity logs
    const totalActivities = await ActivityLog.countDocuments();

    // 5. Activity data over the specified timeframe
    const startDate = new Date();
    
    if (timeframe === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeframe === '12m') {
      startDate.setMonth(startDate.getMonth() - 12);
    } else {
      startDate.setDate(startDate.getDate() - 30); // Default 30d
    }

    const isMonthly = timeframe === '12m';

    const activityData = await ActivityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { 
              format: isMonthly ? "%Y-%m" : "%Y-%m-%d", 
              date: "$createdAt" 
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format data for Recharts
    const chartData = [];
    
    if (isMonthly) {
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        // JS getMonth is 0-indexed, so we pad it
        const monthStr = String(d.getMonth() + 1).padStart(2, '0');
        const yearStr = d.getFullYear();
        const dateString = `${yearStr}-${monthStr}`;
        
        const found = activityData.find(item => item._id === dateString);
        chartData.push({
          name: d.toLocaleDateString('en-US', { month: 'short' }),
          date: dateString,
          activity: found ? found.count : 0
        });
      }
    } else {
      const daysCount = timeframe === '7d' ? 6 : 29;
      for (let i = daysCount; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = d.toISOString().split('T')[0];
        
        const found = activityData.find(item => item._id === dateString);
        chartData.push({
          name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          date: dateString,
          activity: found ? found.count : 0
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalProjects,
          totalAIGenerations,
          totalActivities,
        },
        chartData
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
