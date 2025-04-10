import {
	getAll,
	getMin,
	getSingle,
	addSingle,
	updateSingle,
	deleteSingle
} from '../../src/lib/djController';
// import * as utils from '../../src/lib/utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

var openapiGetMock = vi.fn();
var openapiPostBodyMock = vi.fn();
var openapiDeleteMock = vi.fn();

// Mock the utility functions
vi.mock('../../src/lib/utils', () => ({
	openapiGet: openapiGetMock,
	openapiPostBody: openapiPostBodyMock,
	openapiDelete: vi.fn()
}));

describe('DJ Controller', () => {
	afterEach(() => {
		// Clear all mocks after each test
		vi.clearAllMocks();
	});

	describe('getAll', () => {
		it('should fetch all DJs when no custom fetch function is provided', async () => {
			openapiGetMock.mockResolvedValueOnce([{ name: 'DJ1' }, { name: 'DJ2' }]);
			const djs = await getAll();
			expect(djs).toEqual([{ name: 'DJ1' }, { name: 'DJ2' }]);
			expect(openapiGetMock).toHaveBeenCalledWith('dj/');
		});

		it('should use the provided fetch function when custom one is given', async () => {
			const mockFetch = vi.fn().mockResolvedValueOnce([{ name: 'DJ3' }]);
			await getAll(mockFetch);
			expect(openapiGetMock).toHaveBeenCalledWith('dj/', undefined, mockFetch);
		});
	});

	describe('getMin', () => {
		it('should fetch minimal DJs when no custom fetch function is provided', async () => {
			openapiGetMock.mockResolvedValueOnce([{ name: 'DJ4' }, { name: 'DJ5' }]);
			const minDjs = await getMin();
			expect(minDjs).toEqual([{ name: 'DJ4' }, { name: 'DJ5' }]);
			expect(openapiGetMock).toHaveBeenCalledWith('dj/min');
		});
	});

	describe('getSingle', () => {
		it('should fetch a single DJ by name when no custom fetch function is provided', async () => {
			openapiGetMock.mockResolvedValueOnce({ name: 'DJ6' });
			const dj = await getSingle('DJ6');
			expect(dj).toEqual({ name: 'DJ6' });
			expect(openapiGetMock).toHaveBeenCalledWith('dj/DJ6');
		});
	});

	describe('addSingle', () => {
		it('should add a new DJ and return the result', async () => {
			openapiPostBodyMock.mockResolvedValueOnce({ name: 'NewDJ' });
			const dj = await addSingle('NewDJ');
			expect(dj).toEqual({ name: 'NewDJ' });
			expect(openapiPostBodyMock).toHaveBeenCalledWith('dj', { name: 'NewDJ' });
		});
	});

	describe('updateSingle', () => {
		it('should update a DJ and return the result', async () => {
			openapiPostBodyMock.mockResolvedValueOnce({ name: 'UpdatedDJ' });
			const dj = await updateSingle(
				'ExistingDJ',
				null,
				null,
				'newServer',
				'newKey',
				'publicName',
				'discordId'
			);
			expect(dj).toEqual({ name: 'UpdatedDJ' });
			expect(openapiPostBodyMock).toHaveBeenCalledWith('dj/ExistingDJ', {
				logo: null,
				recording: null,
				rtmp_server: 'newServer',
				rtmp_key: 'newKey',
				public_name: 'publicName',
				discord_id: 'discordId'
			});
		});
	});

	describe('deleteSingle', () => {
		it('should delete a DJ and return nothing', async () => {
			openapiDeleteMock.mockResolvedValueOnce(null);
			await expect(deleteSingle('DJToDelete')).resolves.toBeUndefined();
			expect(openapiDeleteMock).toHaveBeenCalledWith('dj/DJToDelete');
		});
	});
});
