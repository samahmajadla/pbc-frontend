export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }
export type ForeignKey<
  Entity extends
    | Book
    | Facility
    | Note
    | PackageContent
    | Recipient
    | Shipment
    | SpecialRequest
    | Zine,
> = Required<Pick<Entity, 'id'>> & Partial<Entity>

export type Book = WithRequired<
  {
    type: 'Book'
  } & Omit<PackageContent, 'type'> & {
      authors?: string
      isbn10?: string
      isbn13?: string
    },
  'title'
>

export type Facility = {
  /** Format: int64 */
  id?: number
  name: string
  additionalInfo?: string
  street: string
  city: string
  /** @enum {string} */
  state: 'NC' | 'AL' | 'TN' | 'WV' | 'KY' | 'MD' | 'VA' | 'DE'
  zip: string
}

export type Note = {
  /** Format: int64 */
  id?: number
  content?: string
  /** Format: date */
  date?: string
}

export type PackageContent = {
  /** Format: int64 */
  id?: number
  title: string
  type: string
}

export type Recipient = {
  /** Format: int64 */
  id?: number
  firstName: string
  middleName?: string
  lastName: string
  assignedId?: string
  facility?: ForeignKey<Facility>
  shipments?: ForeignKey<Shipment>[]
  specialRequests?: ForeignKey<SpecialRequest>[]
}

export type Shipment = {
  /** Format: int64 */
  id?: number
  /** Format: date */
  date?: string
  facility?: ForeignKey<Facility>
  recipient?: ForeignKey<Recipient>
  notes?: ForeignKey<Note>[]
  content?: (ForeignKey<Book> | ForeignKey<Zine>)[]
}

export type SpecialRequest = {
  /** Format: int64 */
  id?: number
  volunteerName?: string
  request?: string
  /** Format: date */
  specialRequestDate?: string
  /** Format: date */
  letterMailedDate?: string
  /** @enum {string} */
  category?:
    | 'VOCATIONAL'
    | 'EDUCATIONAL'
    | 'CAREER_GROWTH'
    | 'FOREIGN_LANGUAGE'
    | 'LEGAL'
    | 'SPIRITUAL_RELIGIOUS'
    | 'OTHER'
  /** @enum {string} */
  status?: 'OPEN' | 'COMPLETED' | 'CANCELLED'
  recipient?: ForeignKey<Recipient>
}

export type Zine = WithRequired<
  {
    type: 'Zine'
  } & Omit<PackageContent, 'type'> & {
      code?: string
    },
  'code' | 'title'
>
