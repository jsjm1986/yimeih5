import { useState } from 'react';
import './BeforeAfterSlider.css';

interface Props {
  beforeUrl: string;
  afterUrl: string;
}

export function BeforeAfterSlider({ beforeUrl, afterUrl }: Props) {
  const [pos, setPos] = useState(50);

  return (
    <div className="bas">
      <img src={beforeUrl} alt="处理前" />
      <img
        src={afterUrl}
        alt="处理后"
        data-testid="after-layer"
        style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
      />
      <div className="bas-handle-line" style={{ left: `${pos}%` }} />
      <span className="bas-label before">处理前</span>
      <span className="bas-label after">处理后</span>
      <input
        className="bas-range"
        type="range"
        min={0}
        max={100}
        value={pos}
        aria-label="对比滑块"
        onChange={(e) => setPos(Number(e.target.value))}
      />
    </div>
  );
}
