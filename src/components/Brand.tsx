import logo from "@/assets/Ra2logofinal2.png?url";

export default function Brand({ className = "h-14" }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="RA2 Essentials Travel and Tours"
      className={`${className} w-auto object-contain`}
    />
  );
}
