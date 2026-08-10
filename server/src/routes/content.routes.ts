/**
 * LAYER: Routes
 * Responsibility: map the read-only content URLs to their controllers.
 * Must not know about: services or repositories — a route only names a handler.
 */
import { Router } from 'express';

import { getFaqs } from '../controllers/faq.controller.js';
import { getProjectCategories, getProjects } from '../controllers/project.controller.js';
import { getServices } from '../controllers/service.controller.js';
import { getStats } from '../controllers/stat.controller.js';
import { getTestimonials } from '../controllers/testimonial.controller.js';

export const contentRoutes = Router();

contentRoutes.get('/services', getServices);

contentRoutes.get('/projects', getProjects);
contentRoutes.get('/projects/categories', getProjectCategories);

contentRoutes.get('/testimonials', getTestimonials);
contentRoutes.get('/faqs', getFaqs);
contentRoutes.get('/stats', getStats);
