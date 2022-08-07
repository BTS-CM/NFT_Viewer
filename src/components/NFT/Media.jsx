import { Carousel } from '@mantine/carousel';
import { Image } from '@mantine/core';
import { appStore } from '../../lib/states';
import { getImage } from '../../lib/images';
import { IconMessageShare, IconTemperature } from '@tabler/icons';

export default function Media(properties) {
  let asset_images = appStore((state) => state.asset_images);
  
  if (!asset_images) {
    return (
      <Image
        width={200}
        height={120}
        src={null}
        alt="NFT Image load failure"
        withPlaceholder
      />
    )
  }

  return (
    asset_images.length > 1
    ? <Carousel slideSize="70%" height={200} slideGap="xs" controlsOffset="xs" loop withIndicators>
        {
          asset_images.map(image => {
            return <Carousel.Slide>
                      <Image
                        width={200}
                        height={200}
                        fit="contain"
                        src={image}
                      />
                    </Carousel.Slide>;
          })
        }
      </Carousel>
    : <Image
        width={200}
        height={200}
        fit="contain"
        src={asset_images[0]}
      />
  );
}
