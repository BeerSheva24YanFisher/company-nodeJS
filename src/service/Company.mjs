export default class Company {
  #employees;
  #departments;
  #predicate;

  constructor() {
    this.#employees = {};
    this.#departments = {};
    this.#predicate = () => true;
  }

  setPredicate(predicate) {
    if (typeof predicate !== 'function') {
      throw new TypeError('Predicate must be a function');
    }
    this.#predicate = predicate;
  }

  [Symbol.iterator]() {
    return this.#makeEmployeeGenerator();
  }

  *#makeEmployeeGenerator() {
    for (const employee of Object.values(this.#employees)) {
      if (this.#predicate(employee)) {
        yield employee;
      }
    }
  }

  async addEmployee(employee) {
    if (!(employee instanceof Employee)) {
      throw Error(INVALID_EMPLOYEE_TYPE(employee));
    }
    if (this.#employees[employee.id]) {
      throw Error(EMPLOYEE_ALREADY_EXISTS(employee.id));
    }
    this.#employees[employee.id] = employee;
    this.#addDepartments(employee);
  }

  #addDepartments(employee) {
    const dep = employee.department;
    if (!this.#departments[dep]) {
      this.#departments[dep] = [];
    }
    this.#departments[dep].push(employee);
  }

  async getEmployee(id) {
    return this.#employees[id] ?? null;
  }

  async removeEmployee(id) {
    if (!this.#employees[id]) {
      throw Error(EMPLOYEE_NOT_FOUND(id));
    }
    this.#removeDepartments(this.#employees[id]);
    delete this.#employees[id];
  }

  #removeDepartments(employee) {
    const employees = this.#departments[employee.department];
    const index = employees.findIndex((e) => e.id === employee.id);
    employees.splice(index, 1);
    if (employees.length === 0) {
      delete this.#departments[employee.department];
    }
  }

  async getDepartmentBudget(department) {
    const employees = this.#departments[department] || [];
    return employees.reduce((bud, cur) => bud + cur.computeSalary(), 0);
  }

  async getDepartments() {
    return Object.keys(this.#departments).toSorted();
  }

  async getManagersWithMostFactor() {
    const managers = Object.values(this.#employees).filter(
      (e) => e instanceof Manager
    );
    managers.sort((m1, m2) => m2.getFactor() - m1.getFactor());
    if (managers.length === 0) return [];

    const maxFactor = managers[0].getFactor();
    return managers.filter((m) => m.getFactor() === maxFactor);
  }

  async saveToFile(fileName) {
    const employeesJSON = JSON.stringify(Object.values(this.#employees));
    await writeFile(fileName, employeesJSON, 'utf8');
  }

  async restoreFromFile(fileName) {
    const employeesPlain = JSON.parse(await readFile(fileName, 'utf8'));
    const employees = employeesPlain.map((e) => Employee.fromPlainObject(e));
    for (const e of employees) {
      await this.addEmployee(e);
    }
  }
}



// class Company {
//     constructor() {
//         this.employees = new Map();
//         this.employeesDepartment = new Map();
//         this.managersFactor = new Map();
//     }

//     addEmployee(empl) {
//         if (this.employees.has(empl.id)) {
//             throw new Error(`Already exists employee ${empl.id}`);
//         }
//         this.employees.set(empl.id, empl);
//         this._addIndexMaps(empl);
//     }

//     _addIndexMaps(empl) {
//         if (!this.employeesDepartment.has(empl.department)) {
//             this.employeesDepartment.set(empl.department, []);
//         }
//         this.employeesDepartment.get(empl.department).push(empl);
        
//         if (empl instanceof Manager) {
//             if (!this.managersFactor.has(empl.factor)) {
//                 this.managersFactor.set(empl.factor, []);
//             }
//             this.managersFactor.get(empl.factor).push(empl);
//         }
//     }

//     getEmployee(id) {
//         return this.employees.get(id) || null;
//     }

//     removeEmployee(id) {
//         const empl = this.employees.get(id);
//         if (!empl) {
//             throw new Error(`Not found employee ${id}`);
//         }
//         this.employees.delete(id);
//         this._removeFromIndexMaps(empl);
//         return empl;
//     }

//     _removeFromIndexMaps(empl) {
//         this._removeIndexMap(empl.department, this.employeesDepartment, empl);
//         if (empl instanceof Manager) {
//             this._removeIndexMap(empl.factor, this.managersFactor, empl);
//         }
//     }

//     _removeIndexMap(key, map, empl) {
//         if (!map.has(key)) return;
        
//         const list = map.get(key).filter(e => e !== empl);
//         if (list.length === 0) {
//             map.delete(key);
//         } else {
//             map.set(key, list);
//         }
//     }

//     getDepartmentBudget(department) {
//         return (this.employeesDepartment.get(department) || [])
//             .reduce((sum, emp) => sum + emp.computeSalary(), 0);
//     }

//     getDepartments() {
//         return Array.from(this.employeesDepartment.keys()).sort();
//     }

//     getManagersWithMostFactor() {
//         if (this.managersFactor.size === 0) return [];
//         const maxFactor = Math.max(...this.managersFactor.keys());
//         return this.managersFactor.get(maxFactor) || [];
//     }

//     saveToFile(fileName) {
//         const fs = require('fs');
//         fs.writeFileSync(fileName, JSON.stringify(Array.from(this.employees.values()), null, 2));
//     }

//     restoreFromFile(fileName) {
//         const fs = require('fs');
//         try {
//             const data = JSON.parse(fs.readFileSync(fileName, 'utf8'));
//             data.forEach(emp => this.addEmployee(new Employee(emp.id, emp.name, emp.department, emp.salary)));
//         } catch (error) {
//             console.error('Error reading file:', error);
//         }
//     }
// }
