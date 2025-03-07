import type { ImageMetadata } from 'astro';
import { useEffect, useState } from 'react';
import { cn } from 'src/lib/utils';

type ImageSliderProps = {
  imgDatas: ImageMetadata[];
  isAutoSlide?: boolean;
  autoSlideInterval?: number;
};

export function ImageSlider({
  imgDatas,
  isAutoSlide = false,
  autoSlideInterval = 5000,
}: ImageSliderProps) {
  const [current, setCurrent] = useState<number>(0);

  const goNextImage = () => {
    setCurrent((current) => {
      return current === imgDatas.length - 1 ? 0 : current + 1;
    });
  };

  const goPrevImage = () => {
    setCurrent((current) => {
      return current === 0 ? imgDatas.length - 1 : current - 1;
    });
  };

  useEffect(() => {
    if (!isAutoSlide) return;

    const slideInterval = setInterval(goNextImage, autoSlideInterval);
    return () => clearInterval(slideInterval);
  }, [isAutoSlide, autoSlideInterval]);

  return (
    <div
      className={cn(
        'grid absolute inset-0 w-full h-full -z-[2] place-content-stretch',
        'before:content-[""] before:w-full before:h-full before:bg-black before:opacity-70 before:absolute before:inset-0 before:z-[1] before:pointer-events-none'
      )}
    >
      {imgDatas.map((img, index) => (
        <img
          key={`${img.src}${index}`}
          className={cn(
            '[grid-area:1/1] object-cover h-full w-full transition-opacity duration-300 ease',
            ` ${index === current ? '-z-[1] opacity-100' : '-z-[2] opacity-0'}  `
          )}
          aria-hidden="true"
          decoding="async"
          src={img.src}
          alt="relaxing massage hero"
          loading="lazy"
          width={img.width}
          height={img.height}
        />
      ))}

      <div className="absolute bottom-[15%] right-0 left-0 z-[1]">
        <div className="flex items-center justify-center gap-4">
          {imgDatas.map((_, i) => (
            <div
              key={i}
              className={`
                transition-all w-3 h-3 bg-white rounded-full
                ${current === i ? 'p-2' : 'bg-opacity-50'}
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
