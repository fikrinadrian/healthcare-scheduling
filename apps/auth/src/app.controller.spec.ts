import { describe, expect, it } from 'vitest';
import { AuthController } from './app.controller.js';
import { AuthService } from './app.service.js';

describe('AuthController', () => {
  it('returns the Auth Service health message', () => {
    const controller = new AuthController(new AuthService());

    expect(controller.getHello()).toBe('Auth service live!');
  });
});
