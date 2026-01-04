import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

const DoodleItem = ({ path, className, style, delay = 0, depth = 1 }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 40 };
  const x = useSpring(useTransform(mouseX, [0, window.innerWidth], [-30 * depth, 30 * depth]), springConfig);
  const y = useSpring(useTransform(mouseY, [0, window.innerHeight], [-30 * depth, 30 * depth]), springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`absolute ${className}`}
      style={{ x, y, ...style }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: [0, 8, -8, 0],
        y: [0, -40, 0],
      }}
      transition={{
        opacity: { duration: 0.8, delay },
        scale: { duration: 0.8, delay },
        rotate: { duration: 12 + Math.random() * 8, repeat: Infinity, ease: "linear" },
        y: { duration: 4 + Math.random() * 4, repeat: Infinity, ease: "easeInOut" }
      }}
    >
      {path}
    </motion.svg>
  );
};

const BackgroundDoodles = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-10] overflow-hidden perspective-1000">

      {/* Background Ambience (Subtle Paper Tint) */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], rotate: [0, 60, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 18, repeat: Infinity }}
        className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-brand-surface-secondary blur-[120px] rounded-full"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], x: [0, 30, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 14, repeat: Infinity }}
        className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-brand-surface-primary blur-[140px] rounded-full"
      />

      {/* --- DOODLES (Stationery & Print Theme) --- */}

      {/* 1. Printer (Darkest/Focus) */}
      <DoodleItem
        path={<><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v8H6z" /></>}
        className="w-56 h-56 top-[8%] right-[8%] text-brand-text-primary/5"
        depth={2.5}
        delay={0}
      />

      {/* 2. Stack of Papers (Medium) */}
      <DoodleItem
        path={<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>}
        className="w-40 h-40 top-[35%] left-[3%] text-brand-text-muted/10"
        depth={2}
        delay={0.3}
      />

      {/* 3. Scissors (Lighter) */}
      <DoodleItem
        path={<><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></>}
        className="w-32 h-32 bottom-[12%] left-[12%] text-brand-text-disabled/15 rotate-[30deg]"
        depth={1.5}
        delay={0.6}
      />

      {/* 4. Folder (New: Replaces Coffee) */}
      <DoodleItem
        path={<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />}
        className="w-24 h-24 top-[18%] left-[20%] text-brand-text-muted/10"
        depth={1}
        delay={0.9}
      />

      {/* 5. Paper Plane (Motion element) */}
      <DoodleItem
        path={<path d="M2 12h20M2 12l10-9M2 12l10 9" />}
        className="w-72 h-72 bottom-[2%] right-[2%] text-brand-text-primary/5"
        depth={3.5}
        delay={0.2}
      />

      {/* 6. Pen/Pencil (New: Replaces Squiggle) */}
      <DoodleItem
        path={<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />}
        className="w-24 h-24 top-[55%] right-[25%] text-brand-text-muted/10"
        depth={1.2}
        delay={0.8}
      />

      {/* 7. Document Lines (Background texture) */}
      <DoodleItem
        path={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>}
        className="w-32 h-32 bottom-[25%] left-[45%] text-brand-text-disabled/10"
        depth={1.8}
        delay={1.1}
      />

      {/* 8. Ruler (Precision) */}
      <DoodleItem
        path={<><path d="M2 12h20" /><path d="M2 12v6" /><path d="M22 12v6" /><path d="M7 12v4" /><path d="M12 12v4" /><path d="M17 12v4" /></>}
        className="w-48 h-24 top-[5%] left-[40%] text-brand-text-muted/10 rotate-6"
        depth={1}
        delay={1.5}
      />

      {/* 9. Paperclip (New: Replaces Shield) */}
      <DoodleItem
        path={<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />}
        className="w-20 h-20 bottom-[55%] left-[20%] text-brand-text-link/10"
        depth={0.5}
        delay={2}
      />

    </div>
  );
};

export default BackgroundDoodles;
