"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { CaretLeft, CaretRight, Pause, Play, ArrowRight } from "./icons";
import { ProductCard } from "./product-card";
import { assetUrl, type ProductRecord } from "@/lib/types";
export type Campaign = {
  title: string;
  copy: string;
  image: string;
  alt: string;
  href: string;
  button: string;
};
export function CampaignSlider({ slides }: { slides: Campaign[] }) {
  const [active, setActive] = useState(0),
    [paused, setPaused] = useState(false),
    [interacting, setInteracting] = useState(false);
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || paused || interacting || slides.length < 2) return;
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    if (root.current) observer.observe(root.current);
    const timer = window.setInterval(() => {
      if (visible && !document.hidden)
        setActive((value) => (value + 1) % slides.length);
    }, 7000);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [reduced, paused, interacting, slides.length]);
  return (
    <section
      ref={root}
      className="campaign-slider"
      aria-label="Vaidora fragrance collections"
      aria-roledescription="carousel"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setInteracting(false);
      }}
    >
      <div className="campaign-backdrop" aria-hidden="true">
        <Image
          src="/display/photographic-environment.webp"
          alt=""
          fill
          preload
          sizes="100vw"
        />
      </div>
      {slides.map((slide, index) => (
        <div
          key={slide.title}
          className={`campaign-slide${active === index ? " is-active" : ""}`}
          aria-hidden={active !== index}
          inert={active !== index}
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${slides.length}`}
        >
          <div className="campaign-photo">
            <Image
              src={assetUrl(slide.image)}
              alt={slide.alt}
              fill
              preload={index === 0}
              sizes="(max-width: 700px) 100vw, 65vw"
            />
          </div>
          <div className="campaign-shade" />
          <div className="campaign-content container">
            {index === 0 ? <h1>{slide.title}</h1> : <h2>{slide.title}</h2>}
            <p>{slide.copy}</p>
            <Link href={slide.href} className="button campaign-button">
              {slide.button}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      ))}
      <div className="campaign-controls">
        <button
          className="campaign-arrow"
          aria-label="Previous campaign"
          onClick={() => {
            setPaused(true);
            setActive((active + slides.length - 1) % slides.length);
          }}
        >
          <CaretLeft size={17} />
        </button>
        <div className="campaign-dots">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              aria-label={`Go to slide ${index + 1}`}
              aria-pressed={active === index}
              onClick={() => {
                setPaused(true);
                setActive(index);
              }}
            >
              <span />
            </button>
          ))}
        </div>
        <button
          className="campaign-arrow"
          aria-label="Next campaign"
          onClick={() => {
            setPaused(true);
            setActive((active + 1) % slides.length);
          }}
        >
          <CaretRight size={17} />
        </button>
        {!reduced && (
          <button
            className="campaign-pause"
            aria-label={paused ? "Play campaigns" : "Pause campaigns"}
            onClick={() => setPaused(!paused)}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
        )}
      </div>
    </section>
  );
}
export function ProductRail({
  products,
  label,
  preferredSize = 100,
  heading,
}: {
  products: ProductRecord[];
  label: string;
  preferredSize?: number;
  heading?: string;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ start: true, end: false });
  const reduced = useReducedMotion();
  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const measure = () =>
      setPosition({
        start: element.scrollLeft < 2,
        end:
          element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
      });
    measure();
    element.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", measure);
    };
  }, [products]);
  const move = (direction: number) => {
    const element = rail.current;
    if (element)
      element.scrollBy({
        left: direction * element.clientWidth,
        behavior: reduced ? "instant" : "smooth",
      });
  };
  const controls = (
    <div className="rail-controls">
      <button
        className="rail-arrow"
        aria-label={`Previous ${label}`}
        disabled={position.start}
        onClick={() => move(-1)}
      >
        <CaretLeft size={19} />
      </button>
      <button
        className="rail-arrow"
        aria-label={`Next ${label}`}
        disabled={position.end}
        onClick={() => move(1)}
      >
        <CaretRight size={19} />
      </button>
    </div>
  );
  return (
    <div className="product-rail-wrap">
      {heading && (
        <div className="rail-heading">
          <h2>{heading}</h2>
          {controls}
        </div>
      )}
      <div
        ref={rail}
        className="product-rail"
        role="region"
        aria-label={label}
        tabIndex={0}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            preferredSize={preferredSize}
          />
        ))}
      </div>
      {!heading && controls}
    </div>
  );
}
export function CollectionShowcase({
  products,
}: {
  products: ProductRecord[];
}) {
  const groups = ["Men", "Women", "Unisex"];
  const [active, setActive] = useState("Men");
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  return (
    <section className="collection-showcase container" id="collection">
      <h2 className="center-heading">Collection</h2>
      <div
        className="collection-tabs"
        role="tablist"
        aria-label="Fragrance collections"
      >
        {groups.map((group, index) => (
          <button
            key={group}
            ref={(element) => {
              tabs.current[index] = element;
            }}
            id={`collection-tab-${group}`}
            role="tab"
            aria-selected={active === group}
            aria-controls="collection-products"
            tabIndex={active === group ? 0 : -1}
            onClick={() => setActive(group)}
            onKeyDown={(event) => {
              if (
                !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              )
                return;
              event.preventDefault();
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? groups.length - 1
                    : (index +
                        (event.key === "ArrowRight" ? 1 : -1) +
                        groups.length) %
                      groups.length;
              setActive(groups[next]);
              tabs.current[next]?.focus();
            }}
          >
            {group === "Men"
              ? "Men’s Perfumes"
              : group === "Women"
                ? "Women’s Perfumes"
                : "Unisex Perfumes"}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id="collection-products"
        aria-labelledby={`collection-tab-${active}`}
      >
        <ProductRail
          key={active}
          products={products.filter((p) => p.category === active).slice(0, 8)}
          label={`${active.toLowerCase()} fragrances`}
        />
      </div>
    </section>
  );
}
