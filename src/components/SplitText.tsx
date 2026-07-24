import React, { useRef, useEffect, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: 'chars' | 'words' | 'lines' | 'words, chars';
  from?: Record<string, any>;
  to?: Record<string, any>;
  threshold?: number;
  rootMargin?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  onLetterAnimationComplete?: () => void;
}

export const SplitText: React.FC<SplitTextProps> = ({
  text = '',
  className = '',
  delay = 50,
  duration = 0.8,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete
}) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const animationCompletedRef = useRef(false);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useEffect(() => {
    if (document.fonts && document.fonts.status === 'loaded') {
      setFontsLoaded(true);
    } else if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => setFontsLoaded(true));
    } else {
      setFontsLoaded(true);
    }
  }, []);

  // Split text into words and chars for rendering
  const textElements = useMemo(() => {
    if (!text) return [];
    if (splitType.includes('words')) {
      const words = text.split(' ');
      return words.map((word, wIdx) => ({
        id: `word-${wIdx}`,
        content: word,
        chars: word.split('').map((char, cIdx) => ({
          id: `char-${wIdx}-${cIdx}`,
          char
        }))
      }));
    } else {
      // chars mode
      return text.split('').map((char, cIdx) => ({
        id: `char-${cIdx}`,
        char
      }));
    }
  }, [text, splitType]);

  useGSAP(
    () => {
      if (!containerRef.current || !text || !fontsLoaded) return;
      if (animationCompletedRef.current) return;

      const el = containerRef.current;
      const targets = el.querySelectorAll('.split-item');

      if (!targets || targets.length === 0) return;

      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
      const sign =
        marginValue === 0
          ? ''
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}`
            : `+=${marginValue}${marginUnit}`;
      const start = `top ${startPct}%${sign}`;

      gsap.fromTo(
        targets,
        { ...from },
        {
          ...to,
          duration,
          ease,
          stagger: delay / 1000,
          scrollTrigger: {
            trigger: el,
            start,
            once: true,
            fastScrollEnd: true
          },
          onComplete: () => {
            animationCompletedRef.current = true;
            onCompleteRef.current?.();
          },
          willChange: 'transform, opacity',
          force3D: true
        }
      );
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        fontsLoaded
      ],
      scope: containerRef
    }
  );

  const Tag: any = tag || 'p';

  const style: React.CSSProperties = {
    textAlign,
    display: 'inline-block',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    willChange: 'transform, opacity'
  };

  return (
    <Tag
      ref={containerRef as any}
      style={style}
      className={`split-parent ${className}`}
    >
      {splitType.includes('words') ? (
        (textElements as Array<{ id: string; content: string; chars: Array<{ id: string; char: string }> }>).map(
          (wordObj, wIdx) => (
            <span key={wordObj.id} className="inline-block whitespace-nowrap mr-[0.25em]">
              {wordObj.chars.map((item) => (
                <span
                  key={item.id}
                  className="split-item inline-block"
                  style={{ display: 'inline-block', willChange: 'transform, opacity' }}
                >
                  {item.char}
                </span>
              ))}
            </span>
          )
        )
      ) : (
        (textElements as Array<{ id: string; char: string }>).map((item) => (
          <span
            key={item.id}
            className="split-item inline-block"
            style={{ display: 'inline-block', willChange: 'transform, opacity' }}
          >
            {item.char === ' ' ? '\u00A0' : item.char}
          </span>
        ))
      )}
    </Tag>
  );
};

export default SplitText;
