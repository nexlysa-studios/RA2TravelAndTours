export default function Brand({ light = false }: { light?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-3 ${light ? "text-white" : "text-primary"}`}
    >
      <span className="font-display text-[2.5rem] font-semibold leading-none tracking-[-0.07em]">
        RA2<span className="text-gold">.</span>
      </span>
      <span
        className={`border-l pl-3 text-[10px] font-semibold uppercase leading-relaxed tracking-[0.22em] ${light ? "border-white/30" : "border-primary/25"}`}
      >
        Travel
        <br />
        &amp; Tours
      </span>
    </span>
  );
}
