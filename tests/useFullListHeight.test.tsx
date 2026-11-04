// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/preact';
import { useRef } from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { useFullListHeight } from '../src/dashboard/hooks/useFullListHeight';

// jsdom lays nothing out: each list says how tall it is in data-height.
const offsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')!;
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get(this: HTMLElement) {
      return Number(this.dataset.height ?? 0);
    }
  });
});
afterAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', offsetHeight);
});

afterEach(cleanup);

function List({ searching, height }: { searching: boolean; height: number }) {
  const ref = useRef<HTMLUListElement>(null);
  useFullListHeight(ref, searching);
  return <ul ref={ref} data-height={height} />;
}

const fullHeight = (container: Element) => (container.firstChild as HTMLElement).style.getPropertyValue('--full-list-height');

describe('useFullListHeight', () => {
  it('keeps the height the list had with every file while a search shrinks it, and follows it again after', () => {
    const { container, rerender } = render(<List searching={false} height={300} />);
    expect(fullHeight(container)).toBe('300px');

    rerender(<List searching height={40} />);
    expect(fullHeight(container)).toBe('300px');

    rerender(<List searching={false} height={320} />);
    expect(fullHeight(container)).toBe('320px');
  });
});
