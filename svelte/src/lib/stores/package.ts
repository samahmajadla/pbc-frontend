import { writable } from 'svelte/store';
import { isInmateNoID } from '$services/pbc/inmate.service';
import { isNoISBNBook } from '$services/pbc/book.service';
import { PackageService } from '$services/pbc/package.service';
import { focusedInmate } from '$stores/inmate';
import type { FocusedInmateStore } from '$stores/inmate';
import type { Book, NoISBNBook } from '$models/pbc/book';
import type { Facility } from '$models/pbc/facility';
import type { Inmate, InmateNoID } from '$models/pbc/inmate';
import type { Package } from '$models/pbc/package';
import type { Zine } from '$models/pbc/zine';
import { formatDate } from '$util/time';

interface LocalStoragePackage extends Package {
	existsInDatabase: boolean;
}

const emptyPackage: LocalStoragePackage = {
	id: null,
	date: formatDate(new Date()),

	inmate: null,
	inmateNoId: null,
	facility: null,

	books: [],
	zines: [],
	noISBNBooks: [],

	alert: null,

	existsInDatabase: false
};

const emptyPackages: Package[] = []

const createPackage = () => {
	const { subscribe, set, update } = writable(emptyPackage);

	const addBook = (book: Book | NoISBNBook) => {
		if (isNoISBNBook(book)) {
			update((currentPackage) => ({
				...currentPackage,
				noISBNBooks: [...currentPackage.noISBNBooks, book]
			}));
		} else {
			update((currentPackage) => ({
				...currentPackage,
				books: [...currentPackage.books, book]
			}));
		}
	};
	const addZine = (zine: Zine) =>
		update((currentPackage) => ({
			...currentPackage,
			zines: [...currentPackage.zines, zine]
		}));

	const setInmate = (inmate: Inmate | InmateNoID) => {
		if (isInmateNoID(inmate)) {
			update((currentPackage) => ({
				...currentPackage,
				inmate: null,
				inmateNoId: inmate as InmateNoID
			}));
		} else {
			update((currentPackage) => ({
				...currentPackage,
				inmateNoId: null,
				inmate: inmate as Inmate
			}));
		}
	};
	const setDestination = (facility: Facility) =>
		update((currentPackage) => ({
			...currentPackage,
			facility
		}));

	const createAlert = (alertText = '') => {
		update((currentPackage) => ({
			...currentPackage,
			alert: {
				id: null,
				information: alertText
			}
		}));
	};

	const removeItemsById = (...ids: (string | number)[]) => {
		update((currentPackage) => {
			let { books, noISBNBooks, zines } = currentPackage;

			ids.forEach((id) => {
				books = books.filter((b) => b.id != id);
				noISBNBooks = noISBNBooks.filter((b) => b.id != id);
				zines = zines.filter((z) => z.id != id);
			});

			return {
				...currentPackage,
				books,
				noISBNBooks,
				zines
			};
		});
	};

	const fetch = async (packageId: number) => {
		try {
			const pbcPackage = await PackageService.getPackage(packageId);
			load(pbcPackage);
			return pbcPackage;
		} catch (error) {
			console.error(error);
			console.error(`failed to retrieve package with ID "${packageId}" via remote`);
		}
	};
	const load = (pbcPackage: Package) => set({ ...pbcPackage, existsInDatabase: true });
	const reset = () => set({ ...emptyPackage });
	const sync = async (pbcPackage: Package) => {
		const createdPackage = pbcPackage.id
			? await PackageService.updatePackage(pbcPackage)
			: await PackageService.createPackage(pbcPackage);
		load(createdPackage);
	};

	return {
		subscribe,
		set,

		addBook,
		addZine,

		setInmate,
		setDestination,

		createAlert,

		removeItemsById,

		fetch,
		sync,
		load,
		reset
	};
};


const createFocusedPackages = (focusedInmate: FocusedInmateStore) => {
	const { subscribe, set } = writable(emptyPackages);

	focusedInmate.subscribe(async $inmate => {
		const packages = await (isInmateNoID($inmate)
			? PackageService.getPackagesForInmateNoID($inmate.id)
			: PackageService.getPackagesForInmate($inmate.id));
		set(packages);
	});

	const fetchForInmate = (inmateID: string) => {
		focusedInmate.fetch(inmateID)
	}

	const fetchForDate = async (date: string) => {
		try {
			const packages = await PackageService.getPackagesForDate(date)
			set(packages);
			return packages;
		} catch(error) {
			console.error(error);
			console.error(`failed to retrieve packages for Date "${date}" via remote`);
		}
	}

	const fetchForDateRange = async (startDate: string, endDate: string) => {
		try {
			const packages = await PackageService.getPackagesForDateRange(startDate, endDate)
			set(packages);
			return packages;
		} catch(error) {
			console.error(error);
			console.error(`failed to retrieve packages for date range "${startDate}, ${endDate}" via remote`);
		}
	}
	
	return {
		subscribe,
		set,

		fetchForInmate,
		fetchForDate,
		fetchForDateRange,
	};
}

export const focusedPackage = createPackage();
export const focusedPackages = createFocusedPackages(focusedInmate);
