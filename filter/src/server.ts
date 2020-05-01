import { basename } from 'path';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFile, saveToBucket, getFromBucket, deleteLocalFiles } from './util';
import { handleErrorResponse, requireImageUrl } from './validation';

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  /**
   * Validate image_url query parameter
   * Get original image from image_url if it exists
   * Save filtered image to local drive
   * Send filtered image in response
   * Delete local file
   */
  app.get('/filteredimage', requireImageUrl, async (req: Request, res: Response) => {
    const { image_url: url } = req.query as { image_url: string };

    try {
      const localPath = await filterImageFromURL(url);
      res.status(200).sendFile(localPath);
      res.on('finish', deleteLocalFile.bind(null, localPath));
    } catch ({ message }) {
      handleErrorResponse(res, message);
    }
  });

  /**
   * Validate image_url query parameter
   * Get original image from S3 bucket if given path exists in bucket
   * Save filtered image to local drive
   * Save filtered image to S3 bucket
   * Delete local file
   * Return filtered image's path in bucket
   */
  app.post('/filteredimage', requireImageUrl, async (req: Request, res: Response) => {
    const { image_url: bucketPathOriginal } = req.query as { image_url: string };

    try {
      const localPathOriginal = await getFromBucket(bucketPathOriginal);
      const localPathFiltered = await filterImageFromURL(localPathOriginal, basename(bucketPathOriginal));
      const bucketPathFiltered = await saveToBucket(localPathFiltered);
      deleteLocalFiles([localPathOriginal, localPathFiltered]);
      res.status(201).send(bucketPathFiltered);
    } catch ({ message }) {
      handleErrorResponse(res, message);
    }
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get('/', async (req, res) => {
    res.send('try GET /filteredimage?image_url={{}}');
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
