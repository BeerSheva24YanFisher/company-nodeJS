import {describe, expect, test} from 'vitest';
import {} from '../Company.mjs';

const Company = require('./Company.mjs');
const Employee = require('./Employee.mjs');
const Manager = require('./Manager.mjs');

describe('Company class', () => {
    let company;
    let emp1, emp2, mgr1;

    beforeEach(() => {
        company = new Company();
        emp1 = new Employee(1, 'Alice', 'HR', 5000);
        emp2 = new Employee(2, 'Bob', 'IT', 6000);
        mgr1 = new Manager(3, 'Charlie', 'IT', 8000, 1.5);
    });

    test('should add employees correctly', () => {
        company.addEmployee(emp1);
        expect(company.getEmployee(1)).toBe(emp1);
    });

    test('should not add duplicate employees', () => {
        company.addEmployee(emp1);
        expect(() => company.addEmployee(emp1)).toThrow('Already exists employee 1');
    });

    test('should remove employees correctly', () => {
        company.addEmployee(emp1);
        expect(company.removeEmployee(1)).toBe(emp1);
        expect(company.getEmployee(1)).toBeNull();
    });

    test('should throw error when removing non-existent employee', () => {
        expect(() => company.removeEmployee(999)).toThrow('Not found employee 999');
    });

    test('should calculate department budget correctly', () => {
        company.addEmployee(emp1);
        company.addEmployee(emp2);
        expect(company.getDepartmentBudget('HR')).toBe(5000);
        expect(company.getDepartmentBudget('IT')).toBe(6000);
    });

    test('should return sorted department names', () => {
        company.addEmployee(emp1);
        company.addEmployee(emp2);
        expect(company.getDepartments()).toEqual(['HR', 'IT']);
    });

    test('should find managers with highest factor', () => {
        company.addEmployee(mgr1);
        expect(company.getManagersWithMostFactor()).toEqual([mgr1]);
    });

    test('should save and restore employees from file', () => {
        const fs = require('fs');
        jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
        jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([emp1, emp2]));

        company.addEmployee(emp1);
        company.addEmployee(emp2);
        company.saveToFile('test.json');

        const newCompany = new Company();
        newCompany.restoreFromFile('test.json');

        expect(newCompany.getEmployee(1)).toEqual(expect.objectContaining({ id: 1, name: 'Alice' }));
        expect(newCompany.getEmployee(2)).toEqual(expect.objectContaining({ id: 2, name: 'Bob' }));
    });
});