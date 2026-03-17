# inventory_management_system
The University Stock management & QR Verification System is a Software Engineering Lab project designed to modernize the way universities manage their department inventory. Instead of maintaining manual stock registers, this system provides a centralized digital platform to track, verify, and manage assets efficiently.
Universities contain multiple locations such as laboratories, classrooms, professor cabins, and administrative offices. Each of these spaces contains valuable items like desktops, chairs, printers, tables, keyboards, and mice. Managing these manually is time-consuming and error-prone. This project solves that problem using QR-based verification.

Project Objective

The main goal of this project is to automate the inventory management and periodic verification process. The system ensures transparency, reduces paperwork, and improves accuracy in stock handling.
It specifically aims to:
. Digitize department stock records
. Assign a unique QR code to every item
. Simplify six-month verification process
. Maintain verification history
. Generate reports for auditing purposes


How the System Works

Initially, the admin enters item details through the frontend interface. Once an item is added:
. A unique Item ID is generated
. A QR code is created automatically
. The QR code is printed and attached to the physical item
. Item details are stored in the database
During periodic verification (every 6 months), the verification officer simply scans the QR code. The system then:
. Identifies the item
. Updates its verification status
. Stores the timestamp
. Logs the verification history
. This removes the need for manual checking and paperwork.


Core Modules

The system is designed using modular software engineering principles to ensure maintainability and scalability. The main modules include:
. Authentication Module (Admin / Verification Officer login)
. Department Management Module
. Inventory Management Module
. QR Code Generation Module
. QR Verification Module
. Reporting & Analytics Module
. Each module works independently but integrates smoothly with the system.


Key Features

The system provides a range of useful features:
. Add / Edit / Delete Departments
. Add and manage inventory items
. Automatic QR code generation
. QR scanning for verification
. Verification timestamp logging
. Report generation
. History tracking


Technologies Used

The implementation can be built using:
. Frontend: HTML, CSS, JavaScript
. Backend: Node.js
. Database: Mysql
. QR Code Library: qrcode.js


Testing Strategy


To ensure quality and reliability, the following testing methods are applied:
. Unit Testing for individual modules
. Integration Testing for module interaction
. System Testing for full workflow
. Acceptance Testing for user validation


Non-Functional Requirements

Apart from functionality, the system ensures:
. Secure role-based login
. Fast QR response time (< 3 seconds)
. Reliable data storage
. User-friendly interface
. Scalability for large inventories


Future Enhancements

This project can be further improved by adding:
. Mobile application support
. Email reminders for verification due dates
. Cloud deployment
. Dashboard analyics
. AI-based missing item detection

