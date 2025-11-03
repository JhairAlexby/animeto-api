import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Animeto API (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Configurar validaciones como en main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPassword123',
    };

    it('/auth/register (POST) - should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .field('name', testUser.name)
        .field('email', testUser.email)
        .field('password', testUser.password)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.user.email).toBe(testUser.email);
          expect(res.body.data.accessToken).toBeDefined();
          jwtToken = res.body.data.accessToken;
          userId = res.body.data.user.id;
        });
    });

    it('/auth/register (POST) - should fail with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .field('name', testUser.name)
        .field('email', testUser.email)
        .field('password', testUser.password)
        .expect(409);
    });

    it('/auth/login (POST) - should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.user.email).toBe(testUser.email);
          expect(res.body.data.accessToken).toBeDefined();
        });
    });

    it('/auth/login (POST) - should fail with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('Users', () => {
    it('/users/profile (GET) - should get user profile', () => {
      return request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.email).toBe('test@example.com');
        });
    });

    it('/users/profile (PATCH) - should update user profile', () => {
      return request(app.getHttpServer())
        .patch('/users/profile')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'Updated Test User',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.name).toBe('Updated Test User');
        });
    });

    it('/users/profile (GET) - should fail without authentication', () => {
      return request(app.getHttpServer()).get('/users/profile').expect(401);
    });
  });

  describe('Posts', () => {
    let postId: string;

    it('/posts (POST) - should create a new post', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${jwtToken}`)
        .field('description', 'Test post description')
        .field('currentChapters', '10')
        .field('type', 'manga')
        .field('tags', JSON.stringify(['test', 'manga']))
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.description).toBe('Test post description');
          expect(res.body.data.type).toBe('manga');
          postId = res.body.data.id;
        });
    });

    it('/posts (GET) - should get posts list', () => {
      return request(app.getHttpServer())
        .get('/posts')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.data).toBeInstanceOf(Array);
          expect(res.body.data.total).toBeGreaterThan(0);
        });
    });

    it('/posts/:id (GET) - should get specific post', () => {
      return request(app.getHttpServer())
        .get(`/posts/${postId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.id).toBe(postId);
        });
    });

    it('/posts/:id (PATCH) - should update post', () => {
      return request(app.getHttpServer())
        .patch(`/posts/${postId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          description: 'Updated post description',
          currentChapters: 15,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.description).toBe('Updated post description');
          expect(res.body.data.currentChapters).toBe(15);
        });
    });

    it('/posts (POST) - should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .field('description', 'Test post')
        .field('type', 'manga')
        .expect(401);
    });
  });

  describe('Comments', () => {
    let postId: string;
    let commentId: string;

    beforeAll(async () => {
      // Crear un post para comentar
      const postResponse = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${jwtToken}`)
        .field('description', 'Post for comments test')
        .field('type', 'manga');

      postId = postResponse.body.data.id;
    });

    it('/comments (POST) - should create a comment', () => {
      return request(app.getHttpServer())
        .post('/comments')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          content: 'Test comment',
          postId: postId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.content).toBe('Test comment');
          commentId = res.body.data.id;
        });
    });

    it('/comments/post/:postId (GET) - should get comments for post', () => {
      return request(app.getHttpServer())
        .get(`/comments/post/${postId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.data).toBeInstanceOf(Array);
          expect(res.body.data.total).toBeGreaterThan(0);
        });
    });

    it('/comments (POST) - should create a reply to comment', () => {
      return request(app.getHttpServer())
        .post('/comments')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          content: 'Reply to comment',
          postId: postId,
          parentId: commentId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.content).toBe('Reply to comment');
          expect(res.body.data.parentId).toBe(commentId);
        });
    });
  });

  describe('Reactions', () => {
    let postId: string;

    beforeAll(async () => {
      // Crear un post para reaccionar
      const postResponse = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${jwtToken}`)
        .field('description', 'Post for reactions test')
        .field('type', 'manga');

      postId = postResponse.body.data.id;
    });

    it('/reactions (POST) - should create a like reaction', () => {
      return request(app.getHttpServer())
        .post('/reactions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          type: 'like',
          target: 'post',
          postId: postId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.type).toBe('like');
        });
    });

    it('/reactions/post/:postId (GET) - should get post reactions', () => {
      return request(app.getHttpServer())
        .get(`/reactions/post/${postId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.likes).toBeGreaterThan(0);
        });
    });

    it('/reactions/user/post/:postId (GET) - should get post reactions with user reaction', () => {
      return request(app.getHttpServer())
        .get(`/reactions/user/post/${postId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.userReaction).toBe('like');
        });
    });
  });

  describe('Publicaciones', () => {
    it('/api/publicaciones/completas (GET) - should get aggregated posts with reactions and comments', () => {
      return request(app.getHttpServer())
        .get('/api/publicaciones/completas?page=1&limit=10')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.publicaciones).toBeInstanceOf(Array);
          expect(res.body.data.pagination).toBeDefined();
          if (res.body.data.publicaciones.length > 0) {
            const pub = res.body.data.publicaciones[0];
            expect(pub).toHaveProperty('id');
            expect(pub).toHaveProperty('description');
            expect(pub).toHaveProperty('author');
            expect(pub).toHaveProperty('reactions');
            expect(pub).toHaveProperty('comments');
          }
        });
    });
  });
});
