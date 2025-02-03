class Company {
    constructor() {
        this.employees = new Map();
        this.employeesDepartment = new Map();
        this.managersFactor = new Map();
    }

    addEmployee(empl) {
        if (this.employees.has(empl.id)) {
            throw new Error(`Already exists employee ${empl.id}`);
        }
        this.employees.set(empl.id, empl);
        this._addIndexMaps(empl);
    }

    _addIndexMaps(empl) {
        if (!this.employeesDepartment.has(empl.department)) {
            this.employeesDepartment.set(empl.department, []);
        }
        this.employeesDepartment.get(empl.department).push(empl);
        
        if (empl instanceof Manager) {
            if (!this.managersFactor.has(empl.factor)) {
                this.managersFactor.set(empl.factor, []);
            }
            this.managersFactor.get(empl.factor).push(empl);
        }
    }

    getEmployee(id) {
        return this.employees.get(id) || null;
    }

    removeEmployee(id) {
        const empl = this.employees.get(id);
        if (!empl) {
            throw new Error(`Not found employee ${id}`);
        }
        this.employees.delete(id);
        this._removeFromIndexMaps(empl);
        return empl;
    }

    _removeFromIndexMaps(empl) {
        this._removeIndexMap(empl.department, this.employeesDepartment, empl);
        if (empl instanceof Manager) {
            this._removeIndexMap(empl.factor, this.managersFactor, empl);
        }
    }

    _removeIndexMap(key, map, empl) {
        if (!map.has(key)) return;
        
        const list = map.get(key).filter(e => e !== empl);
        if (list.length === 0) {
            map.delete(key);
        } else {
            map.set(key, list);
        }
    }

    getDepartmentBudget(department) {
        return (this.employeesDepartment.get(department) || [])
            .reduce((sum, emp) => sum + emp.computeSalary(), 0);
    }

    getDepartments() {
        return Array.from(this.employeesDepartment.keys()).sort();
    }

    getManagersWithMostFactor() {
        if (this.managersFactor.size === 0) return [];
        const maxFactor = Math.max(...this.managersFactor.keys());
        return this.managersFactor.get(maxFactor) || [];
    }

    saveToFile(fileName) {
        const fs = require('fs');
        fs.writeFileSync(fileName, JSON.stringify(Array.from(this.employees.values()), null, 2));
    }

    restoreFromFile(fileName) {
        const fs = require('fs');
        try {
            const data = JSON.parse(fs.readFileSync(fileName, 'utf8'));
            data.forEach(emp => this.addEmployee(new Employee(emp.id, emp.name, emp.department, emp.salary)));
        } catch (error) {
            console.error('Error reading file:', error);
        }
    }
}
