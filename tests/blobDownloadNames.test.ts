import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  downloadBlobUrl,
  forgetDownloadName,
  installDownloadNaming,
  lookUpDownloadName,
  rememberDownloadName
} from '../src/lib/blobDownloadNames';

type Listener = (item: { url: string; finalUrl: string }, suggest: (s?: object) => void) => boolean;
let listener: Listener | undefined;
let storage: Record<string, unknown>;

beforeEach(() => {
  storage = {};
  listener = undefined;
  vi.stubGlobal('chrome', {
    storage: {
      session: {
        set: async (items: Record<string, unknown>) => void Object.assign(storage, items),
        get: async (key: string) => (key in storage ? { [key]: storage[key] } : {}),
        remove: async (key: string) => void delete storage[key]
      }
    },
    downloads: {
      onDeterminingFilename: { addListener: (l: Listener) => (listener = l) },
      download: vi.fn(async () => 1)
    }
  });
});

const BLOB = 'blob:chrome-extension://abc/3c4af0c2-61fa-44b5-945c-9d1182d3472f';

function determine(url: string): Promise<object | undefined> {
  return new Promise((resolve) => {
    expect(listener!({ url, finalUrl: url }, resolve)).toBe(true);
  });
}

describe('blob download names', () => {
  it('looks up a remembered blob URL, ignoring any fragment', async () => {
    await rememberDownloadName(BLOB, 'Tema_2.pdf');
    expect(await lookUpDownloadName(BLOB)).toBe('Tema_2.pdf');
    expect(await lookUpDownloadName(`${BLOB}#page=3`)).toBe('Tema_2.pdf');
    await forgetDownloadName(BLOB);
    expect(await lookUpDownloadName(BLOB)).toBeUndefined();
  });

  it('suggests the real filename for a viewer blob and leaves other downloads alone', async () => {
    installDownloadNaming();
    await rememberDownloadName(BLOB, 'Transparencias_del_Tema_2.pdf');

    expect(await determine(BLOB)).toEqual({ filename: 'Transparencias_del_Tema_2.pdf', conflictAction: 'uniquify' });
    expect(await determine('https://moodle.example/file.pdf')).toBeUndefined();
    expect(await determine('blob:chrome-extension://abc/unknown')).toBeUndefined();
  });

  it("keeps the filename of the extension's own downloads, which Chrome would otherwise drop", async () => {
    installDownloadNaming();
    URL.revokeObjectURL = vi.fn();

    await downloadBlobUrl(BLOB, 'CALENDARIO_DE_PRACTICAS.pdf');

    expect(chrome.downloads.download).toHaveBeenCalledWith({ url: BLOB, filename: 'CALENDARIO_DE_PRACTICAS.pdf' });
    expect(await determine(BLOB)).toEqual({ filename: 'CALENDARIO_DE_PRACTICAS.pdf', conflictAction: 'uniquify' });
  });
});
