
export default class Employee {
    static classMap = {
     Employee: new Employee()
    }
     constructor(id=0,department=null, basicSalary=0, className) {
         this.basicSalary = basicSalary;
         this.department = department;
         this.id = id;
         this.className = className || "Employee";
     }
     computeSalary() {
         return this.basicSalary;
     }
     getId() {
         return this.id;
     }
     getBasicSalary() {
         return this.basicSalary
     }
     getDepartment(){
         return this.department
     }
    
 }