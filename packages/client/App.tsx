import { useState, useEffect } from "react";
import axios from "axios";
import {
  Borrower,
  BorrowerFilter,
  BORROWER_FIELD_NAMES,
  DATE_FILTER_FIELDS,
  FILTER_FIELDS,
  FilterOperator,
  NUMBER_FILTER_FIELDS,
  STRING_FILTER_FIELDS,
} from "shared";

import "./style.css";

interface FilterRow extends BorrowerFilter {
  id: string;
}

interface OperatorOption {
  value: FilterOperator;
  label: string;
}

const STRING_OPERATOR_OPTIONS: OperatorOption[] = [
  { value: "is", label: "Is" },
  { value: "includes", label: "Includes" },
];

const NUMBER_OPERATOR_OPTIONS: OperatorOption[] = [
  { value: "lessThan", label: "Is less than" },
  { value: "is", label: "Is" },
  { value: "greaterThan", label: "Is greater than" },
];

const DATE_OPERATOR_OPTIONS: OperatorOption[] = [
  { value: "lessThan", label: "Is less than" },
  { value: "is", label: "Is" },
  { value: "greaterThan", label: "Is greater than" },
];

function isNumberField(field: BorrowerFilter["field"]) {
  return NUMBER_FILTER_FIELDS.some((filterField) => filterField === field);
}

function isDateField(field: BorrowerFilter["field"]) {
  return DATE_FILTER_FIELDS.some((filterField) => filterField === field);
}

function getOperatorOptions(field: BorrowerFilter["field"]) {
  if (isDateField(field)) return DATE_OPERATOR_OPTIONS;
  if (isNumberField(field)) return NUMBER_OPERATOR_OPTIONS;
  return STRING_OPERATOR_OPTIONS;
}

function getInputType(field: BorrowerFilter["field"]) {
  if (isDateField(field)) return "date";
  if (isNumberField(field)) return "number";
  return "text";
}

function makeFilterRow(): FilterRow {
  return {
    id: crypto.randomUUID(),
    field: STRING_FILTER_FIELDS[0],
    operator: "is",
    value: "",
  };
}

function toBorrowerFilter(filter: FilterRow): BorrowerFilter {
  return {
    field: filter.field,
    operator: filter.operator,
    value: filter.value,
  };
}

async function getBorrowers(filters: BorrowerFilter[]): Promise<Borrower[]> {
  const params = filters.length ? { filters: JSON.stringify(filters) } : {};
  const response = await axios.get<Borrower[]>(
    "http://localhost:1337/borrowers",
    { params },
  );
  return response.data;
}

function App() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [filters, setFilters] = useState<FilterRow[]>([makeFilterRow()]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function fetchBorrowers() {
      const activeFilters = filters
        .filter((filter) => filter.value.trim())
        .map(toBorrowerFilter);

      setIsLoading(true);
      setErrorMessage("");

      try {
        const newBorrowers = await getBorrowers(activeFilters);
        if (isCurrent) setBorrowers(newBorrowers);
      } catch {
        if (isCurrent) setErrorMessage("Could not load borrowers.");
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    fetchBorrowers();
    return () => {
      isCurrent = false;
    };
  }, [filters]);

  function addFilter() {
    setFilters((currentFilters) => [...currentFilters, makeFilterRow()]);
  }

  function removeFilter(id: string) {
    setFilters((currentFilters) =>
      currentFilters.length === 1
        ? [makeFilterRow()]
        : currentFilters.filter((filter) => filter.id !== id),
    );
  }

  function updateFilterField(id: string, field: BorrowerFilter["field"]) {
    setFilters((currentFilters) =>
      currentFilters.map((filter) => {
        if (filter.id !== id) return filter;
        return {
          ...filter,
          field,
          operator: getOperatorOptions(field)[0].value,
          value: "",
        };
      }),
    );
  }

  function updateFilterOperator(id: string, operator: FilterOperator) {
    setFilters((currentFilters) =>
      currentFilters.map((filter) =>
        filter.id === id ? { ...filter, operator } : filter,
      ),
    );
  }

  function updateFilterValue(id: string, value: string) {
    setFilters((currentFilters) =>
      currentFilters.map((filter) =>
        filter.id === id ? { ...filter, value } : filter,
      ),
    );
  }

  return (
    <main className="page">
      <section className="header">
        <div>
          <p className="eyebrow">Loancrate</p>
          <h1>Borrowers</h1>
        </div>
        <div className="result-count">
          {isLoading ? "Loading..." : `${borrowers.length} results`}
        </div>
      </section>

      <section className="filters">
        <div className="filters-heading">
          <div>
            <h2>Filters</h2>
            <p>All active filters are matched together.</p>
          </div>
          <button type="button" onClick={addFilter}>
            Add filter
          </button>
        </div>

        <div className="filter-list">
          {filters.map((filter) => (
            <div className="filter-row" key={filter.id}>
              <select
                value={filter.field}
                onChange={(event) =>
                  updateFilterField(
                    filter.id,
                    event.target.value as BorrowerFilter["field"],
                  )
                }
              >
                {FILTER_FIELDS.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>

              <select
                value={filter.operator}
                onChange={(event) =>
                  updateFilterOperator(
                    filter.id,
                    event.target.value as FilterOperator,
                  )
                }
              >
                {getOperatorOptions(filter.field).map((operator) => (
                  <option key={operator.value} value={operator.value}>
                    {operator.label}
                  </option>
                ))}
              </select>

              <input
                type={getInputType(filter.field)}
                value={filter.value}
                onChange={(event) =>
                  updateFilterValue(filter.id, event.target.value)
                }
                placeholder="Value"
              />

              <button type="button" onClick={() => removeFilter(filter.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      {errorMessage ? <p className="error">{errorMessage}</p> : null}

      <section className="table-card">
        <table>
          <thead>
            <tr>
              {BORROWER_FIELD_NAMES.map((columnKey) => (
                <th key={columnKey}>{columnKey}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {borrowers.map((borrower) => {
              return (
                <tr key={borrower.id}>
                  {BORROWER_FIELD_NAMES.map((columnKey) => (
                    <td key={columnKey}>{borrower[columnKey]}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </main>
  );
}

export default App;
