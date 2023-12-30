import { ImageTransform } from './entities/image-transform';
import { Logger } from './entities/logger';


async function main(): Promise<void> {
  const imageTransform = new ImageTransform(new Logger(), {
    resizeHeight: 1080,
    resizeWidth: 1080,
    waterMarkPosition: 'bottom-left',
  });

  await imageTransform.transform();
}

main();
