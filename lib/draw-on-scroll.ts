/**
 * Where a scroll-drawn ornament should finish, in absolute scroll pixels.
 *
 * A self-drawing SVG tied to `scrub` only completes if the scroll position it
 * asks for actually exists. The rangoli on Our Story asked for a point 120px
 * past the end of the document — it is the last thing on that page — so the
 * drawing froze at 85% and its two outer rings never closed. ScrollTrigger
 * accepts an unreachable range without complaint; the guest simply runs out of
 * page.
 *
 * So every ornament here ends at the position its design asks for **or** the
 * furthest the page can actually reach, whichever comes first, held back by a
 * margin so the last stroke lands while the ornament is still being looked at
 * rather than on the final pixel.
 *
 * Pure on purpose: the caller measures and passes the numbers in, so this can
 * be reasoned about without a browser and so nothing in `lib/` has to import
 * gsap.
 */

export interface DrawRange {
  /** Document-absolute top of the ornament, in px. */
  elementTop: number;
  elementHeight: number;
  viewportHeight: number;
  /** Furthest the document can scroll — `ScrollTrigger.maxScroll(window)`. */
  maxScroll: number;
  /** Where drawing starts, as a fraction of the viewport the element's top
   *  passes. 0.88 means "when the top is 88% of the way down the screen". */
  startRatio: number;
  /** Where drawing would finish by design, as the fraction of the viewport the
   *  element's bottom reaches. */
  endRatio: number;
  /** Viewport fractions left between the last stroke and the page bottom. A
   *  fraction rather than a pixel count, so a phone gets the same breathing
   *  room as a laptop. */
  marginRatio?: number;
  /** Shortest scroll distance the drawing may be squeezed into. Below this a
   *  staggered set of strokes lands in a blur rather than a draw. */
  minRange?: number;
}

export function drawStart({ elementTop, viewportHeight, startRatio }: DrawRange): number {
  return elementTop - viewportHeight * startRatio;
}

export function drawEnd(range: DrawRange): number {
  const { elementTop, elementHeight, viewportHeight, maxScroll, endRatio } = range;
  const marginRatio = range.marginRatio ?? 0.2;
  const minRange = range.minRange ?? 320;

  const designed = elementTop + elementHeight - viewportHeight * endRatio;
  const reachable = maxScroll - viewportHeight * marginRatio;

  // The floor keeps the range from collapsing — or inverting — when an element
  // sits so close to the bottom that even the clamped end falls behind where
  // the drawing was meant to start.
  return Math.max(drawStart(range) + minRange, Math.min(designed, reachable));
}

/** Measure an element against the current document. The caller supplies
 *  `maxScroll` because only the animation library knows the scroller. */
export function measure(
  node: Element,
  maxScroll: number,
): Pick<DrawRange, "elementTop" | "elementHeight" | "viewportHeight" | "maxScroll"> {
  const rect = node.getBoundingClientRect();
  return {
    // `rect.top + scrollY` is document-absolute whatever the current scroll
    // position is, which matters because ScrollTrigger calls this during a
    // refresh that may have moved the page.
    elementTop: rect.top + window.scrollY,
    elementHeight: rect.height,
    viewportHeight: window.innerHeight,
    maxScroll,
  };
}
