// Code to be shared between the client and server can be added here :)

export const MARITAL_STATUSES = ["married", "separated", "unmarried"] as const;

export interface Borrower {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  creditScore: number;
  maritalStatus: string;
  w2Income: number;
  emailAddress: string;
  homePhone: string;
  cellPhone: string;
  currentAddress: string;
  employer: string;
  title: string;
  startDate: string;
  subjectPropertyAddress: string;
}

export const BORROWER_FIELD_NAMES = [
  "firstName",
  "lastName",
  "dateOfBirth",
  "creditScore",
  "maritalStatus",
  "w2Income",
  "emailAddress",
  "homePhone",
  "cellPhone",
  "currentAddress",
  "employer",
  "title",
  "startDate",
  "subjectPropertyAddress",
] as const;

export type FilterOperator = "is" | "includes" | "lessThan" | "greaterThan";

export const STRING_FILTER_FIELDS: (keyof Borrower)[] = [
  "firstName",
  "lastName",
  "maritalStatus",
  "emailAddress",
  "homePhone",
  "cellPhone",
  "currentAddress",
  "employer",
  "title",
  "subjectPropertyAddress",
] as const;

export const NUMBER_FILTER_FIELDS: (keyof Borrower)[] = [
  "creditScore",
  "w2Income",
] as const;

export const DATE_FILTER_FIELDS: (keyof Borrower)[] = [
  "dateOfBirth",
  "startDate",
] as const;

export const FILTER_FIELDS = [
  ...STRING_FILTER_FIELDS,
  ...NUMBER_FILTER_FIELDS,
  ...DATE_FILTER_FIELDS,
] as const;

export const STRING_FILTER_OPERATORS: FilterOperator[] = ["is", "includes"];

export const NUMBER_FILTER_OPERATORS: FilterOperator[] = [
  "lessThan",
  "is",
  "greaterThan",
];

export const DATE_FILTER_OPERATORS: FilterOperator[] = [
  "lessThan",
  "is",
  "greaterThan",
];

export interface BorrowerFilter {
  field: keyof Borrower;
  operator: FilterOperator;
  value: string;
}
