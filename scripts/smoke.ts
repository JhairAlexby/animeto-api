/*
  Script de smoke test para la API Animeto.
  Ejecuta en orden: registro, login, crear post, crear comentario y reacciones.
  Uso: pnpm run smoke
*/

// Nota: usa fetch nativo de Node 18+.
// No dependemos de libs externas para mantenerlo simple.

type Json = Record<string, any>;

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function logStep(title: string) {
  console.log(`\n=== ${title} ===`);
}

function assert(condition: any, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function unwrap<T = any>(resp: any): T {
  return (resp && typeof resp === 'object' && 'data' in resp ? resp.data : resp) as T;
}

async function request(path: string, init: RequestInit & { json?: any } = {}) {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
  };

  // Si se pasa json, lo serializamos y configuramos Content-Type.
  if (init.json !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...init,
    headers,
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg = typeof data === 'object' && data && (data.message || data.error) ? data.message || data.error : res.statusText;
    throw new Error(`HTTP ${res.status}: ${msg}`);
  }

  return data;
}

async function smoke() {
  const unique = Date.now();
  const name = `Tester ${unique}`;
  const email = `tester_${unique}@example.com`;
  const password = 'Password123';

  logStep('Registro');
  let auth: { user: Json; accessToken: string };
  try {
    const registerResp = await request('/auth/register', {
      method: 'POST',
      // Enviamos JSON; la foto es opcional.
      json: { name, email, password },
    });
    auth = (registerResp?.data ?? registerResp) as any;
    console.log('Usuario registrado:', auth.user?.email ?? auth?.user);
  } catch (err: any) {
    if (String(err?.message || '').includes('409')) {
      console.log('Usuario ya existe, intentando login…');
      const loginResp = await request('/auth/login', {
        method: 'POST',
        json: { email, password },
      });
      auth = (loginResp?.data ?? loginResp) as any;
      console.log('Login OK:', auth.user?.email ?? auth?.user);
    } else {
      throw err;
    }
  }

  assert(auth?.accessToken, 'No se recibió accessToken');
  const token = auth.accessToken;

  logStep('Crear Post');
  const postResp = await request('/posts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    // JSON funciona aunque el endpoint acepte multipart, imagen es opcional.
    json: {
      description: `Post de prueba ${unique}`,
      type: 'manga',
    },
  });
  const post = unwrap(postResp);
  assert(post?.id, 'No se recibió ID del post');
  console.log('Post creado:', post.id);

  logStep('Crear Comentario');
  const commentResp = await request('/comments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    json: {
      content: 'Comentario de smoke test',
      postId: post.id,
    },
  });
  const comment = unwrap(commentResp);
  assert(comment?.id, 'No se recibió ID del comentario');
  console.log('Comentario creado:', comment.id);

  logStep('Reacción al Post (like)');
  const postReactionResp = await request('/reactions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    json: {
      type: 'like',
      target: 'post',
      postId: post.id,
    },
  });
  const postReaction = unwrap(postReactionResp);
  assert(postReaction?.id, 'No se recibió ID de reacción del post');
  console.log('Reacción al post creada:', postReaction.id);

  logStep('Reacción al Comentario (dislike)');
  const commentReactionResp = await request('/reactions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    json: {
      type: 'dislike',
      target: 'comment',
      commentId: comment.id,
    },
  });
  const commentReaction = unwrap(commentReactionResp);
  assert(commentReaction?.id, 'No se recibió ID de reacción del comentario');
  console.log('Reacción al comentario creada:', commentReaction.id);

  logStep('Verificar conteos de reacciones (post)');
  const postCountsResp = await request(`/reactions/post/${post.id}`, { method: 'GET' });
  const postCounts = unwrap(postCountsResp);
  console.log('Reacciones del post:', postCounts);

  logStep('Verificar conteos de reacciones (comentario)');
  const commentCountsResp = await request(`/reactions/comment/${comment.id}`, { method: 'GET' });
  const commentCounts = unwrap(commentCountsResp);
  console.log('Reacciones del comentario:', commentCounts);

  console.log('\n=== Resumen ===');
  console.log('Usuario:', auth.user);
  console.log('Post:', post);
  console.log('Comentario:', comment);
  console.log('Reacción Post:', postReaction);
  console.log('Reacción Comentario:', commentReaction);
  console.log('Conteos Post:', postCounts);
  console.log('Conteos Comentario:', commentCounts);
}

smoke()
  .then(() => {
    console.log('\nSmoke test completado OK');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\nSmoke test falló:', err?.message || err);
    process.exit(1);
  });