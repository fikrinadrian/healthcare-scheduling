import { describe, expect, it } from 'vitest';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  it('returns the Schedule Service health message', () => {
    const controller = new AppController(new AppService());

    expect(controller.getHello()).toBe('Schedule service run!');
  });
});
