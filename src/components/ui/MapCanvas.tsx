import { useEffect, useRef, useState } from 'react';
import type { ReactNode, PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from 'react';
import mapBg from '../../assets/map_bg.png';

/**
 * 古地図＋ピンの共通キャンバス。
 *
 * ポイント: 地図画像（正方形）を「コンテナの短辺に合わせた正方形」で描画し、
 * ピンはその正方形に対する%座標で配置する。これにより、コンテナの
 * アスペクト比や object-cover のクロップに影響されず、ピンが常に
 * 画像上の同じ地点を指す（従来のピンずれの原因を解消）。
 */

interface ViewState {
  scale: number;
  tx: number;
  ty: number;
}

interface MapCanvasProps {
  /** ホイール拡大＋ドラッグ移動＋ダブルクリックリセットを有効化 */
  interactive?: boolean;
  /** 外枠のサイズ・装飾（w-full, aspect-*, bg-* など） */
  className?: string;
  /** 地図画像に適用するクラス */
  imgClassName?: string;
  /** ピン群。ズーム倍率を受け取るので scale(1/scale) でピンサイズを一定に保てる */
  children?: (state: { scale: number }) => ReactNode;
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const ZOOM_STEP = 1.15;
const DRAG_THRESHOLD_PX = 5;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// 拡大した地図が枠から離れすぎないようパン量を制限
const clampPan = (t: number, scale: number, mapSide: number) => {
  const max = (mapSide * (scale - 1)) / 2;
  return clamp(t, -max, max);
};

export default function MapCanvas({
  interactive = false,
  className = '',
  imgClassName = 'opacity-80 mix-blend-multiply',
  children,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState(0); // 地図正方形の一辺(px) = コンテナ短辺
  const [view, setView] = useState<ViewState>({ scale: 1, tx: 0, ty: 0 });
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; baseTx: number; baseTy: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);

  // コンテナサイズ追従
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setSide(Math.min(el.clientWidth, el.clientHeight));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ホイールズーム（カーソル位置を基準に拡大縮小）
  useEffect(() => {
    if (!interactive) return;
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;
      setView(v => {
        const scale = clamp(v.scale * (e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP), MIN_SCALE, MAX_SCALE);
        const r = scale / v.scale;
        const s = Math.min(el.clientWidth, el.clientHeight);
        return {
          scale,
          tx: clampPan(cx - r * (cx - v.tx), scale, s),
          ty: clampPan(cy - r * (cy - v.ty), scale, s),
        };
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [interactive]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive || view.scale <= 1) return;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      baseTx: view.tx,
      baseTy: view.ty,
      moved: false,
    };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved) {
      // 閾値未満はクリックとして扱う（ピンのクリックを妨げない）
      if (Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD_PX) return;
      d.moved = true;
      e.currentTarget.setPointerCapture(d.pointerId);
    }
    setView(v => ({
      ...v,
      tx: clampPan(d.baseTx + dx, v.scale, side),
      ty: clampPan(d.baseTy + dy, v.scale, side),
    }));
  };

  const endDrag = () => {
    if (dragRef.current?.moved) suppressClickRef.current = true;
    dragRef.current = null;
  };

  // ドラッグ直後のクリックがピンに飛ばないよう抑止
  const onClickCapture = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={interactive ? { touchAction: 'none', cursor: view.scale > 1 ? 'grab' : 'default' } : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={onClickCapture}
      onDoubleClick={() => interactive && setView({ scale: 1, tx: 0, ty: 0 })}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative shrink-0"
          style={{
            width: side,
            height: side,
            transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`,
          }}
        >
          <img
            src={mapBg}
            alt="古地図風日本地図"
            draggable={false}
            className={`w-full h-full select-none pointer-events-none ${imgClassName}`}
          />
          {children?.({ scale: view.scale })}
        </div>
      </div>
      {interactive && (
        <div className="absolute bottom-2 right-2 bg-white/70 text-brand-text/70 text-[10px] px-2 py-1 rounded pointer-events-none hidden sm:block">
          ホイールで拡大 ／ ドラッグで移動 ／ ダブルクリックで戻す
        </div>
      )}
    </div>
  );
}
