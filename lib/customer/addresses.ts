/*
  Saved addresses. Pure rules and Shopify's GraphQL, so they can be checked without a network.
  The shop delivers in India, so the country is fixed and the form asks for a state, PIN code
  and a 10-digit mobile number (couriers need it).
*/

/** Indian states and union territories, with the codes Shopify uses. */
export const STATES: { code: string; name: string }[] = [
  ["AN", "Andaman and Nicobar Islands"], ["AP", "Andhra Pradesh"], ["AR", "Arunachal Pradesh"], ["AS", "Assam"],
  ["BR", "Bihar"], ["CH", "Chandigarh"], ["CG", "Chhattisgarh"], ["DH", "Dadra and Nagar Haveli and Daman and Diu"],
  ["DL", "Delhi"], ["GA", "Goa"], ["GJ", "Gujarat"], ["HR", "Haryana"], ["HP", "Himachal Pradesh"],
  ["JK", "Jammu and Kashmir"], ["JH", "Jharkhand"], ["KA", "Karnataka"], ["KL", "Kerala"], ["LA", "Ladakh"],
  ["LD", "Lakshadweep"], ["MP", "Madhya Pradesh"], ["MH", "Maharashtra"], ["MN", "Manipur"], ["ML", "Meghalaya"],
  ["MZ", "Mizoram"], ["NL", "Nagaland"], ["OR", "Odisha"], ["PY", "Puducherry"], ["PB", "Punjab"], ["RJ", "Rajasthan"],
  ["SK", "Sikkim"], ["TN", "Tamil Nadu"], ["TS", "Telangana"], ["TR", "Tripura"], ["UP", "Uttar Pradesh"],
  ["UK", "Uttarakhand"], ["WB", "West Bengal"],
].map(([code, name]) => ({ code, name }));

export type AddressFields = {
  firstName: string;
  lastName: string;
  /** 10 digits as typed. */
  phone: string;
  address1: string;
  address2: string;
  city: string;
  /** A code from STATES. */
  state: string;
  zip: string;
};
export type AddressErrors = Partial<Record<keyof AddressFields, string>>;

/** Turns what people type (9876543210, +91 98765 43210, 098765 43210) into +919876543210, or null. */
export function normalisePhone(raw: string): string | null {
  let d = raw.replace(/[\s\-().]/g, "");
  if (d.startsWith("+91")) d = d.slice(3);
  else if (d.startsWith("91") && d.length === 12) d = d.slice(2);
  else if (d.startsWith("0") && d.length === 11) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? `+91${d}` : null;
}

export function validateAddress(raw: Partial<Record<keyof AddressFields, unknown>>):
  | { ok: true; value: AddressFields; phoneE164: string }
  | { ok: false; errors: AddressErrors } {
  const s = (k: keyof AddressFields) => String(raw[k] ?? "").trim().replace(/\s+/g, " ");
  const v: AddressFields = {
    firstName: s("firstName"), lastName: s("lastName"), phone: s("phone"),
    address1: s("address1"), address2: s("address2"), city: s("city"), state: s("state"), zip: s("zip"),
  };
  const errors: AddressErrors = {};
  if (!v.firstName) errors.firstName = "Enter your first name.";
  if (!v.lastName) errors.lastName = "Enter your last name.";
  const phone = normalisePhone(v.phone);
  if (!phone) errors.phone = "Enter a 10-digit mobile number.";
  if (v.address1.length < 5) errors.address1 = "Enter the house number and street.";
  if (v.address1.length > 100) errors.address1 = "Please keep this under 100 characters.";
  if (v.address2.length > 100) errors.address2 = "Please keep this under 100 characters.";
  if (v.city.length < 2) errors.city = "Enter your city.";
  if (!STATES.some((x) => x.code === v.state)) errors.state = "Choose your state.";
  if (!/^[1-9]\d{5}$/.test(v.zip)) errors.zip = "Enter a 6-digit PIN code.";
  return Object.keys(errors).length || !phone ? { ok: false, errors } : { ok: true, value: v, phoneE164: phone };
}

/** What Shopify's Customer Account API wants for a new or changed address. */
export const toInput = (v: AddressFields, phoneE164: string) => ({
  firstName: v.firstName,
  lastName: v.lastName,
  address1: v.address1,
  address2: v.address2 || null,
  city: v.city,
  zoneCode: v.state,
  zip: v.zip,
  countryCode: "IN",
  phoneNumber: phoneE164,
});

export type SavedAddress = {
  id: string;
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  zoneCode?: string;
  zip?: string;
  /** E.164, for example +919876543210. */
  phoneNumber?: string;
  formatted: string[];
  isDefault: boolean;
};

type RawAddress = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  zoneCode?: string | null;
  zip?: string | null;
  phoneNumber?: string | null;
  formatted: string[];
};

export const ADDRESS_FIELDS = `id firstName lastName address1 address2 city zoneCode zip phoneNumber formatted(withName: true)`;

export const ADDRESSES_QUERY = /* GraphQL */ `
  query SavedAddresses {
    customer {
      defaultAddress { id }
      addresses(first: 20) { nodes { ${ADDRESS_FIELDS} } }
    }
  }
`;

export const ADDRESS_CREATE = /* GraphQL */ `
  mutation AddressCreate($address: CustomerAddressInput!, $defaultAddress: Boolean) {
    customerAddressCreate(address: $address, defaultAddress: $defaultAddress) {
      customerAddress { id }
      userErrors { field message }
    }
  }
`;
export const ADDRESS_UPDATE = /* GraphQL */ `
  mutation AddressUpdate($addressId: ID!, $address: CustomerAddressInput, $defaultAddress: Boolean) {
    customerAddressUpdate(addressId: $addressId, address: $address, defaultAddress: $defaultAddress) {
      customerAddress { id }
      userErrors { field message }
    }
  }
`;
export const ADDRESS_DELETE = /* GraphQL */ `
  mutation AddressDelete($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      userErrors { field message }
    }
  }
`;

/** The default address first, then the rest in the order Shopify sends them. */
export function mapAddresses(raw: { defaultAddress?: { id: string } | null; addresses: { nodes: RawAddress[] } }): SavedAddress[] {
  const list = raw.addresses.nodes.map((a) => ({
    id: a.id,
    firstName: a.firstName ?? undefined,
    lastName: a.lastName ?? undefined,
    address1: a.address1 ?? undefined,
    address2: a.address2 ?? undefined,
    city: a.city ?? undefined,
    zoneCode: a.zoneCode ?? undefined,
    zip: a.zip ?? undefined,
    phoneNumber: a.phoneNumber ?? undefined,
    formatted: a.formatted,
    isDefault: a.id === raw.defaultAddress?.id,
  }));
  return [...list.filter((a) => a.isDefault), ...list.filter((a) => !a.isDefault)];
}

export const isAddressId = (v: unknown): v is string => typeof v === "string" && /^gid:\/\/shopify\/CustomerAddress\/\d+(\?.*)?$/.test(v);
