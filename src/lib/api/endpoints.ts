import type {
  Book,
  Facility,
  Note,
  PackageContent,
  Recipient,
  Shipment,
  SpecialRequest,
  Zine,
} from './models'

type Fetch = (input: URL | RequestInfo, init?: RequestInit) => Promise<Response>

export const BASE_URL = 'http://localhost:8080'

function resolveURL(
  url: URL,
  { query, path }: { query?: { [index: string]: any }; path?: { [index: string]: any } },
): string {
  let resolvedURL = url.toString()

  if (path) {
    for (const [key, value] of Object.entries(path)) {
      const variablePattern = new RegExp(`{s*${key}s*}`, 'g')
      resolvedURL = resolvedURL.replace(variablePattern, value)
    }
  }

  if (query) {
    const searchParams = new URLSearchParams(query)
    const queryString = searchParams.toString()

    if (queryString) {
      resolvedURL += resolvedURL.includes('?') ? `&${queryString}` : `?${queryString}`
    }
  }

  return resolvedURL
}

export async function updateShipment(fetch: Fetch, body: Shipment): Promise<Shipment | undefined> {
  const url = new URL('/updateShipment', BASE_URL).toString()
  const options: RequestInit = {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Shipment
  } catch (error) {
    console.error(
      `received error while fetching url("${url}") with data(${JSON.stringify(body)})`,
      error,
    )
    return undefined
  }
}

export async function updateRecipient(
  fetch: Fetch,
  body: Recipient,
): Promise<Recipient | undefined> {
  const url = new URL('/updateRecipient', BASE_URL).toString()
  const options: RequestInit = {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Recipient
  } catch (error) {
    console.error(
      `received error while fetching url("${url}") with data(${JSON.stringify(body)})`,
      error,
    )
    return undefined
  }
}

export async function updateFacility(fetch: Fetch, body: Facility): Promise<Facility | undefined> {
  const url = new URL('/updateFacility', BASE_URL).toString()
  const options: RequestInit = {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Facility
  } catch (error) {
    console.error(
      `received error while fetching url("${url}") with data(${JSON.stringify(body)})`,
      error,
    )
    return undefined
  }
}

export async function updateContent(
  fetch: Fetch,
  body: Book | Zine,
): Promise<Book | Zine | undefined> {
  const url = new URL('/updateContent', BASE_URL).toString()
  const options: RequestInit = {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Book | Zine
  } catch (error) {
    console.error(
      `received error while fetching url("${url}") with data(${JSON.stringify(body)})`,
      error,
    )
    return undefined
  }
}

export async function addSpecialRequest(
  fetch: Fetch,
  body: SpecialRequest,
): Promise<SpecialRequest | undefined> {
  const url = new URL('/addSpecialRequest', BASE_URL).toString()
  const options: RequestInit = {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as SpecialRequest
  } catch (error) {
    console.error(
      `received error while fetching url("${url}") with data(${JSON.stringify(body)})`,
      error,
    )
    return undefined
  }
}

export async function addShipment(fetch: Fetch, body: Shipment): Promise<Shipment | undefined> {
  const url = new URL('/addShipment', BASE_URL).toString()
  const options: RequestInit = {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Shipment
  } catch (error) {
    console.error(
      `received error while fetching url("${url}") with data(${JSON.stringify(body)})`,
      error,
    )
    return undefined
  }
}

export async function addRecipient(fetch: Fetch, body: Recipient): Promise<Recipient | undefined> {
  const url = new URL('/addRecipient', BASE_URL).toString()
  const options: RequestInit = {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Recipient
  } catch (error) {
    console.error(
      `received error while fetching url("${url}") with data(${JSON.stringify(body)})`,
      error,
    )
    return undefined
  }
}

export async function addNote(fetch: Fetch, body: Note): Promise<Note | undefined> {
  const url = new URL('/addNote', BASE_URL).toString()
  const options: RequestInit = {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Note
  } catch (error) {
    console.error(
      `received error while fetching url("${url}") with data(${JSON.stringify(body)})`,
      error,
    )
    return undefined
  }
}

