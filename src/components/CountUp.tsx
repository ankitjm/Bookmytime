import { useEffect } from 'react';
import { animate, useMotionValue, useTransform, motion } from 'framer-motion';

interface CountUpProps {
  value: number;
  /** Format the animated number for display. */
  format?: (n: number) => string;
  duration?: number;
}

/** Smoothly animates a number whenever `value` changes. */
export function CountUp({ value, format, duration = 0.8 }: CountUpProps) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (n) => (format ? format(n) : Math.round(n).toLocaleString()));

  useEffect(() => {
    const controls = animate(mv, value, { duration, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [value, duration, mv]);

  return <motion.span>{text}</motion.span>;
}
