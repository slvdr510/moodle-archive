// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { findWrappedFileUrl } from '../src/content/moodleCrawler';

function parse(body: string): Document {
  return new DOMParser().parseFromString(`<html><body><div role="main">${body}</div></body></html>`, 'text/html');
}

const FILE = 'https://aulasvirtuales.uhu.es/pluginfile.php/254038/mod_resource/content/1/Distribuciones%20GNU%20Linux%20.png';

describe('findWrappedFileUrl', () => {
  it('follows the link of an "open in a new window" wrapper page', () => {
    const doc = parse(`<div class="resourceworkaround">Click <a href="${FILE}">here</a></div>`);
    expect(findWrappedFileUrl(doc)).toBe(FILE);
  });

  it('takes the image of an embedded image resource', () => {
    const doc = parse(
      `<div class="resourcecontent resourceimg"><img title="Distribuciones GNU Linux" class="resourceimage" src="${FILE}" alt=""></div>`
    );
    expect(findWrappedFileUrl(doc)).toBe(FILE);
  });

  it('takes the file of an embedded object or iframe', () => {
    expect(findWrappedFileUrl(parse(`<div class="resourcecontent"><object id="resourceobject" data="${FILE}"></object></div>`))).toBe(FILE);
    expect(findWrappedFileUrl(parse(`<div class="resourcecontent"><iframe id="resourceobject" src="${FILE}"></iframe></div>`))).toBe(FILE);
  });

  it('ignores embedded content that is not the resource file', () => {
    const doc = parse(`<div class="resourcecontent"><iframe src="https://www.youtube.com/embed/abc"></iframe></div>`);
    expect(findWrappedFileUrl(doc)).toBeUndefined();
  });

  it('finds nothing on a page that is not a wrapper', () => {
    expect(findWrappedFileUrl(parse('<p>Hello</p>'))).toBeUndefined();
  });
});
