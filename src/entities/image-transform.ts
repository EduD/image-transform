import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { readdir, readFile, access } from 'node:fs/promises';
import { ReadStream, WriteStream, createReadStream, createWriteStream } from 'node:fs';

import sharp from 'sharp';

import { Logger } from './logger';
import { Options, ImagePaths, ImagePosition, TransformImageArgs } from '../interfaces';
import { INPUT_FOLDER, OUTPUT_FOLDER, IMAGE_TO_ADD_FILE } from '../interfaces/consts';

const dirName = dirname(fileURLToPath(import.meta.url));
const path = resolve(dirName, '../', '../');

export class ImageTransform {

  private options: Options;
  private logger: Logger;

  constructor(logger: Logger,options: Options) {
    this.options = options;
    this.logger = logger;
  }

  private async getInputPath(): Promise<string> {
    try {
      const inputPath = resolve(path, INPUT_FOLDER);
      await access(inputPath);
      return inputPath;
    } catch (error) {
      this.logger.logError(`Input directory not found. Path: "./${INPUT_FOLDER}"`);
      return '';
    }
  }

  private async getOutputPath(): Promise<string> {
    try {
      const outputPath = resolve(path, OUTPUT_FOLDER);
      await access(outputPath);
      return outputPath;
    } catch (error) {
      this.logger.logError(`Output directory not found. Path: "./${OUTPUT_FOLDER}"`);
      return '';
    }
  }

  private async getImagesPaths(): Promise<ImagePaths[]> {
    const inputPath = await this.getInputPath();
    const outputPath = await this.getOutputPath();
    
    if (!inputPath && !outputPath) {
      return [];
    }

    const files = await readdir(inputPath);
    return files
      .filter(name => name.match(/\.jp|png/i) && !name.includes(IMAGE_TO_ADD_FILE))
      .map(imageFileName => ({
        imageFileName,
        inputPath: resolve(inputPath, imageFileName),
        outputPath: resolve(outputPath, imageFileName),
      }));
  }

  private getImageSharpPosition(position: ImagePosition): number {
    const positions: Record<ImagePosition, number> = {
      "top-left": sharp.gravity.northwest,
      "top-right": sharp.gravity.northeast,
      "bottom-left": sharp.gravity.southwest,
      "bottom-right": sharp.gravity.southeast,
    }

    return positions[position];
  }

  private async createWaterMark() {
    try {
      const waterMarkPath = resolve(path, INPUT_FOLDER, IMAGE_TO_ADD_FILE);
      return await sharp(await readFile(waterMarkPath))
        .png({ quality: 100 })
        .toBuffer();
        
    } catch (error) {
      this.logger.logError(`Water mark file not found. Path: "./${INPUT_FOLDER}/${IMAGE_TO_ADD_FILE}"`);
      return;
    }
  }

  private readableStream(inputPath: string): ReadStream {
    return createReadStream(inputPath);
  }

  private transformStream(waterMark?: Buffer): sharp.Sharp {
    const composite: sharp.OverlayOptions[] = [];

    if (waterMark) {
      composite.push(
        { input: waterMark,
          gravity: this.getImageSharpPosition(this.options.waterMarkPosition),
        }
      );
    }

    return sharp()
      .resize(this.options.resizeWidth, this.options.resizeHeight)
      .composite(composite)
      .jpeg({ quality: 100 });
  }

  private writableStream(imagePath: string): WriteStream {
    return createWriteStream(imagePath);
  }

  async transformImage({
    inputImagePath,
    outputImagePath,
    imageFileName,
    waterMark,
  }: TransformImageArgs) {
    try {
      await pipeline(
        this.readableStream(inputImagePath),
        this.transformStream(waterMark),
        this.writableStream(outputImagePath)
      );
  
      this.logger.log(`[image] ${imageFileName} transformed.`);
    } catch (error) {
      this.logger.logError(`[image] ${imageFileName} occurred an error. ${ error.message}`,);
    }
  }

  async transform() {
    const startedAt = performance.now();

    this.logger.logInfo('[Start] Transforming images');

    const [images, waterMark] = await Promise.all([
      this.getImagesPaths(),
      this.createWaterMark(),
    ]);
    
    const pendingPromises: Promise<void>[] = [];
    for (const { inputPath, outputPath, imageFileName } of images) {
      const result = this.transformImage({
        inputImagePath: inputPath,
        outputImagePath: outputPath,
        imageFileName: imageFileName,
        waterMark,
      });
      pendingPromises.push(result);
    }

    await Promise.all(pendingPromises);

    const endedAt = performance.now();
    const timeTook = (endedAt - startedAt).toFixed(2);

    this.logger.logInfo(`[Finish] Images transformed. It took ${timeTook} ms.`);
  }
}