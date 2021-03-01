INSERT INTO departments (name)
VALUES ("Sales"),
    ("Engineering"),
    ("Finance"),
    ("Legal");
INSERT INTO roles (title, salary, department_id)
VALUES ("Sales Lead", 125000, 1),
    ("Sales Associate", 80000, 1),
    ("Lead Engineer", 180000, 2),
    ("Software Engineer", 130000, 2),
    ("Accountant", 120000, 3),
    ("Chief Legal Officer", 250000, 4),
    ("Lawyer", 200000, 4);
INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Humbert", "Farnsworth", 6, NULL),
    ("Zapp", "Brannigan", 5, NULL),
    ("Turanga", "Leela", 1, NULL),
    ("Amy", "Wong", 3, 1),
    ("Philip", "Fry", 2, 3),
    ("Bender", "Rodriguez", 4, 4);