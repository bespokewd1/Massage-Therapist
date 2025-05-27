import ChevronRightIcon from './ChevronRightIcon';
import ChevronLeftIcon from './ChevronLeftIcon';
import { cn } from 'src/lib/utils';
import { useState } from 'react';
import ChevronLastIcon from './ChevronLastIcon';
import ChevronFirstIcon from './ChevronFirstIcon';

export type PaginationProps = {
  totalPages: number;
  currentPage: number;
  url: {
    current: string;
    prev: string | undefined;
    next: string | undefined;
    first: string | undefined;
    last: string | undefined;
  };
};

/*the animation delay*/
const DELAY_MS: number = 300;

export function Pagination({ url, totalPages, currentPage }: PaginationProps) {
  const [isNext, setIsNext] = useState<boolean>(false);
  const [isPrev, setIsPrev] = useState<boolean>(false);

  const handleNext = (
    href: string | undefined,
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    event.preventDefault();
    if (href) {
      setIsNext(true);
      setTimeout(() => {
        setIsNext(false);
        window.location.href = href;
      }, DELAY_MS);
    }
  };

  const handlePrev = (
    href: string | undefined,
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    event.preventDefault();
    if (href) {
      setIsPrev(true);
      setTimeout(() => {
        setIsPrev(false);
        window.location.href = href;
      }, DELAY_MS);
    }
  };

  return (
    <nav className="flex gap-4 max-w-xl mx-auto items-center justify-center p-[clamp(40px,7vw,70px)_1rem]  sm:p-[clamp(40px,7vw,70px)_0] ">
      <ul className="flex gap-6 items-center justify-center w-full">
        <li
          className={cn('', {
            'grayscale pointer-events-none opacity-30': !url.first,
          })}
        >
          <a
            href={url.first}
            className="grid place-content-center size-6 rounded-full hover:bg-(--primary) hover:text-white transition-colors  text-black p-4 shrink-0"
          >
            <span className="size-6">
              <ChevronFirstIcon />
            </span>
          </a>
        </li>

        <li
          className={cn({
            'grayscale pointer-events-none opacity-30': !url.prev,
          })}
        >
          <a
            href={url.prev}
            className="grid place-content-center size-6 rounded-full hover:bg-(--primary) hover:text-white transition-colors text-black p-4 shrink-0"
            onClick={(e) => handlePrev(url.prev, e)}
          >
            <span className="size-6">
              <ChevronLeftIcon />
            </span>
          </a>
        </li>

        <li className="flex gap-6 md:mx-6 md:px-4">
          {url.prev && (
            <div
              className={cn(
                'grid before:[grid-area:1/1]',
                'before:content-[attr(data-prev)] before:grayscale-50',
                'before:text-center before:size-6 before:rounded-full',
                'before:grid before:place-content-center before:font-bold before:bg-(--primary) ',
                'before:text-black before:p-4 before:shrink-0 before:scale-0 before:transform before:transition-transform before:duration-300',
                { 'before:scale-95': isPrev },
                { 'before:hidden': currentPage === 2 }
              )}
              data-prev={currentPage - 2 === 0 ? '' : currentPage - 2}
            >
              <a
                href={url.prev}
                className={cn(
                  'grid [grid-area:1/1] place-content-center size-6 rounded-full bg-(--primary) text-black p-4 shrink-0 scale-95',
                  'scale-95 grayscale-50 transform transition-transform duration-300',
                  { 'translate-x-14 z-10 scale-110': isPrev },
                  { 'scale-0 duration-150': isNext }
                )}
                onClick={(e) => handlePrev(url.prev, e)}
              >
                <span className="font-bold [grid-area:1/1]">
                  {currentPage - 1}
                </span>
              </a>
            </div>
          )}

          <div>
            <a
              href={url.current}
              className={cn(
                'grid place-content-center scale-110 size-6 rounded-full bg-(--primary) text-black p-4 shrink-0',
                'grayscale-50 transform transition-transform duration-300',
                { 'scale-95 translate-x-14 -z-10': isPrev },
                { 'scale-95 -translate-x-14 -z-10': isNext }
              )}
            >
              <span className="font-bold">{currentPage}</span>
            </a>
          </div>

          {url.next && (
            <div
              className={cn(
                'grid before:[grid-area:1/1]',
                'before:content-[attr(data-next)] before:grayscale-50',
                'before:text-center before:size-6 before:rounded-full',
                'before:grid before:place-content-center before:font-bold before:bg-(--primary) ',
                'before:text-black before:p-4 before:shrink-0 before:scale-0 before:transform before:transition-transform before:duration-300',
                { 'before:scale-95': isNext && currentPage === totalPages - 1 },
                { 'before:hidden': currentPage === totalPages - 1 }
              )}
              data-next={currentPage === totalPages - 1 ? currentPage + 2 : ''}
            >
              <a
                href={url.next}
                className={cn(
                  'grid place-content-center size-6 rounded-full bg-(--primary) text-black p-4 shrink-0 ',
                  '[grid-area:1/1] scale-95 grayscale-50 transform transition-transform duration-300',
                  { '-translate-x-14 z-10 scale-110': isNext },
                  { 'scale-0 duration-150': isPrev }
                )}
                onClick={(e) => handleNext(url.next, e)}
              >
                <span className="font-bold">{currentPage + 1}</span>
              </a>
            </div>
          )}
        </li>

        <li
          className={cn({
            'grayscale pointer-events-none opacity-30': !url.next,
          })}
        >
          <a
            href={url.next}
            className="grid place-content-center size-6 rounded-full hover:bg-(--primary) hover:text-white transition-colors  text-black p-4 shrink-0"
            onClick={(e) => handleNext(url.next, e)}
          >
            <span className="size-6">
              <ChevronRightIcon />
            </span>
          </a>
        </li>

        <li
          className={cn({
            'grayscale pointer-events-none opacity-30': !url.last,
          })}
        >
          <a
            href={url.last}
            className="grid place-content-center size-6 rounded-full hover:bg-(--primary) hover:text-white transition-colors  text-black p-4 shrink-0"
          >
            <span className="size-6">
              <ChevronLastIcon />
            </span>
          </a>
        </li>
      </ul>
    </nav>
  );
}
