import Task from '../models/Task.js';
import ActivityLog from '../models/ActivityLog.js';
import asyncHandler from '../utils/asyncHandler.js';
import { askGroq, parseJsonResponse } from '../utils/ai.js';
import { fail, ok } from '../utils/http.js';

export const summariseProject = asyncHandler(async (req, res) => {
  if (!req.body.projectId) return fail(res, 'projectId is required', 422);
  const tasks = await Task.find({ projectId: req.body.projectId }).lean();
  const text = await askGroq(`You are a project assistant. Here are all tasks for this project: ${JSON.stringify(tasks)}. Give a concise markdown summary with headings for overall status, completed work, and what's remaining. Use bullet points instead of tables. Be specific and use task titles.`);
  return ok(res, { summary: text });
});

export const getBlockers = asyncHandler(async (req, res) => {
  if (!req.body.projectId) return fail(res, 'projectId is required', 422);
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const tasks = await Task.find({ projectId: req.body.projectId, status: 'in_progress', updatedAt: { $lt: cutoff } }).lean();
  const text = await askGroq(`These tasks have been In Progress for over 48 hours: ${JSON.stringify(tasks)}. Identify likely blockers and suggest concrete next steps for each in markdown bullets. Keep it concise.`);
  return ok(res, { analysis: text, blockers: tasks });
});

export const generateStandup = asyncHandler(async (req, res) => {
  if (!req.body.projectId) return fail(res, 'projectId is required', 422);
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const activities = await ActivityLog.find({ projectId: req.body.projectId, createdAt: { $gte: since } }).lean();
  const text = await askGroq(`Based on this activity from the last 24 hours: ${JSON.stringify(activities)}, write a professional daily standup report in markdown with headings for what was done, what's planned today, and any blockers. Use bullets and keep it concise.`);
  return ok(res, { standup: text });
});

export const breakdownFeature = asyncHandler(async (req, res) => {
  if (!req.body.feature) return fail(res, 'feature is required', 422);
  const text = await askGroq(`Break down this feature into implementation subtasks for a developer team: '${req.body.feature}'. Return ONLY a JSON array of objects: [{ "title": string, "description": string, "priority": "P0"|"P1"|"P2" }]. 6-8 subtasks.`, { json: true });
  return ok(res, { subtasks: parseJsonResponse(text) });
});

export const reviewCode = asyncHandler(async (req, res) => {
  const { code, language = 'javascript' } = req.body;
  if (!code) return fail(res, 'code is required', 422);
  try {
    const text = await askGroq(`Review this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\`\nReturn ONLY a JSON object: { "score": number, "bugs": string[], "performance": string[], "readability": string[], "security": string[] }`, { json: true });
    const review = parseJsonResponse(text);
    return ok(res, {
      review: {
        score: Number.isFinite(review?.score) ? review.score : 0,
        bugs: Array.isArray(review?.bugs) ? review.bugs : [],
        performance: Array.isArray(review?.performance) ? review.performance : [],
        readability: Array.isArray(review?.readability) ? review.readability : [],
        security: Array.isArray(review?.security) ? review.security : [],
      },
    });
  } catch (error) {
    return fail(res, error.message || 'Unable to parse AI review response', 502);
  }
});
