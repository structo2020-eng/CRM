export enum ProjectStatus {
  PLANNING = 'planning',
  CONSTRUCTION = 'construction',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  ARCHIVED = 'archived',
}

export enum BuildingStatus {
  PLANNING = 'planning',
  CONSTRUCTION = 'construction',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
}

export enum UnitType {
  APARTMENT = 'apartment',
  DUPLEX = 'duplex',
  PENTHOUSE = 'penthouse',
  VILLA = 'villa',
  TOWNHOUSE = 'townhouse',
  TWIN_HOUSE = 'twin_house',
  CHALET = 'chalet',
  OFFICE = 'office',
  SHOP = 'shop',
  CLINIC = 'clinic',
}

export enum UnitStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  SOLD = 'sold',
  BLOCKED = 'blocked',
}

export enum ReservationStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CONVERTED_TO_SALE = 'converted_to_sale',
  CANCELLED = 'cancelled',
}
