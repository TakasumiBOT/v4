import sharp, { OverlayOptions } from "sharp";

const connectImage = async (urls: string[]) => {
  if (urls.length === 0) throw new Error("画像URLを1つ以上指定してください");

  try {
    const firstImageResponse = await fetch(urls[0]);

    if (!firstImageResponse.ok)
      throw new Error(`画像の取得に失敗しました: ${firstImageResponse.statusText}`);

    const firstImageBuffer = await firstImageResponse.arrayBuffer();
    const firstImageMetadata = await sharp(firstImageBuffer).metadata();

    const imageWidth = firstImageMetadata.width;
    const imageHeight = firstImageMetadata.height;
    const combinedWidth = imageWidth * urls.length;

    const imagesToCombine: OverlayOptions[] = [
      {
        input: Buffer.from(firstImageBuffer),
        top: 0,
        left: 0,
      },
    ];

    for (let i = 1; i < urls.length; i++) {
      const imageUrl = urls[i];
      const response = await fetch(imageUrl);

      if (!response.ok) throw new Error(`画像の取得に失敗しました: ${response.statusText}`);

      const imageBuffer = await response.arrayBuffer();

      imagesToCombine.push({
        input: Buffer.from(imageBuffer),
        top: 0,
        left: imageWidth * i,
      });
    }

    const compositeImage = await sharp({
      create: {
        width: combinedWidth,
        height: imageHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite(imagesToCombine)
      .png()
      .toBuffer();

    return compositeImage;
  } catch (error) {
    throw error;
  }
};

export default connectImage;
