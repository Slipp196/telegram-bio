import React, { useEffect, useRef, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const isVisible = useRef(false);

  const [isPointer, setIsPointer] = useState(false);
  const [isTextInput, setIsTextInput] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isSupportedDevice, setIsSupportedDevice] = useState(true);

  useEffect(() => {
    // Only show on devices with a fine pointer (mouse/trackpad)
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsSupportedDevice(false);
      return;
    }

    let animId: number;

    const updatePosition = (clientX: number, clientY: number) => {
      // Validate coordinates to avoid teleporting to screen edges on synthetic right-click events
      if (
        typeof clientX !== 'number' ||
        typeof clientY !== 'number' ||
        isNaN(clientX) ||
        isNaN(clientY)
      ) {
        return;
      }

      // Filter out bogus (0, innerHeight) coordinates that some browsers fire on context menu gestures
      if (clientX === 0 && clientY >= window.innerHeight - 5) {
        return;
      }

      mousePos.current = { x: clientX, y: clientY };

      if (!isVisible.current) {
        isVisible.current = true;
        ringPos.current = { x: clientX, y: clientY };
        if (dotRef.current) dotRef.current.style.opacity = '1';
        if (ringRef.current) ringRef.current.style.opacity = '1';
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      updatePosition(e.clientX, e.clientY);

      // Check hover target
      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = Boolean(
          target.closest('button, a, input, textarea, select, [role="button"], label, .cursor-pointer, .interactive-hover')
        );
        const isInput = Boolean(target.closest('input[type="text"], input[type="url"], textarea'));
        setIsPointer(isClickable && !isInput);
        setIsTextInput(isInput);
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      // Only trigger click styling for primary (left) button
      if (e.button === 0) {
        setIsClicked(true);
      }
      updatePosition(e.clientX, e.clientY);
    };

    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        setIsClicked(false);
      }
      updatePosition(e.clientX, e.clientY);
    };

    const onContextMenu = (e: MouseEvent) => {
      // Keep position pinned right at click point, avoid any coordinate shift
      updatePosition(e.clientX, e.clientY);
    };

    const onMouseLeave = () => {
      isVisible.current = false;
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('mouseleave', onMouseLeave);

    // 120 FPS high-performance render loop using translate3d + center translate
    const loop = () => {
      // Immediate response for dot with explicit 50% centering
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`;
      }

      // Smooth buttery lag for ring with explicit 50% centering
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.22;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.22;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  if (!isSupportedDevice) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none">
      {/* Outer Halo / Trailing Ring in Monochrome Frosted Glass */}
      <div
        ref={ringRef}
        style={{
          top: 0,
          left: 0,
          opacity: 0,
          willChange: 'transform, opacity, width, height',
        }}
        className={`absolute rounded-full transition-[width,height,border-color,background-color] duration-150 ease-out border ${
          isTextInput
            ? 'w-1.5 h-6 rounded-sm bg-white/90 border-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
            : isClicked
            ? 'w-8 h-8 border-white bg-white/20 shadow-[0_0_16px_rgba(255,255,255,0.6)]'
            : isPointer
            ? 'w-11 h-11 border-white/60 bg-white/10 backdrop-blur-[2px] shadow-[0_0_12px_rgba(255,255,255,0.4)]'
            : 'w-7 h-7 border-white/40 bg-white/5 shadow-[0_0_8px_rgba(255,255,255,0.2)]'
        }`}
      />

      {/* Center Precision Point: Concentric with ring, never drifts on right click */}
      <div
        ref={dotRef}
        style={{
          top: 0,
          left: 0,
          opacity: 0,
          willChange: 'transform, opacity',
        }}
        className={`absolute transition-[background-color,width,height] duration-100 ${
          isTextInput
            ? 'opacity-0'
            : isPointer
            ? 'w-2 h-2 bg-white rounded-full shadow-[0_0_8px_#ffffff]'
            : isClicked
            ? 'w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_#ffffff]'
            : 'w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.9)]'
        }`}
      />
    </div>
  );
};
