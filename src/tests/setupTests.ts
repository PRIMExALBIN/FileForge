import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Canvas
HTMLCanvasElement.prototype.getContext = vi.fn(() => {
  return {
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Array(100),
      width: 10,
      height: 10,
    })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => []),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
});

HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,');

// Mock Worker
class MockWorker {
  url: string;
  onmessage: (e: any) => void;
  onerror: (e: any) => void;

  constructor(stringUrl: string) {
    this.url = stringUrl;
    this.onmessage = () => {};
    this.onerror = () => {};
  }

  postMessage(msg: any) {
    // Simulate async response if needed, or just do nothing for now
  }
  terminate() {}
}

window.Worker = MockWorker as any;
window.URL.createObjectURL = vi.fn(() => 'mock-url');
window.URL.revokeObjectURL = vi.fn();

// Mock DOMMatrix for pdfjs-dist
class MockDOMMatrix {
  a = 1;
  b = 0;
  c = 0;
  d = 1;
  e = 0;
  f = 0;
  constructor() {}
  multiply() {
    return this;
  }
  invertSelf() {
    return this;
  }
  scale() {
    return this;
  }
  translate() {
    return this;
  }
  rotate() {
    return this;
  }
  toString() {
    return '[object DOMMatrix]';
  }
}
window.DOMMatrix = MockDOMMatrix as any;
