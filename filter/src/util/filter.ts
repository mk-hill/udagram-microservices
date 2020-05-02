import { unlinkSync } from 'fs';
import Jimp from 'jimp';
import { ErrorMessages } from '../validation';

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL: string, fileName = `${Math.floor(Math.random() * 2000)}.jpg`): Promise<string> {
  const photo = await Jimp.read(inputURL).catch((e) => {
    console.error(e);
    throw new Error(ErrorMessages.READ);
  });

  const absolutePath = `${__dirname}/tmp/filtered.${fileName}`;

  return photo
    .resize(512, Jimp.AUTO) // resize
    .quality(60) // set JPEG quality
    .greyscale() // set greyscale
    .contrast(0.2) // increase contrast
    .writeAsync(absolutePath)
    .then((_) => absolutePath)
    .catch((e) => {
      console.error(e);
      throw new Error(ErrorMessages.FILTER);
    });
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export function deleteLocalFiles(files: string[]) {
  for (const file of files) {
    deleteLocalFile(file);
  }
}

export const deleteLocalFile = (path: string) => unlinkSync(path);
