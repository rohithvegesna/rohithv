/* Flip-digit price-board panel. Only ever animates numbers that already
   exist in the approved copy (the publication count). Pure CSS; the
   reduced-motion state is the final resting frame. */
export default function FlipStat({ digits, caption }) {
  return (
    <div className="text-center">
      <div className="flex justify-center gap-1.5" aria-hidden="true">
        {String(digits)
          .split("")
          .map((d, i) => (
            <span
              key={i}
              className="flip-digit flip-anim px-3 py-1 text-4xl sm:text-5xl"
            >
              {d}
            </span>
          ))}
      </div>
      <p className="sign-label mt-2.5 text-green">
        <span className="sr-only">{digits} </span>
        {caption}
      </p>
    </div>
  );
}
