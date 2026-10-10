import { describe, expect, it } from 'vitest';
import { clampView, defaultView, fitHeightView, fitView, fitWidthView, MAX_SCALE, nextZoomLevel, panBy, zoomAt, type ImageSizes } from '../src/viewer/imageView';

// A tall diagram in a landscape window: fitted, it's 100px wide and 800px tall.
const tall: ImageSizes = { imageWidth: 1000, imageHeight: 8000, viewportWidth: 1000, viewportHeight: 800 };

describe('fitView', () => {
  it('shrinks a large image to fit and centers it', () => {
    expect(fitView(tall)).toEqual({ x: 450, y: 0, scale: 0.1 });
  });

  it('never enlarges a small image past actual size', () => {
    expect(fitView({ imageWidth: 100, imageHeight: 50, viewportWidth: 1000, viewportHeight: 800 })).toEqual({
      x: 450,
      y: 375,
      scale: 1
    });
  });
});

describe('zoomAt', () => {
  it('keeps the point under the cursor in place', () => {
    const wide: ImageSizes = { ...tall, imageWidth: 4000 };
    const view = zoomAt({ x: -500, y: -1000, scale: 0.5 }, 2, 500, 400, wide);
    expect(view.scale).toBe(1);
    // The image pixel under (500, 400) was (2000, 2800) before, and still is.
    expect((500 - view.x) / view.scale).toBe(2000);
    expect((400 - view.y) / view.scale).toBe(2800);
  });

  it('never zooms out past fitting the window, nor in past the maximum', () => {
    expect(zoomAt(fitView(tall), 0.5, 500, 400, tall)).toEqual(fitView(tall));
    expect(zoomAt({ x: 0, y: 0, scale: MAX_SCALE / 2 }, 10, 0, 0, tall).scale).toBe(MAX_SCALE);
  });
});

describe('panBy / clampView', () => {
  it('keeps an image no larger than the window centered, however it is moved', () => {
    expect(panBy(fitView(tall), 300, 500, tall)).toEqual(fitView(tall));
  });

  it("stops a larger image's edges at the window's edges", () => {
    const zoomed = { x: -100, y: -100, scale: 1 }; // 1000 x 8000: fills the width, overflows the height
    expect(panBy(zoomed, 500, 500, tall)).toEqual({ x: 0, y: 0, scale: 1 });
    expect(panBy(zoomed, 0, -100_000, tall)).toEqual({ x: 0, y: 800 - 8000, scale: 1 });
  });

  it('brings a view back inside the window after a resize', () => {
    // At 0.1 the image is 100 x 800: scrolled to its bottom in an 800px window, it
    // must move back up once the window is only 400px tall.
    const shorterWindow = { ...tall, viewportHeight: 400 };
    expect(clampView({ x: 450, y: -1000, scale: 0.1 }, shorterWindow)).toEqual({ x: 450, y: -400, scale: 0.1 });
  });
});

describe('nextZoomLevel', () => {
  it('steps through round levels from the fitted 100%', () => {
    expect(nextZoomLevel(100, 1)).toBe(125);
    expect(nextZoomLevel(125, 1)).toBe(150);
    expect(nextZoomLevel(150, -1)).toBe(125);
    expect(nextZoomLevel(100, -1)).toBe(75);
    expect(nextZoomLevel(10, -1)).toBeUndefined();
  });

  it('snaps an in-between level (from a wheel zoom) to the next round one', () => {
    expect(nextZoomLevel(137, 1)).toBe(150);
    expect(nextZoomLevel(137, -1)).toBe(125);
    expect(nextZoomLevel(100.0001, 1)).toBe(125);
  });

  it('keeps doubling past the end of the table', () => {
    expect(nextZoomLevel(2000, 1)).toBe(4000);
    expect(nextZoomLevel(4000, -1)).toBe(2000);
    expect(nextZoomLevel(5000, -1)).toBe(4000);
  });
});

describe('fitWidthView', () => {
  it("fills the window's width, starting from the image's top", () => {
    expect(fitWidthView({ ...tall, imageWidth: 500, imageHeight: 4000 })).toEqual({ x: 0, y: 0, scale: 2 });
  });
});

describe('fitHeightView', () => {
  it("fills the window's height, starting from the image's left edge", () => {
    const wide: ImageSizes = { imageWidth: 4000, imageHeight: 400, viewportWidth: 1000, viewportHeight: 800 };
    expect(fitHeightView(wide)).toEqual({ x: 0, y: 0, scale: 2 });
  });
});

describe('defaultView', () => {
  it('fills the height for a portrait image and the width for any other', () => {
    expect(defaultView(tall)).toEqual({ x: 450, y: 0, scale: 0.1 });
    const landscape: ImageSizes = { imageWidth: 4000, imageHeight: 3000, viewportWidth: 1000, viewportHeight: 500 };
    expect(defaultView(landscape)).toEqual({ x: 0, y: 0, scale: 0.25 });
  });

  it('shows an image that fits in the window at its actual size, centered', () => {
    const small: ImageSizes = { imageWidth: 200, imageHeight: 300, viewportWidth: 1000, viewportHeight: 800 };
    expect(defaultView(small)).toEqual({ x: 400, y: 250, scale: 1 });
  });
});
