import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Project } from '../models/Project';
import { AIGeneration } from '../models/AIGeneration';
import { UserStory } from '../models/UserStory';
import { ActivityLog } from '../models/ActivityLog';

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Convert string ID to ObjectId for Mongoose querying if necessary
    // But string often works, let's cast if needed. 
    // In Better Auth, userId might be a string (like a CUID or UUID) or ObjectId. 
    // Usually it's a string in MongoDB adapter if it creates string IDs, or ObjectId.
    // We'll use it directly, Mongoose typically auto-casts if the schema expects ObjectId,
    // except for aggregations where we might need to manually cast if the schema type is ObjectId.
    const userObjId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;

    // 1. Get user's projects
    const userProjects = await Project.find({ ownerId: userObjId });
    const projectIds = userProjects.map(p => p._id);
    const activeProjects = userProjects.length;

    // 2. Get AI documents generated for these projects
    const aiDocumentsGenerated = await AIGeneration.countDocuments({ projectId: { $in: projectIds } });

    // 3. Get User Stories for these projects
    const userStories = await UserStory.countDocuments({ projectId: { $in: projectIds } });

    // 4. Team Members (Mocked for now as 1)
    const teamMembers = 1;

    // 5. Recent Activity (Last 5 activities for the user)
    const recentActivityRaw = await ActivityLog.find({ userId: userObjId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('projectId', 'title');
    
    const recentActivity = recentActivityRaw.map(activity => {
      // populate adds the document or null, so we safely access title
      const project = activity.projectId as any;
      return {
        action: activity.action,
        project: project?.title || 'Unknown Project',
        time: activity.createdAt,
      };
    });

    // 6. AI Agent Usage (Tokens/Generations over last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activityData = await AIGeneration.aggregate([
      {
        $match: {
          projectId: { $in: projectIds },
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          usage: { $sum: 1 } // Summing generations, could be tokens if available
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format chart data
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      
      const found = activityData.find(item => item._id === dateString);
      chartData.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        usage: found ? found.usage : 0
      });
    }

    res.status(200).json({
      success: true,
      data: {
        stats: {
          activeProjects,
          aiDocumentsGenerated,
          userStories,
          teamMembers,
        },
        chartData,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
