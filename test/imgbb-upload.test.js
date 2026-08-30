import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import express from 'express';

import { createImgBBUploadRouter } from '../server.js';

const TEST_ENV = {
  IMGBB_API_KEY: 'test-imgbb-key',
  IMG_UPLOAD_PASSWORD: 'test-upload-password',
  SESSION_SECRET: 'test-session-secret'
};
const VALID_IMAGE = 'data:image/png;base64,iVBORw0KGgo=';

async function withUploadServer(providerFetch, callback) {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '12mb' }));
  app.use('/api', createImgBBUploadRouter({ env: TEST_ENV, providerFetch }));
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await callback(baseUrl);
  } finally {
    server.close();
    await once(server, 'close');
  }
}

async function createAuthorizedCookie(baseUrl) {
  const response = await fetch(`${baseUrl}/api/imgbb-upload-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: baseUrl
    },
    body: JSON.stringify({ password: TEST_ENV.IMG_UPLOAD_PASSWORD })
  });
  assert.equal(response.status, 200);
  return response.headers.get('set-cookie').split(';', 1)[0];
}

async function upload(baseUrl, image, cookie) {
  return fetch(`${baseUrl}/api/imgbb-upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: baseUrl,
      ...(cookie ? { Cookie: cookie } : {})
    },
    body: JSON.stringify({ image })
  });
}

test('ImgBB upload rejects requests without an authorized session', async () => {
  let providerCalled = false;
  await withUploadServer(async () => {
    providerCalled = true;
  }, async (baseUrl) => {
    const response = await upload(baseUrl, VALID_IMAGE);
    assert.equal(response.status, 401);
    assert.equal((await response.json()).code, 'UPLOAD_AUTH_REQUIRED');
    assert.equal(providerCalled, false);
  });
});

test('ImgBB upload rejects invalid image data after authorization', async () => {
  await withUploadServer(async () => assert.fail('Provider should not be called'), async (baseUrl) => {
    const cookie = await createAuthorizedCookie(baseUrl);
    const response = await upload(baseUrl, 'not-an-image', cookie);
    assert.equal(response.status, 400);
  });
});

test('ImgBB upload rejects images over 8MB before calling the provider', async () => {
  await withUploadServer(async () => assert.fail('Provider should not be called'), async (baseUrl) => {
    const cookie = await createAuthorizedCookie(baseUrl);
    const oversizedBase64 = 'A'.repeat(Math.ceil(((8 * 1024 * 1024) + 1) * 4 / 3));
    const response = await upload(baseUrl, `data:image/png;base64,${oversizedBase64}`, cookie);
    assert.equal(response.status, 413);
  });
});

test('ImgBB upload returns a safe error when the provider fails', async () => {
  const providerFetch = async () => new Response(JSON.stringify({
    success: false,
    error: { message: 'Provider rejected upload' }
  }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });

  await withUploadServer(providerFetch, async (baseUrl) => {
    const cookie = await createAuthorizedCookie(baseUrl);
    const response = await upload(baseUrl, VALID_IMAGE, cookie);
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), {
      error: 'ImgBB gagal menerima imej. Sila cuba lagi.'
    });
  });
});

test('ImgBB upload forwards valid data and returns only the hosted URL', async () => {
  let forwardedBody;
  const providerFetch = async (_url, options) => {
    forwardedBody = options.body;
    return new Response(JSON.stringify({
      success: true,
      data: {
        url: 'https://i.ibb.co/example/image.png',
        delete_url: 'https://ibb.co/delete/example'
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  await withUploadServer(providerFetch, async (baseUrl) => {
    const cookie = await createAuthorizedCookie(baseUrl);
    const response = await upload(baseUrl, VALID_IMAGE, cookie);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      url: 'https://i.ibb.co/example/image.png'
    });
    assert.equal(forwardedBody.get('key'), TEST_ENV.IMGBB_API_KEY);
    assert.equal(forwardedBody.get('image'), 'iVBORw0KGgo=');
  });
});