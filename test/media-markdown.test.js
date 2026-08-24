import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkdownImages, serializeMarkdownImage } from '../src/media-markdown.js';

test('parseMarkdownImages keeps balanced parentheses in image URLs', () => {
  const source = '![Cover](https://example.com/image_(1).jpg)';
  const [image] = parseMarkdownImages(source);

  assert.equal(image.src, 'https://example.com/image_(1).jpg');
  assert.equal(source.slice(image.start, image.end), source);
});

test('parseMarkdownImages supports escaped delimiters and optional titles', () => {
  const source = '![Product](https://example.com/a\\)b.png "Product image")';
  const [image] = parseMarkdownImages(source);

  assert.equal(image.src, 'https://example.com/a\\)b.png');
  assert.equal(image.title, 'Product image');
});

test('parseMarkdownImages returns exact ranges for multiple images', () => {
  const first = '![One](https://example.com/one.png)';
  const second = '![Two](https://example.com/two_(2).png)';
  const source = `${first}\n\n${second}`;
  const images = parseMarkdownImages(source);

  assert.equal(images.length, 2);
  assert.equal(source.slice(images[0].start, images[0].end), first);
  assert.equal(source.slice(images[1].start, images[1].end), second);
});

test('serializeMarkdownImage preserves a valid optional title', () => {
  assert.equal(
    serializeMarkdownImage({
      caption: 'Updated image',
      src: 'https://example.com/image_(1).jpg',
      title: 'Image title'
    }),
    '![Updated image](https://example.com/image_(1).jpg "Image title")'
  );
});