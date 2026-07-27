import fs from "fs";
import path from "path";

import { faker } from "@faker-js/faker";
import _ from "lodash";
import { Borrower, MARITAL_STATUSES } from "../../shared/index.js";

const { pathname: dirname } = new URL(import.meta.url);
const scriptsDir = path.dirname(dirname);
const rootDir = path.dirname(scriptsDir);

const BORROWER_FILE_PATH = path.join(rootDir, "borrowers.json");
const BORROWER_COUNT = 100;

function makeBorrower(): Borrower {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    id: faker.string.uuid(),
    firstName,
    lastName,
    dateOfBirth: new Date(faker.date.past({ years: 60 })).toLocaleDateString(),
    creditScore: faker.number.int({ min: 500, max: 900 }),
    maritalStatus: MARITAL_STATUSES[faker.number.int({ min: 0, max: 2 })],
    w2Income: faker.number.int({ min: 50000, max: 120000 }),
    emailAddress: faker.internet.email({ firstName, lastName }),
    homePhone: faker.phone.number(),
    cellPhone: faker.phone.number(),
    currentAddress: faker.location.streetAddress(),
    employer: faker.company.name(),
    title: faker.person.jobTitle(),
    startDate: new Date(faker.date.past({ years: 5 })).toLocaleDateString(),
    subjectPropertyAddress: faker.location.streetAddress(),
  };
}

const borrowers: Borrower[] = [];
_.times(BORROWER_COUNT, () => {
  borrowers.push(makeBorrower());
});

console.log(`Writing to ${BORROWER_FILE_PATH}.`);

const borrowersStringified = JSON.stringify(borrowers, null, 2);
fs.writeFileSync(BORROWER_FILE_PATH, borrowersStringified);
