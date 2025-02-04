import { beforeAll, beforeEach, describe, expect, it, test } from "vitest";
import Employee from "../src/dto/Employee.mjs";
import WageEmployee from "../src/dto/WageEmployee.mjs";
import SalesPerson from "../src/dto/SalesPerson.mjs";
import Manager from "../src/dto/Manager.mjs";
import Company from "../src/service/Company.mjs";
import { EMPLOYEE_ALREADY_EXISTS, EMPLOYEE_NOT_FOUND, INVALID_EMPLOYEE_TYPE } from "../src/exceptions/exceptions.mjs";
const ID1 = 123;
const SALARY1 = 1000;
const DEPARTMENT1 = "QA";
const ID2 = 120;
const SALARY2 = 2000;
const ID3 = 125;
const SALARY3 = 3000;
const DEPARTMENT2 = "Development";
const ID4 = 200;
const DEPARTMENT4 = "Audit";
const WAGE1 = 100;
const HOURS1 = 10;
const FACTOR1 = 2;
const PERCENT1 = 0.01;
const SALES1 = 10000;
const FACTOR2 = 2.5;
const ID5 = 300;
const FACTOR3 = 3;
const ID6 = 400;
const ID7 = 500;
const empl1 = new WageEmployee(ID1, DEPARTMENT1, SALARY1,  WAGE1, HOURS1);
const empl2 = new Manager(ID2, DEPARTMENT1, SALARY2,  FACTOR1);
const empl3 = new SalesPerson(ID3, DEPARTMENT2, SALARY3,  WAGE1, HOURS1, PERCENT1, SALES1);
let company = new Company();
const employees = [empl1, empl2, empl3];
(async () => await fillCompany())();
async function fillCompany() {
    company = new Company();
    for await (const empl of employees ){
        company.addEmployee(empl);
    }
}
describe("tests of company updating", () => {
    beforeEach(async () => await fillCompany());
    it(" adding new Employee", async () => {
        const empl = new Employee(ID4, SALARY1, DEPARTMENT1);
		await company.addEmployee(empl);
       await expect( company.addEmployee(empl)).rejects.toThrowError(EMPLOYEE_ALREADY_EXISTS(ID4));
       await expect( company.addEmployee(2)).rejects.toThrow(INVALID_EMPLOYEE_TYPE(2))
    });
    it("removing existing Employee", async () => {
        await expect( company.removeEmployee(ID4)).rejects.toThrowError(EMPLOYEE_NOT_FOUND(ID4));
       await company.removeEmployee(ID1);
       await company.addEmployee(empl1);

    })

})
describe("tests of company non-updating", async () => {
    beforeEach(async() => await fillCompany());
    it("getting Employee object test", async () => {
        const empl = await company.getEmployee(ID1);
        expect(empl.getId()).toBe(ID1);
        expect(empl instanceof WageEmployee).toBeTruthy();
         expect(await company.getEmployee(ID4)).toBeNull();
    });
    it("getting Managers with maximal factor", async () => {
        await company.addEmployee(new Manager(ID4, DEPARTMENT1, SALARY1,  FACTOR2));
		const managersExpected = [new Manager(ID5, DEPARTMENT1, SALARY1,  FACTOR3),
		new Manager(ID6, SALARY1, DEPARTMENT1, FACTOR3),
		new Manager(ID7, SALARY1, DEPARTMENT2, FACTOR3)
        ];
		for await (const mng of managersExpected) {
			company.addEmployee(mng);
		}
        expect(await company.getManagersWithMostFactor()).toEqual(managersExpected);
		await company.removeEmployee(ID4);
		await company.removeEmployee(ID5);
		await company.removeEmployee(ID6);
		await company.removeEmployee(ID7);
        expect(await company.getManagersWithMostFactor()).toEqual([empl2]);
		await company.removeEmployee(ID2);
        expect(await company.getManagersWithMostFactor()).toEqual([]);
    });
    it("get all departments", async() => {
        expect(await company.getDepartments()).toEqual([DEPARTMENT2, DEPARTMENT1])
    });
    it("get department budget", async () => {
        expect(await company.getDepartmentBudget(DEPARTMENT1)).toBe(SALARY1 + WAGE1 * HOURS1 + SALARY2 * FACTOR1);
		
        expect(await company.getDepartmentBudget(DEPARTMENT2)).toBe(SALARY3 + WAGE1 * HOURS1 + PERCENT1 * SALES1 / 100);
        expect(await company.getDepartmentBudget(DEPARTMENT4)).toBe(0);
        
    });
});
describe("persistence tests",async() => {
    beforeEach(async() => await fillCompany());
    it("save / restore persistence test", async () => {
        if(company.saveToFile) {
            const fileName = "test.data";
            await company.saveToFile(fileName);
            const companyNew = new Company();
            await companyNew.restoreFromFile(fileName);
            expect(await companyNew.getEmployee(ID1)).toEqual(empl1);
            expect(await companyNew.getEmployee(ID2)).toEqual(empl2);
            expect(await companyNew.getEmployee(ID3)).toEqual(empl3);
            expect(await companyNew.getEmployee(ID4)).toBeNull();
            expect(await companyNew.getDepartmentBudget(DEPARTMENT1)).toBe(SALARY1 + WAGE1 * HOURS1 + SALARY2 * FACTOR1);
		
            expect(await companyNew.getDepartmentBudget(DEPARTMENT2)).toBe(SALARY3 + WAGE1 * HOURS1 + PERCENT1 * SALES1 / 100);
            expect(await companyNew.getDepartmentBudget(DEPARTMENT4)).toBe(0);


        }
    })
    
})




