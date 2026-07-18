import { Request, Response, NextFunction } from 'express';
import { Project } from '../models/Project';
import { ProjectFeature } from '../models/ProjectFeature';
import { UserStory } from '../models/UserStory';
import { SprintPlan } from '../models/SprintPlan';
import { Roadmap } from '../models/Roadmap';

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    
    let dbQuery = Project.find({ ownerId: req.user?.id, ...JSON.parse(queryStr) });

    // 2. Search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      dbQuery = dbQuery.find({ 
        $or: [
          { title: searchRegex },
          { category: searchRegex },
          { description: searchRegex }
        ]
      });
    }

    // 3. Sorting
    if (req.query.sort) {
      const sortBy = (req.query.sort as string).split(',').join(' ');
      dbQuery = dbQuery.sort(sortBy);
    } else {
      dbQuery = dbQuery.sort('-updatedAt');
    }

    // 4. Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    dbQuery = dbQuery.skip(skip).limit(limit);

    // Execute query
    const projects = await dbQuery;
    
    // Count total documents for pagination info
    const total = await Project.countDocuments({ ownerId: req.user?.id, ...JSON.parse(queryStr) });

    res.status(200).json({ 
      success: true, 
      count: projects.length, 
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: projects 
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, ownerId: req.user?.id });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, category, description, tagline, industry, businessGoal, targetAudience, budget, timeline, visibility } = req.body;

    const project = await Project.create({
      ownerId: req.user?.id,
      title,
      category,
      description,
      tagline,
      industry,
      businessGoal,
      targetAudience,
      budget,
      timeline,
      visibility
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let project = await Project.findOne({ _id: req.params.id, ownerId: req.user?.id });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, ownerId: req.user?.id });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await project.deleteOne();
    
    // Also delete associated data (Features, Stories, Sprints, Roadmaps)
    await ProjectFeature.deleteMany({ projectId: req.params.id });
    await UserStory.deleteMany({ projectId: req.params.id });
    await SprintPlan.deleteMany({ projectId: req.params.id });
    await Roadmap.deleteMany({ projectId: req.params.id });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

export const getPublicProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryObj: any = { visibility: 'public' };

    // 1. Filtering
    if (req.query.category && req.query.category !== 'All') {
      queryObj.category = req.query.category;
    }
    if (req.query.industry && req.query.industry !== 'All') {
      queryObj.industry = req.query.industry;
    }

    let dbQuery = Project.find(queryObj);

    // 2. Search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      dbQuery = dbQuery.find({ 
        $or: [
          { title: searchRegex },
          { category: searchRegex },
          { description: searchRegex }
        ]
      });
    }

    // 3. Sorting
    if (req.query.sort) {
      let sortBy = '-createdAt';
      switch (req.query.sort) {
        case 'newest': sortBy = '-createdAt'; break;
        case 'oldest': sortBy = 'createdAt'; break;
        case 'budget_high': sortBy = '-budget'; break;
        case 'budget_low': sortBy = 'budget'; break;
      }
      dbQuery = dbQuery.sort(sortBy);
    } else {
      dbQuery = dbQuery.sort('-createdAt');
    }

    // 4. Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 8;
    const skip = (page - 1) * limit;

    dbQuery = dbQuery.skip(skip).limit(limit);

    // Execute query
    const projects = await dbQuery;

    // Count total documents for pagination info
    let countQuery = Project.find(queryObj);
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      countQuery = countQuery.find({ 
        $or: [
          { title: searchRegex },
          { category: searchRegex },
          { description: searchRegex }
        ]
      });
    }
    const total = await countQuery.countDocuments();

    res.status(200).json({ 
      success: true, 
      count: projects.length, 
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: projects 
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicProjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, visibility: 'public' });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Public project not found' });
    }
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};
