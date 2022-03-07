import { CONTENT_TYPE_JSON, METHOD_GET, METHOD_POST } from '$lib/util/web';
import { BASE_PBC_URI } from './index';
import type { Zine } from './models/zine';

export class ZineService {
	public static readonly URI_GET_ZINES = `${BASE_PBC_URI}/getZines`;
	public static readonly URI_CREATE_ZINE = `${BASE_PBC_URI}/addZine`;

	private static cachedZines: Zine[] = [];

	public static async createZine(zine: Zine): Promise<Zine> {
		const response = await fetch(this.URI_CREATE_ZINE, {
			...METHOD_POST,
			headers: { ...CONTENT_TYPE_JSON },
			body: JSON.stringify(zine)
		});

		if (response.status !== 200) {
			throw new Error(
				`unexpected response ${response.status} when creating zine at ${
					this.URI_CREATE_ZINE
				} with details: ${JSON.stringify(zine)}`
			);
		}

		this.cachedZines = [];
		return (await response.json()) as Zine;
	}

	public static async getZines(): Promise<Zine[]> {
		if (this.cachedZines.length > 0) {
			return this.cachedZines;
		}

		const response = await fetch(this.URI_GET_ZINES, { ...METHOD_GET });
		if (response.status !== 200) {
			throw new Error(
				`unexpected response ${response.status} when retrieving all zines from ${this.URI_GET_ZINES}`
			);
		}

		const zines = await response.json();
		this.cachedZines = zines.sort((a: Zine, b: Zine) =>
			a.threeLetterCode.localeCompare(b.threeLetterCode)
		);

		return this.cachedZines;
	}
}
