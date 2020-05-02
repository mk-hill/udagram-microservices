import { Request, Response, NextFunction } from 'express';
import { ErrorMessages } from './error';

export const requireImageUrl = (req: Request, res: Response, next: NextFunction) =>
  req?.query?.image_url ? next() : res.status(400).send(ErrorMessages.MISSING_IMAGE_URL);
