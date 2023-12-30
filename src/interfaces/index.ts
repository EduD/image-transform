export type ImagePosition = 'top-left'  | 'top-right' | 'bottom-left' | 'bottom-right';

export type Options = {
  resizeHeight: number;
  resizeWidth: number;
  waterMarkPosition: ImagePosition;
}

export type ImagePaths = {
  imageFileName: string;
  inputPath: string;
  outputPath: string;
}

export type TransformImageArgs = {
  outputImagePath: string;
  inputImagePath: string;
  imageFileName: string;
  waterMark?: Buffer;
}