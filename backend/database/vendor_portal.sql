-- Create Database
CREATE DATABASE IF NOT EXISTS vendor_portal;
USE vendor_portal;

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id VARCHAR(255) UNIQUE NOT NULL, -- Unique ID for vendors
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile_number VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    company_address TEXT,
    legal_structure VARCHAR(100), -- e.g., Sole Proprietorship, LLP, Private Limited
    pan_number VARCHAR(20) UNIQUE,
    gstin VARCHAR(20) UNIQUE,
    is_dm_official BOOLEAN DEFAULT FALSE, -- To distinguish DMRC officials from vendors
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Applications Table
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    department VARCHAR(100) NOT NULL, -- e.g., "Civil", "Electrical", "Mechanical"
    form_data JSON NOT NULL, -- Stores dynamic form fields as JSON
    status ENUM('Pending Verification', 'Clarification Requested', 'Approved', 'Rejected') DEFAULT 'Pending Verification',
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Documents Table (for mandatory uploads)
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL, -- Path to stored file
    mime_type VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id)
);

-- Clarifications Table (optional, for tracking requests)
CREATE TABLE clarifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    official_id INT NOT NULL, -- ID of the DMRC official
    request_text TEXT NOT NULL,
    response_text TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id),
    FOREIGN KEY (official_id) REFERENCES users(id) -- Assuming officials are also in the users table
);

-- Blacklisted Vendors Table (optional, for tracking blacklisting)
CREATE TABLE blacklisted_vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    reason TEXT NOT NULL,
    cooling_period_months INT, -- 6, 12, 24, 36, or 0 for lifetime
    blacklisted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reinstatement_date TIMESTAMP, -- Calculated based on cooling_period_months
    FOREIGN KEY (user_id) REFERENCES users(id)
);
