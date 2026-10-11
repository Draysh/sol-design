import { describe as group, expect, it } from 'vitest';
import { errorMessage } from './api.js';
import { describe, matches, type SolEvent } from './events.svelte.js';

group('matches', () => {
	it('takes a type, a prefix ending in *, or everything', () => {
		expect(matches('terra.habit.checked', 'terra.habit.checked')).toBe(true);
		expect(matches('terra.habit.checked', 'terra.habit.checked.twice')).toBe(false);
		expect(matches('terra.habit.*', 'terra.habit.checked')).toBe(true);
		expect(matches('terra.habit.*', 'terra.diary.written')).toBe(false);
		expect(matches('sol.*', 'sol.world.installed')).toBe(true);
		expect(matches('*', 'mercury.review.finished')).toBe(true);
	});
});

group('describe', () => {
	it('is the sentence for people, or the bare type', () => {
		const event = { type: 'terra.habit.checked', summary: 'Did “Walk”' } as SolEvent;
		expect(describe(event)).toBe('Did “Walk”');
		expect(describe({ ...event, summary: null })).toBe('terra.habit.checked');
	});
});

group('errorMessage', () => {
	it('is the message of an error body, or the fallback', () => {
		expect(errorMessage({ error: 'conflict', message: 'install the world first' })).toBe('install the world first');
		expect(errorMessage(undefined)).toBe('Something went wrong');
		expect(errorMessage({ message: 3 }, 'Not saved')).toBe('Not saved');
	});
});
