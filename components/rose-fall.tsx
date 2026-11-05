type Petal = {
  left: string;
  size: number;
  fall: number;
  sway: number;
  delay: number;
  gold?: boolean;
  /** Petals past this point only appear once there is room for them. */
  wide?: boolean;
};

/**
 * Fixed values rather than Math.random, so the server and the client render
 * the same thing and hydration stays quiet.
 */
const PETALS: Petal[] = [
  { left: "4%", size: 11, fall: 26, sway: 5.2, delay: 0 },
  { left: "17%", size: 8, fall: 34, sway: 6.4, delay: -11, gold: true },
  { left: "29%", size: 12, fall: 23, sway: 4.8, delay: -19 },
  { left: "43%", size: 9, fall: 31, sway: 5.9, delay: -5 },
  { left: "57%", size: 11, fall: 28, sway: 5.4, delay: -24 },
  { left: "71%", size: 8, fall: 36, sway: 6.1, delay: -14, gold: true },
  { left: "85%", size: 12, fall: 25, sway: 4.6, delay: -30 },
  { left: "95%", size: 9, fall: 33, sway: 5.7, delay: -8 },
  { left: "10%", size: 9, fall: 30, sway: 6.6, delay: -17, wide: true },
  { left: "23%", size: 12, fall: 27, sway: 5.1, delay: -27, wide: true },
  { left: "36%", size: 8, fall: 35, sway: 4.9, delay: -3, gold: true, wide: true },
  { left: "50%", size: 10, fall: 29, sway: 6.2, delay: -21, wide: true },
  { left: "64%", size: 12, fall: 24, sway: 5.5, delay: -12, wide: true },
  { left: "78%", size: 9, fall: 32, sway: 6.8, delay: -33, wide: true },
  { left: "90%", size: 10, fall: 28, sway: 5.0, delay: -26, gold: true, wide: true },
];

/**
 * Rose petals drifting behind the whole site.
 *
 * Fixed to the viewport, so one short loop covers a page of any length. Pure
 * CSS on two nested spans — one falling, one swaying — which the browser
 * composites on the GPU and never costs a JavaScript frame.
 *
 * It paints above the section backgrounds, because those are opaque and a
 * layer behind them would never be seen, but below the header, the
 * back-to-top button and the lightbox, which all carry higher z-indexes.
 * Decorative throughout: no accessible name, and it never takes a tap.
 */
export default function RoseFall() {
  return (
    <div
      aria-hidden="true"
      className="rose-petals pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {PETALS.map((petal, index) => (
        <span
          key={index}
          className={`rose-track ${petal.wide ? "hidden sm:block" : ""}`}
          style={{
            left: petal.left,
            animationDuration: `${petal.fall}s`,
            animationDelay: `${petal.delay}s`,
          }}
        >
          <span
            className={`rose ${petal.gold ? "rose-gold" : ""}`}
            style={{
              width: `${petal.size}px`,
              height: `${Math.round(petal.size * 1.3)}px`,
              opacity: 0.45,
              animationDuration: `${petal.sway}s`,
              animationDelay: `${petal.delay}s`,
            }}
          />
        </span>
      ))}
    </div>
  );
}
