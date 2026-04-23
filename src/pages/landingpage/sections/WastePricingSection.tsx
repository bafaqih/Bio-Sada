import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { useActiveWasteCategories } from '@/hooks/useWasteCategories';
import { Skeleton } from '@/components/ui/skeleton';

const formatCurrency = (num: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

export default function WastePricingSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const { data: categories, isLoading } = useActiveWasteCategories();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // We triple the items for infinite scroll: [Set 1][Set 2][Set 3]
  // We'll always stay within Set 2 (middle set)
  const displayItems = categories ? [...categories, ...categories, ...categories] : [];
  const totalItems = categories?.length ?? 0;

  // Sync scroll position for infinite loop and active dot
  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container || totalItems === 0) return;

    const firstCard = container.querySelector('[data-card="true"]');
    const cardWidth = firstCard?.getBoundingClientRect().width ?? 280;
    const gap = 24;
    const itemTotalWidth = cardWidth + gap;

    const currentScroll = container.scrollLeft;
    const middleSetStart = totalItems * itemTotalWidth;
    const middleSetEnd = middleSetStart * 2;

    // Infinite loop jump with a small buffer to avoid "stuck" feel
    // Jump when we are well into the first or third set
    if (currentScroll < middleSetStart - (itemTotalWidth * 0.5)) {
      container.scrollLeft = currentScroll + middleSetStart;
    } else if (currentScroll >= middleSetEnd - (itemTotalWidth * 0.5)) {
      container.scrollLeft = currentScroll - middleSetStart;
    }

    // Active index for dots
    const idx = Math.round(container.scrollLeft / itemTotalWidth) % totalItems;
    if (idx !== activeIndex) {
      setActiveIndex(idx);
    }
  };

  // Auto-scroll logic
  const scrollToNext = useCallback(() => {
    const container = scrollRef.current;
    if (!container || totalItems === 0) return;
    
    const firstCard = container.querySelector('[data-card="true"]');
    const cardWidth = firstCard?.getBoundingClientRect().width ?? 280;
    const gap = 24;
    const itemTotalWidth = cardWidth + gap;
    
    const currentPos = container.scrollLeft;
    const nextPos = Math.round(currentPos / itemTotalWidth + 1) * itemTotalWidth;
    
    container.scrollTo({ left: nextPos, behavior: 'smooth' });
  }, [totalItems]);

  useEffect(() => {
    if (isPaused || totalItems <= 1 || !inView) return;
    const timer = setInterval(scrollToNext, 3000);
    return () => clearInterval(timer);
  }, [scrollToNext, isPaused, totalItems, inView]);

  // Initial scroll to middle set
  useEffect(() => {
    if (!isLoading && totalItems > 0 && scrollRef.current) {
      const container = scrollRef.current;
      const firstCard = container.querySelector('[data-card="true"]');
      const cardWidth = firstCard?.getBoundingClientRect().width ?? 280;
      const gap = 24;
      container.scrollLeft = totalItems * (cardWidth + gap);
    }
  }, [isLoading, totalItems]);

  return (
    <section id="harga-sampah" className="relative py-20 overflow-hidden sm:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-emerald-50/30 to-white" />
      
      {/* Header - Still centered and constrained */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
          ref={ref}
        >
          <span className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Harga Sampah</span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Jenis Sampah & Harga Real-Time
          </h2>
          <p className="mt-3 text-gray-500">Harga terbaru langsung dari platform.</p>
        </motion.div>
      </div>

      {/* Carousel - Full Width Bleeding */}
      <div className="relative w-full group">
        {/* Side Gradients for smoother spoiler effect */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white via-white/40 to-transparent sm:w-32 lg:w-64" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white via-white/40 to-transparent sm:w-32 lg:w-64" />
        {isLoading ? (
          <div className="flex gap-6 px-4 sm:px-[calc((100vw-80rem)/2+1rem)] overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-64 flex-shrink-0 rounded-2xl border border-gray-100 bg-white p-5">
                <Skeleton className="h-36 w-full rounded-xl" />
                <Skeleton className="mt-4 h-5 w-32" />
                <Skeleton className="mt-2 h-4 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
              className="scrollbar-hide flex snap-x snap-proximity gap-6 overflow-x-auto pb-8 pt-4 px-4 sm:px-[calc(max(1rem,(100vw-80rem)/2+2rem))] lg:px-[calc(max(1rem,(100vw-80rem)/2+2rem))]"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {displayItems.map((item, i) => (
                <motion.div
                  key={`${item.id}-${i}`}
                  data-card="true"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: (i % totalItems) * 0.05 }}
                  className="w-64 flex-shrink-0 snap-start rounded-2xl border border-emerald-100/60 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg sm:w-72"
                >
                  {/* Image */}
                  <div className="relative h-36 w-full overflow-hidden rounded-xl bg-emerald-50">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-emerald-300">
                        {item.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <h3 className="mt-4 text-base font-semibold text-gray-900">{item.name}</h3>
                  <p className="mt-1 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-lg font-bold text-transparent">
                    {formatCurrency(item.price_per_kg)}/{item.unit}
                  </p>
                  {item.description && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-400">{item.description}</p>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Indicator bar */}
            {totalItems > 1 && (
              <div className="mt-2 flex justify-center gap-1.5">
                {categories?.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const container = scrollRef.current;
                      if (!container) return;
                      const firstCard = container.querySelector('[data-card="true"]');
                      const cardWidth = firstCard?.getBoundingClientRect().width ?? 280;
                      const gap = 24;
                      const middleSetStart = totalItems * (cardWidth + gap);
                      container.scrollTo({ 
                        left: middleSetStart + (i * (cardWidth + gap)), 
                        behavior: 'smooth' 
                      });
                      setActiveIndex(i);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === activeIndex ? 'w-8 bg-emerald-500' : 'w-2 bg-gray-300 hover:bg-emerald-300'
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
