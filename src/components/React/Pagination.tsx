import ChevronRightIcon from './ChevronRightIcon';
import ChevronLeftIcon from './ChevronLeftIcon';
import { cn } from 'src/lib/utils';
import { useState, type ReactNode } from 'react';
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

const DELAY_MS = 300;
const arrowClasses =
  'grid place-content-center size-6 rounded-full hover:bg-(--action-bg) hover:text-(--on-action) transition-colors text-(--headerColor) p-4 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--focus-color) motion-reduce:transition-none';

function ArrowControl({
  href,
  label,
  children,
  onClick,
}: {
  href: string | undefined;
  label: string;
  children: ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}) {
  if (!href) {
    return (
      <span
        role="link"
        aria-label={label}
        aria-disabled="true"
        className="grid place-content-center size-6 rounded-full text-(--headerColor) p-4 shrink-0 opacity-30"
      >
        <span className="size-6" aria-hidden="true">{children}</span>
      </span>
    );
  }

  return (
    <a href={href} aria-label={label} className={arrowClasses} onClick={onClick}>
      <span className="size-6" aria-hidden="true">{children}</span>
    </a>
  );
}

export function Pagination({ url, totalPages, currentPage }: PaginationProps) {
  const [isNext, setIsNext] = useState<boolean>(false);
  const [isPrev, setIsPrev] = useState<boolean>(false);

  const handleNext = (
    href: string | undefined,
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    if (
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) return;
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
    if (
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) return;
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
    <nav aria-label="Blog pagination" className="flex gap-4 max-w-xl mx-auto items-center justify-center p-[clamp(40px,7vw,70px)_1rem]  sm:p-[clamp(40px,7vw,70px)_0] ">
      <ul className="flex gap-6 items-center justify-center w-full">
        <li>
          <ArrowControl href={url.first} label="First page">
            <ChevronFirstIcon />
          </ArrowControl>
        </li>

        <li>
          <ArrowControl href={url.prev} label="Previous page" onClick={(e) => handlePrev(url.prev, e)}>
            <ChevronLeftIcon />
          </ArrowControl>
        </li>

        <li className="flex gap-6 md:mx-6 md:px-4">
          {url.prev && (
            <div
              className={cn(
                'grid before:[grid-area:1/1]',
                'before:content-[attr(data-prev)] before:grayscale-50',
                'before:text-center before:size-6 before:rounded-full',
                'before:grid before:place-content-center before:font-bold before:bg-(--action-bg) ',
                'before:text-(--on-action) before:p-4 before:shrink-0 before:scale-0 before:transform before:transition-transform before:duration-300 motion-reduce:before:transition-none',
                { 'before:scale-95': isPrev },
                { 'before:hidden': currentPage === 2 }
              )}
              data-prev={currentPage - 2 === 0 ? '' : currentPage - 2}
            >
              <a
                href={url.prev}
                aria-label={`Page ${currentPage - 1}`}
                className={cn(
                  'grid [grid-area:1/1] place-content-center size-6 rounded-full bg-(--action-bg) text-(--on-action) p-4 shrink-0 scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--focus-color)',
                  'scale-95 grayscale-50 transform transition-transform duration-300 motion-reduce:transition-none',
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
              aria-label={`Page ${currentPage}`}
              aria-current="page"
              className={cn(
                'grid place-content-center scale-110 size-6 rounded-full bg-(--action-bg) text-(--on-action) p-4 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--focus-color)',
                'grayscale-50 transform transition-transform duration-300 motion-reduce:transition-none',
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
                'before:grid before:place-content-center before:font-bold before:bg-(--action-bg) ',
                'before:text-(--on-action) before:p-4 before:shrink-0 before:scale-0 before:transform before:transition-transform before:duration-300 motion-reduce:before:transition-none',
                { 'before:scale-95': isNext && currentPage === totalPages - 1 },
                { 'before:hidden': currentPage === totalPages - 1 }
              )}
              data-next={currentPage === totalPages - 1 ? currentPage + 2 : ''}
            >
              <a
                href={url.next}
                aria-label={`Page ${currentPage + 1}`}
                className={cn(
                  'grid place-content-center size-6 rounded-full bg-(--action-bg) text-(--on-action) p-4 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--focus-color) ',
                  '[grid-area:1/1] scale-95 grayscale-50 transform transition-transform duration-300 motion-reduce:transition-none',
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

        <li>
          <ArrowControl href={url.next} label="Next page" onClick={(e) => handleNext(url.next, e)}>
            <ChevronRightIcon />
          </ArrowControl>
        </li>

        <li>
          <ArrowControl href={url.last} label="Last page">
            <ChevronLastIcon />
          </ArrowControl>
        </li>
      </ul>
    </nav>
  );
}
