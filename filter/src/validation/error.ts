import { Response } from 'express';

export enum ErrorMessages {
  READ = 'Unable to read image URL, please ensure resource exists.',
  FILTER = 'Unable to filter image.',
  SAVE = 'Unable save image.',
  MISSING_IMAGE_URL = 'Image URL required.',
}

export const handleErrorResponse = (res: Response, message: string) => {
  const errorMessageIsIntendedForUser = Object.values(ErrorMessages)
    .map((val) => val.toString())
    .includes(message);

  if (!errorMessageIsIntendedForUser) {
    message = 'Internal error'; // Default to avoid sending unknown error messages in response
  }

  const statusCode = message === ErrorMessages.READ ? 422 : 500; // Assume url was the problem if Jimp couldn't read
  res.status(statusCode).send(message);
};
