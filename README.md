# Assessment Notes

## Running The Project

Use Node.js 22 or newer. If you use `nvm`, run:

```sh
nvm install
```

Install dependencies from the project root:

```sh
npm install
```

Start the client and server together:

```sh
npm start
```

The app runs at `http://localhost:1234`. The API server runs at `http://localhost:1337`.

## Approach

The main requirement was to filter borrower data on the server. The client does not filter the table by itself. Instead, it builds filter rows from the UI, sends those filters to the API, and renders the borrowers returned by the server.

The shared package contains the filter fields and operators used by both the client and server. This keeps the dropdown options and server validation in sync.

Multiple filters are handled with AND logic. A borrower must match every active filter to stay in the result list.

## Request Flow

1. The user selects a field, operator, and value in the filter UI.
2. `App.tsx` stores that filter in React state.
3. When filters change, the client removes empty filters and sends the active filters to `GET /borrowers`.
4. Filters are sent as a JSON string in the `filters` query parameter.
5. The server parses and validates the filters.
6. The server filters `borrowers.json`.
7. The client receives the filtered borrowers and updates the table.

## Implemented Features

Supported string fields:

- `firstName`
- `lastName`
- `maritalStatus`
- `emailAddress`
- `homePhone`
- `cellPhone`
- `currentAddress`
- `employer`
- `title`
- `subjectPropertyAddress`

String operators:

- `Is`
- `Includes`

Supported number fields:

- `creditScore`
- `w2Income`

Number operators:

- `Is less than`
- `Is`
- `Is greater than`

Supported date fields:

- `dateOfBirth`
- `startDate`

Date operators:

- `Is less than`
- `Is`
- `Is greater than`

## File By File

### `packages/shared/index.ts`

This file defines the borrower shape and shared filter settings.

- `Borrower` describes one borrower row.
- `BORROWER_FIELD_NAMES` controls the columns shown in the table.
- `FilterOperator` lists the operators supported by the app.
- `STRING_FILTER_FIELDS` lists fields that can use `Is` and `Includes`.
- `NUMBER_FILTER_FIELDS` lists fields that can use number comparisons.
- `DATE_FILTER_FIELDS` lists fields that can use date comparisons.
- `FILTER_FIELDS` combines all currently filterable fields for the client dropdown.
- `BorrowerFilter` is the filter shape sent from the client to the server.

### `packages/client/App.tsx`

This file renders the borrower table and filter UI.

- `FilterRow` extends `BorrowerFilter` with an `id` so React can render multiple filter rows safely.
- `STRING_OPERATOR_OPTIONS` stores labels for string filters.
- `NUMBER_OPERATOR_OPTIONS` stores labels for number filters.
- `DATE_OPERATOR_OPTIONS` stores labels for date filters.
- `isNumberField()` checks whether the selected field is a number field.
- `isDateField()` checks whether the selected field is a date field.
- `getOperatorOptions()` returns the correct operator list for the selected field.
- `getInputType()` returns the correct input type for string, number, and date fields.
- `makeFilterRow()` creates a new empty filter row.
- `toBorrowerFilter()` removes the UI-only `id` before sending filters to the API.
- `getBorrowers()` calls the server and passes active filters as query params.
- The `useEffect()` refetches borrowers every time filters change.
- `addFilter()` adds a new filter row.
- `removeFilter()` removes a filter row. If only one row is left, it resets it instead.
- `updateFilterField()` changes the field and resets the operator/value to match the new field type.
- `updateFilterOperator()` changes the selected operator.
- `updateFilterValue()` updates the input value.

### `packages/server/index.ts`

This file owns the filtering logic.

- `isStringFilterField()` checks whether a field supports string operators.
- `isNumberFilterField()` checks whether a field supports number operators.
- `isDateFilterField()` checks whether a field supports date operators.
- `parseDate()` converts saved borrower dates and browser date input values into comparable timestamps.
- `parseFilters()` reads the `filters` query parameter, parses JSON, removes invalid filters, and returns clean `BorrowerFilter` objects.
- `matchesFilter()` checks whether one borrower matches one filter.
- `GET /borrowers` applies all filters with `every()`, which gives the required AND behavior.

For string filters, values are compared in lowercase. `Is` checks exact equality and `Includes` checks substring matching.

For number filters, the filter value is converted with `Number()`. `Is less than`, `Is`, and `Is greater than` compare the numeric borrower value against the numeric filter value.

For date filters, borrower dates are saved as `M/D/YYYY`, while the browser date input sends `YYYY-MM-DD`. `parseDate()` handles both formats before comparing them.

### `packages/client/style.css`

This file improves the UI layout.

- Adds page spacing and card styling.
- Styles the filter row controls.
- Adds a custom chevron style for native selects.
- Adds focus states for inputs and selects.
- Makes the table easier to scan.

## Future Improvements

- Add an `Apply filters` button if the dataset or API becomes larger, so the app does not refetch on every small input change.
- Add a clear all filters button to reset the table quickly.
- Add loading skeletons or a better empty state when no borrowers match the selected filters.
- Move filter validation into shared helper functions if more filter types are added later.
- Add automated tests for string, number, and date filtering on the server.
- Store dates in ISO format in `borrowers.json` to make date filtering more predictable.
- Add pagination or server-side sorting if the borrower list grows beyond a small sample dataset.
