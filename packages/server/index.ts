import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import {
  Borrower,
  BorrowerFilter,
  BORROWER_FIELD_NAMES,
  DATE_FILTER_FIELDS,
  NUMBER_FILTER_FIELDS,
  STRING_FILTER_FIELDS,
} from "shared";

import BORROWERS from "./borrowers.json" with { type: "json" };

const PORT = 1337;

const app = express();

// Allow cross-origin requests.
app.use(cors());

// Parse POST request body JSON.
app.use(bodyParser.json());

function isStringFilterField(field: string): field is BorrowerFilter["field"] {
  return STRING_FILTER_FIELDS.some((filterField) => filterField === field);
}

function isNumberFilterField(field: string): field is BorrowerFilter["field"] {
  return NUMBER_FILTER_FIELDS.some((filterField) => filterField === field);
}

function isDateFilterField(field: string): field is BorrowerFilter["field"] {
  return DATE_FILTER_FIELDS.some((filterField) => filterField === field);
}

function parseDate(value: string) {
  const dateValue = value.trim();

  if (dateValue.includes("-")) {
    const [year, month, day] = dateValue.split("-").map(Number);
    return Date.UTC(year, month - 1, day);
  }

  const [month, day, year] = dateValue.split("/").map(Number);
  return Date.UTC(year, month - 1, day);
}

function parseFilters(value: unknown): BorrowerFilter[] {
  if (typeof value !== "string") return [];

  try {
    const filters = JSON.parse(value);
    if (!Array.isArray(filters)) return [];
    const parsedFilters: BorrowerFilter[] = [];

    for (const filter of filters) {
      if (!filter || typeof filter !== "object") continue;

      const field = "field" in filter ? filter.field : "";
      const operator = "operator" in filter ? filter.operator : "";
      const filterValue = "value" in filter ? filter.value : "";

      if (typeof field !== "string") continue;
      if (typeof operator !== "string") continue;
      if (typeof filterValue !== "string") continue;
      if (!filterValue.trim()) continue;

      if (isStringFilterField(field)) {
        if (operator !== "is" && operator !== "includes") continue;
        parsedFilters.push({ field, operator, value: filterValue });
        continue;
      }

      if (isNumberFilterField(field)) {
        if (
          operator !== "lessThan" &&
          operator !== "is" &&
          operator !== "greaterThan"
        ) {
          continue;
        }

        parsedFilters.push({ field, operator, value: filterValue });
      }

      if (isDateFilterField(field)) {
        if (
          operator !== "lessThan" &&
          operator !== "is" &&
          operator !== "greaterThan"
        ) {
          continue;
        }

        parsedFilters.push({ field, operator, value: filterValue });
      }
    }

    return parsedFilters;
  } catch {
    return [];
  }
}

function matchesFilter(borrower: Borrower, filter: BorrowerFilter) {
  if (isDateFilterField(filter.field)) {
    const borrowerValue = parseDate(String(borrower[filter.field]));
    const filterValue = parseDate(filter.value);

    if (Number.isNaN(borrowerValue) || Number.isNaN(filterValue)) return false;
    if (filter.operator === "lessThan") return borrowerValue < filterValue;
    if (filter.operator === "is") return borrowerValue === filterValue;
    if (filter.operator === "greaterThan") return borrowerValue > filterValue;

    return false;
  }

  if (isNumberFilterField(filter.field)) {
    const borrowerValue = Number(borrower[filter.field]);
    const filterValue = Number(filter.value);

    if (Number.isNaN(filterValue)) return false;
    if (filter.operator === "lessThan") return borrowerValue < filterValue;
    if (filter.operator === "is") return borrowerValue === filterValue;
    if (filter.operator === "greaterThan") return borrowerValue > filterValue;

    return false;
  }

  const borrowerValue = String(borrower[filter.field]).toLowerCase();
  const filterValue = filter.value.trim().toLowerCase();

  if (filter.operator === "is") return borrowerValue === filterValue;
  if (filter.operator === "includes") return borrowerValue.includes(filterValue);

  return false;
}

app.get("/borrowers", (req: Request, res: Response<Borrower[]>) => {
  const filters = parseFilters(req.query.filters);
  const borrowers = filters.length
    ? BORROWERS.filter((borrower) =>
        filters.every((filter) => matchesFilter(borrower, filter)),
      )
    : BORROWERS;

  res.send(borrowers);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);

  // Log the field names to ensure shared package is working.
  console.log(`Field names: ${BORROWER_FIELD_NAMES.join(", ")}`);
});