// import {describe, expect, test} from 'vitest';
// import {} from '../Company.mjs';

// const Company = require('./Company.mjs');
// const Employee = require('./Employee.mjs');
// const Manager = require('./Manager.mjs');

// describe('Company class', () => {
//     let company;
//     let emp1, emp2, mgr1;

//     beforeEach(() => {
//         company = new Company();
//         emp1 = new Employee(1, 'Alice', 'HR', 5000);
//         emp2 = new Employee(2, 'Bob', 'IT', 6000);
//         mgr1 = new Manager(3, 'Charlie', 'IT', 8000, 1.5);
//     });

//     test('should add employees correctly', () => {
//         company.addEmployee(emp1);
//         expect(company.getEmployee(1)).toBe(emp1);
//     });

//     test('should not add duplicate employees', () => {
//         company.addEmployee(emp1);
//         expect(() => company.addEmployee(emp1)).toThrow('Already exists employee 1');
//     });

//     test('should remove employees correctly', () => {
//         company.addEmployee(emp1);
//         expect(company.removeEmployee(1)).toBe(emp1);
//         expect(company.getEmployee(1)).toBeNull();
//     });

//     test('should throw error when removing non-existent employee', () => {
//         expect(() => company.removeEmployee(999)).toThrow('Not found employee 999');
//     });

//     test('should calculate department budget correctly', () => {
//         company.addEmployee(emp1);
//         company.addEmployee(emp2);
//         expect(company.getDepartmentBudget('HR')).toBe(5000);
//         expect(company.getDepartmentBudget('IT')).toBe(6000);
//     });

//     test('should return sorted department names', () => {
//         company.addEmployee(emp1);
//         company.addEmployee(emp2);
//         expect(company.getDepartments()).toEqual(['HR', 'IT']);
//     });

//     test('should find managers with highest factor', () => {
//         company.addEmployee(mgr1);
//         expect(company.getManagersWithMostFactor()).toEqual([mgr1]);
//     });

//     test('should save and restore employees from file', () => {
//         const fs = require('fs');
//         jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
//         jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([emp1, emp2]));

//         company.addEmployee(emp1);
//         company.addEmployee(emp2);
//         company.saveToFile('test.json');

//         const newCompany = new Company();
//         newCompany.restoreFromFile('test.json');

//         expect(newCompany.getEmployee(1)).toEqual(expect.objectContaining({ id: 1, name: 'Alice' }));
//         expect(newCompany.getEmployee(2)).toEqual(expect.objectContaining({ id: 2, name: 'Bob' }));
//     });
// });