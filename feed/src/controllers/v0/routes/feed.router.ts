import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { FeedItem } from '../models/FeedItem';
// import { requireAuth } from '../users/routes/auth.router';
import jwt from 'jsonwebtoken';
import * as AWS from '../../../aws';
import { config as c } from '../../../config/config';
// const c = config.dev;

const router: Router = Router();

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  //   return next();
  if (!req.headers || !req.headers.authorization) {
    return res.status(401).send({ message: 'No authorization headers.' });
  }

  const token_bearer = req.headers.authorization.split(' ');
  if (token_bearer.length != 2) {
    return res.status(401).send({ message: 'Malformed token.' });
  }

  const token = token_bearer[1];
  return jwt.verify(token, c.jwt.secret, (err, decoded) => {
    if (err) {
      return res.status(500).send({ auth: false, message: 'Failed to authenticate.' });
    }
    return next();
  });
}

// Get all feed items
router.get('/', async (req: Request, res: Response) => {
  const items = await FeedItem.findAndCountAll({ order: [['id', 'DESC']] });
  items.rows.map((item) => {
    if (item.url) {
      item.url = AWS.getGetSignedUrl(item.url);
    }
  });
  res.send(items);
});

// Add an endpoint to GET a specific resource by Primary Key
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send('id required');
  }

  const item = await FeedItem.findByPk(id);

  if (!item) {
    return res.status(404).send(`feed item with id ${id} not found`);
  }

  res.status(200).send(item);
});

// update a specific resource
router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send('id required');
  }

  const item = await FeedItem.findByPk(id);

  if (!item) {
    return res.status(404).send(`feed item with id ${id} not found`);
  }

  const { caption, url } = req.body;

  if (caption) {
    item.caption = caption;
  }

  if (url) {
    item.url = url;
  }
  console.log(item.url);

  const saved_item = await item.save();
  saved_item.url = AWS.getGetSignedUrl(saved_item.url);
  res.status(200).send(saved_item);
});

// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName', requireAuth, async (req: Request, res: Response) => {
  const { fileName } = req.params;
  const url = AWS.getPutSignedUrl(fileName);
  res.status(201).send({ url: url });
});

// Post meta data and the filename after a file is uploaded
// NOTE the file name is they key name in the s3 bucket.
// User can request filtered version to be saved instead of original
// body : {caption: string, fileName: string, filter?: boolean};
router.post('/', async (req: Request, res: Response) => {
  const { caption, filter } = req.body;
  let { url: filePath } = req.body;

  // check Caption is valid
  if (!caption) {
    return res.status(400).send({ message: 'Caption is required or malformed' });
  }

  // check Filename is valid
  if (!filePath) {
    return res.status(400).send({ message: 'File url is required' });
  }

  if (filter) {
    try {
      filePath = await axios
        .post(`${c.dev.image_filter_url}/filteredimage?image_url=${filePath}`)
        .then(({ data: filteredPath }) => filteredPath);
    } catch (e) {
      console.error(e);
      return res.status(500).send('Unable to filter image');
    }
  }

  const item = await new FeedItem({
    caption: caption,
    url: filePath,
  });

  const saved_item = await item.save();

  saved_item.url = AWS.getGetSignedUrl(saved_item.url);
  res.status(201).send(saved_item);
});

export const FeedRouter: Router = router;