export async function addFacility(fetch: Fetch, body: Facility): Promise<Facility | undefined> {
  const url = new URL('/addFacility', BASE_URL).toString()
  const options: RequestInit = {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Facility
  } catch (error) {
    console.error(
      `received error while fetching url("${url}") with data(${JSON.stringify(body)})`,
      error,
    )
    return undefined
  }
}

export async function addContent(
  fetch: Fetch,
  body: Book | Zine,
): Promise<Book | Zine | undefined> {
  const url = new URL('/addContent', BASE_URL).toString()
  const options: RequestInit = {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Book | Zine
  } catch (error) {
    console.error(
      `received error while fetching url("${url}") with data(${JSON.stringify(body)})`,
      error,
    )
    return undefined
  }
}

export async function searchBooksByTitleAndAuthor(
  fetch: Fetch,
  query: { title: string; author?: string },
): Promise<Book[] | undefined> {
  const url = resolveURL(new URL('/searchBooks', BASE_URL), { query })
  const options: RequestInit = {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Book[]
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function queryGoogleByTitleAndAuthor(
  fetch: Fetch,
  query: { title: string; author?: string },
): Promise<Book[] | undefined> {
  const url = resolveURL(new URL('/queryGoogle', BASE_URL), { query })
  const options: RequestInit = {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Book[]
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function getZineByCode(
  fetch: Fetch,
  query: { code: string },
): Promise<Zine | undefined> {
  const url = resolveURL(new URL('/getZineByCode', BASE_URL), { query })
  const options: RequestInit = {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Zine
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function getShipmentsByDate(
  fetch: Fetch,
  query: { date: string },
): Promise<Shipment[] | undefined> {
  const url = resolveURL(new URL('/getShipmentsByDate', BASE_URL), { query })
  const options: RequestInit = {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Shipment[]
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function getShipment(
  fetch: Fetch,
  query: { id: number },
): Promise<Shipment | undefined> {
  const url = resolveURL(new URL('/getShipment', BASE_URL), { query })
  const options: RequestInit = {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Shipment
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function getShipmentCountBetweenDates(
  fetch: Fetch,
  query: { date1: string; date2: string },
): Promise<number | undefined> {
  const url = resolveURL(new URL('/getShipmentCountBetweenDates', BASE_URL), { query })
  const options: RequestInit = {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as number
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function getRecipients(
  fetch: Fetch,
  query: { firstName: string; lastName: string },
): Promise<Recipient[] | undefined> {
  const url = resolveURL(new URL('/getRecipients', BASE_URL), { query })
  const options: RequestInit = {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Recipient[]
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function getRecipient(
  fetch: Fetch,
  query: { id: number },
): Promise<Recipient | undefined> {
  const url = resolveURL(new URL('/getRecipient', BASE_URL), { query })
  const options: RequestInit = {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Recipient
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function getRecipientLocation(
  fetch: Fetch,
  query: { id: string },
): Promise<string | undefined> {
  const url = resolveURL(new URL('/getRecipientLocation', BASE_URL), { query })
  const options: RequestInit = {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as string
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function getRecipientByAssignedId(
  fetch: Fetch,
  query: { assignedId: string },
): Promise<Recipient | undefined> {
  const url = resolveURL(new URL('/getRecipientByAssignedId', BASE_URL), { query })
  const options: RequestInit = {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Recipient
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function getBooksWithNoIsbn(fetch: Fetch): Promise<Book[] | undefined> {
  const url = new URL('/getNoIsbnBooks', BASE_URL).toString()
  const options: RequestInit = {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Book[]
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function getFacilityById(
  fetch: Fetch,
  query: { id: number },
): Promise<Facility | undefined> {
  const url = resolveURL(new URL('/getFacility', BASE_URL), { query })
  const options: RequestInit = {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Facility
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function getFacilityByNameAndState(
  fetch: Fetch,
  query: { name: string; state: 'NC' | 'AL' | 'TN' | 'WV' | 'KY' | 'MD' | 'VA' | 'DE' },
): Promise<Facility[] | undefined> {
  const url = resolveURL(new URL('/getFacilityByName', BASE_URL), { query })
  const options: RequestInit = {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Facility[]
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function getContent(
  fetch: Fetch,
  query: { id: number },
): Promise<Book | Zine | undefined> {
  const url = resolveURL(new URL('/getContent', BASE_URL), { query })
  const options: RequestInit = {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Book | Zine
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function getContentByTitle(
  fetch: Fetch,
  query: { title: string },
): Promise<Book[] | Zine[] | undefined> {
  const url = resolveURL(new URL('/getContentByTitle', BASE_URL), { query })
  const options: RequestInit = {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Book[] | Zine[]
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function getBookByISBN(
  fetch: Fetch,
  query: { isbn: string },
): Promise<Book | undefined> {
  const url = resolveURL(new URL('/getBookByISBN', BASE_URL), { query })
  const options: RequestInit = {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Book
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function getAllZines(fetch: Fetch): Promise<Zine[] | undefined> {
  const url = new URL('/getAllZines', BASE_URL).toString()
  const options: RequestInit = {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Zine[]
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function getAllSpecialRequests(fetch: Fetch): Promise<SpecialRequest[] | undefined> {
  const url = new URL('/getAllSpecialRequests', BASE_URL).toString()
  const options: RequestInit = {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as SpecialRequest[]
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function getAllShipmentsByRecipient(
  fetch: Fetch,
  query: { id: number },
): Promise<Shipment[] | undefined> {
  const url = resolveURL(new URL('/getAllShipmentsByRecipient', BASE_URL), { query })
  const options: RequestInit = {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Shipment[]
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function getAllRecipients(fetch: Fetch): Promise<Recipient[] | undefined> {
  const url = new URL('/getAllRecipients', BASE_URL).toString()
  const options: RequestInit = {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Recipient[]
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function getAllFacilities(fetch: Fetch): Promise<Facility[] | undefined> {
  const url = new URL('/getAllFacilities', BASE_URL).toString()
  const options: RequestInit = {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Facility[]
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function getAllContent(fetch: Fetch): Promise<Book[] | Zine[] | undefined> {
  const url = new URL('/getAllContent', BASE_URL).toString()
  const options: RequestInit = {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Book[] | Zine[]
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function getContentByTitleAndAuthor(
  fetch: Fetch,
  query: { title: string; author?: string },
): Promise<Book[] | Zine[] | undefined> {
  const url = resolveURL(new URL('/content', BASE_URL), { query })
  const options: RequestInit = {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return (await response.json()) as Book[] | Zine[]
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function deleteShipment(fetch: Fetch, query: { id: number }): Promise<void> {
  const url = resolveURL(new URL('/deleteShipment', BASE_URL), { query })
  const options: RequestInit = {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function deleteRecipient(fetch: Fetch, query: { id: number }): Promise<void> {
  const url = resolveURL(new URL('/deleteRecipient', BASE_URL), { query })
  const options: RequestInit = {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function deleteFacility(fetch: Fetch, query: { id: number }): Promise<void> {
  const url = resolveURL(new URL('/deleteFacility', BASE_URL), { query })
  const options: RequestInit = {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function deleteContent(fetch: Fetch, query: { id: number }): Promise<void> {
  const url = resolveURL(new URL('/deleteContent', BASE_URL), { query })
  const options: RequestInit = {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}

export async function deleteShipmentsByRecipient(
  fetch: Fetch,
  query: { id: number },
): Promise<void> {
  const url = resolveURL(new URL('/deleteAllShipmentsByRecipientId', BASE_URL), { query })
  const options: RequestInit = {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) throw new Error(`Request failed with status: ${response.status}`)
    return
  } catch (error) {
    console.error(`received error while fetching url: ${url}`, error)
    return undefined
  }
}
