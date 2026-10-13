import { describe as group, expect, it } from 'vitest';
import { lineFor, notices, said } from './notices.svelte.js';

group('said', () => {
	it('says a known failure in its line, the raw words behind Details', () => {
		expect(said('TypeError: Failed to fetch')).toEqual({
			jp: 'ソルに届かない…',
			body: 'Can’t reach Sol. Is it running, and is this computer online?',
			detail: 'TypeError: Failed to fetch'
		});
		expect(lineFor('502 Bad Gateway')?.jp).toBe('向こうの調子が悪いみたい。');
		expect(lineFor('request timed out')?.line).toBe('No answer in time. Try again in a moment.');
	});

	it('keeps a short plain reason as it is', () => {
		expect(said('That name is taken')).toEqual({ body: 'That name is taken' });
	});

	it('folds a machine’s words away behind a plain line', () => {
		const raw = 'SyntaxError: Unexpected token < in JSON at position 0';
		expect(said(raw)).toEqual({ jp: 'うまくいかなかった…', body: 'Something went wrong on the way.', detail: raw });
	});
});

group('notices.show', () => {
	it('says a failure as a person would, and leaves anything else alone', () => {
		const failed = notices.show({ world: 'sol', title: 'Not installed', body: 'Failed to fetch', tone: 'error' });
		const fine = notices.show({ world: 'sol', title: 'Saved', body: 'Failed to fetch' });
		const a = notices.list.find((n) => n.id === failed);
		const b = notices.list.find((n) => n.id === fine);
		expect(a?.jp).toBe('ソルに届かない…');
		expect(a?.detail).toBe('Failed to fetch');
		expect(b?.jp).toBeUndefined();
		expect(b?.body).toBe('Failed to fetch');
		notices.dismiss(failed);
		notices.dismiss(fine);
	});
});
