const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs')
const db = require('../lib/dbconnection');
const service = require('../services/s_appointments');
const Joi = require('joi');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const { pdfUpload, imageUpload, excelUpload, mixedUpload } = require('../lib/multer');




// sample file generate

// router.get('/appointments/sample-template', async (req, res) => {
//     try {
//         const workbook = new ExcelJS.Workbook();

//          // Create main worksheet
//         const worksheet = workbook.addWorksheet('Appointments Template');

//         // Create Lists worksheet for dropdown options
//         const listsWorksheet = workbook.addWorksheet('Lists');
//         listsWorksheet.state = 'hidden';

//         // Get data from database
//         const clientsResult = await db.query('SELECT id, client_name FROM clients WHERE is_deleted=0');
//         const centersResult = await db.query('SELECT id, center_name FROM diagnostic_centers WHERE is_deleted=0');
//         const insurersResult = await db.query('SELECT id, insurer_name FROM insurers WHERE is_deleted=0');

//         // Extract rows based on your database driver
//         const clients = Array.isArray(clientsResult) ? clientsResult : 
//                         clientsResult?.rows || clientsResult?.[0] || [];
//         const centers = Array.isArray(centersResult) ? centersResult : 
//                         centersResult?.rows || centersResult?.[0] || [];
//         const insurers = Array.isArray(insurersResult) ? insurersResult : 
//                          insurersResult?.rows || insurersResult?.[0] || [];

//         // Populate Lists sheet
//         const listStartRow = 2;

//         // Clients in column A
//         listsWorksheet.getCell('A1').value = 'Clients';
//         clients.forEach((c, index) => {
//             listsWorksheet.getCell(`A${listStartRow + index}`).value = `${c.id} - ${c.client_name}`;
//         });

//         // Centers in column B
//         listsWorksheet.getCell('B1').value = 'Centers';
//         centers.forEach((c, index) => {
//             listsWorksheet.getCell(`B${listStartRow + index}`).value = `${c.id} - ${c.center_name}`;
//         });

//         // Insurers in column C
//         listsWorksheet.getCell('C1').value = 'Insurers';
//         insurers.forEach((i, index) => {
//             listsWorksheet.getCell(`C${listStartRow + index}`).value = `${i.id} - ${i.insurer_name}`;
//         });



//         // Add title
//         let currentRow = 1;
//         worksheet.getRow(currentRow).values = ['APPOINTMENTS UPLOAD TEMPLATE'];
//         worksheet.mergeCells(`A${currentRow}:O${currentRow}`);
//         worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 16 };
//         worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center' };
//         currentRow++;

//         // Add instructions
//         const instructionsStart = currentRow;
//         worksheet.getRow(currentRow).values = ['Instructions:'];
//         currentRow++;
//         worksheet.getRow(currentRow).values = ['- Fields marked with * are mandatory'];
//         currentRow++;
//         worksheet.getRow(currentRow).values = ['- Use dropdowns (small arrow in cell) to select from available options'];
//         currentRow++;
//         worksheet.getRow(currentRow).values = ['- Date format: YYYY-MM-DD (e.g., 2024-01-15)'];
//         currentRow++;
//         worksheet.getRow(currentRow).values = ['- Time format: HH:MM:SS (e.g., 14:30:00)'];
//         currentRow++;
//         worksheet.getRow(currentRow).values = ['- For dropdown fields, please select from the list only'];
//         currentRow++;

//         // Style instructions
//         for (let i = instructionsStart; i < currentRow; i++) {
//             worksheet.getRow(i).font = { italic: true, color: { argb: 'FF0000' } };
//         }

//         // Add empty row
//         currentRow++;

//         // Add header row
//         const headerRow = currentRow;
//         worksheet.getRow(headerRow).values = [
//             'Application Number*',
//             'Client',
//             'Diagnostic Center',
//             'Insurer',
//             'Customer First Name',
//             'Customer Last Name',
//             'Gender',
//             'Customer Mobile',
//             'Customer Email',
//             'Appointment Date* (YYYY-MM-DD)',
//             'Appointment Time (HH:MM:SS)',
//             'Visit Type',
//             'Status',
//             'Remarks'
//         ];

//         // Style the header row
//         worksheet.getRow(headerRow).font = { bold: true, color: { argb: 'FFFFFF' } };
//         worksheet.getRow(headerRow).fill = {
//             type: 'pattern',
//             pattern: 'solid',
//             fgColor: { argb: '4472C4' }
//         };

//         // Set column widths
//         const colWidths = [20, 25, 25, 25, 25, 20, 20, 15, 15, 25, 25, 20, 20, 20, 30];
//         for (let c = 1; c <= colWidths.length; c++) {
//             worksheet.getColumn(c).width = colWidths[c - 1];
//         }

//         // Predefined dropdown options for short lists
//         const genderOptions = ['Male', 'Female', 'Other'];
//         const visitTypeOptions = ['Home_Visit', 'Center_Visit', 'Both'];
//         const statusOptions = ['Pending', 'Scheduled', 'Confirm', 'In_Progress', 'Completed', 'Partially_Completed', 'Cancelled'];

//         // Calculate first data row
//         const firstDataRow = headerRow + 1;

//         // Add data validation (dropdowns) for 100 rows
//         for (let i = 0; i < 100; i++) {
//             const row = firstDataRow + i;

//             // Client dropdown (Column C)
//             const clientFormula = `'Lists'!$A$${listStartRow}:$A$${listStartRow + clients.length - 1}`;
//             worksheet.getCell(`C${row}`).dataValidation = {
//                 type: 'list',
//                 allowBlank: true,
//                 formulae: [clientFormula],
//                 showErrorMessage: true,
//                 errorTitle: 'Invalid Selection',
//                 error: 'Please select from the list of clients'
//             };

//             // Center dropdown (Column D)
//             const centerFormula = `'Lists'!$B$${listStartRow}:$B$${listStartRow + centers.length - 1}`;
//             worksheet.getCell(`D${row}`).dataValidation = {
//                 type: 'list',
//                 allowBlank: true,
//                 formulae: [centerFormula],
//                 showErrorMessage: true,
//                 errorTitle: 'Invalid Selection',
//                 error: 'Please select from the list of diagnostic centers'
//             };

//             // Insurer dropdown (Column E)
//             const insurerFormula = `'Lists'!$C$${listStartRow}:$C$${listStartRow + insurers.length - 1}`;
//             worksheet.getCell(`E${row}`).dataValidation = {
//                 type: 'list',
//                 allowBlank: true,
//                 formulae: [insurerFormula],
//                 showErrorMessage: true,
//                 errorTitle: 'Invalid Selection',
//                 error: 'Please select from the list of insurers'
//             };

//             // Gender dropdown (Column H)
//             worksheet.getCell(`H${row}`).dataValidation = {
//                 type: 'list',
//                 allowBlank: true,
//                 formulae: [`"${genderOptions.join(',')}"`],
//                 showErrorMessage: true
//             };

//             // Visit Type dropdown (Column M)
//             worksheet.getCell(`M${row}`).dataValidation = {
//                 type: 'list',
//                 allowBlank: true,
//                 formulae: [`"${visitTypeOptions.join(',')}"`],
//                 showErrorMessage: true
//             };

//             // Status dropdown (Column N)
//             worksheet.getCell(`N${row}`).dataValidation = {
//                 type: 'list',
//                 allowBlank: true,
//                 formulae: [`"${statusOptions.join(',')}"`],
//                 showErrorMessage: true
//             };
//         }

//         // Add sample data row
//         const sampleData = [
//             'APP-001',
//             clients.length > 0 ? `${clients[0].id} - ${clients[0].client_name}` : '',
//             centers.length > 0 ? `${centers[0].id} - ${centers[0].center_name}` : '',
//             insurers.length > 0 ? `${insurers[0].id} - ${insurers[0].insurer_name}` : '',
//             'John',
//             'Doe',
//             'Male',
//             '9876543210',
//             'john.doe@email.com',
//             '2024-01-15',
//             '09:00:00',
//             'Home_Visit',
//             'Pending',
//             'Initial appointment'
//         ];
//         worksheet.getRow(firstDataRow).values = sampleData;

//         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//         res.setHeader('Content-Disposition', 'attachment; filename=appointments_template.xlsx');

//         await workbook.xlsx.write(res);
//         res.end();

//     } catch (error) {
//         console.error('Error generating template:', error);
//         res.status(500).json({ message: 'Error generating template: ' + error.message });
//     }
// });

router.get('/appointments/sample-template', async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();

        // Create main worksheet
        const worksheet = workbook.addWorksheet('Appointments Template');

        // Create Lists worksheet for dropdown options
        const listsWorksheet = workbook.addWorksheet('Lists');
        listsWorksheet.state = 'hidden';

        // Get data from database
        const clientsResult = await db.query('SELECT id, client_name FROM clients WHERE is_deleted=0 ');
        // const centersResult = await db.query('SELECT id, center_name FROM diagnostic_centers WHERE is_deleted=0 ');
        const insurersResult = await db.query('SELECT id, insurer_name FROM insurers WHERE is_deleted=0 ');

        // Extract rows based on your database driver
        const clients = Array.isArray(clientsResult) ? clientsResult :
            clientsResult?.rows || clientsResult?.[0] || [];
        // const centers = Array.isArray(centersResult) ? centersResult : 
        //                 centersResult?.rows || centersResult?.[0] || [];
        const insurers = Array.isArray(insurersResult) ? insurersResult :
            insurersResult?.rows || insurersResult?.[0] || [];

        // Populate Lists sheet
        const listStartRow = 2;

        // Clients in column A
        listsWorksheet.getCell('A1').value = 'Clients';
        clients.forEach((c, index) => {
            listsWorksheet.getCell(`A${listStartRow + index}`).value = `${c.id} - ${c.client_name}`;
        });

        // Insurers in column B
        listsWorksheet.getCell('B1').value = 'Insurers';
        insurers.forEach((i, index) => {
            listsWorksheet.getCell(`B${listStartRow + index}`).value = `${i.id} - ${i.insurer_name}`;
        });

        // Add title
        let currentRow = 1;
        worksheet.getRow(currentRow).values = ['APPOINTMENTS UPLOAD TEMPLATE'];
        worksheet.mergeCells(`A${currentRow}:N${currentRow}`); // Fixed: Changed from O to N (14 columns)
        worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 16 };
        worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center' };
        currentRow++;

        // Add instructions
        const instructionsStart = currentRow;
        worksheet.getRow(currentRow).values = ['Instructions:'];
        currentRow++;
        worksheet.getRow(currentRow).values = ['- Fields marked with * are mandatory'];
        currentRow++;
        worksheet.getRow(currentRow).values = ['- Use dropdowns (small arrow in cell) to select from available options'];
        currentRow++;
        worksheet.getRow(currentRow).values = ['- Date format: YYYY-MM-DD (e.g., 2024-01-15)'];
        currentRow++;
        worksheet.getRow(currentRow).values = ['- Time format: HH:MM:SS (e.g., 14:30:00)'];
        currentRow++;
        worksheet.getRow(currentRow).values = ['- For dropdown fields, please select from the list only'];
        currentRow++;

        // Style instructions
        for (let i = instructionsStart; i < currentRow; i++) {
            worksheet.getRow(i).font = { italic: true, color: { argb: 'FF0000' } };
        }

        // Add empty row
        currentRow++;

        // Add header row - CORRECTED COLUMN MAPPINGS
        const headerRow = currentRow;
        worksheet.getRow(headerRow).values = [
            'Application Number*',
            'TPA',
            // 'Diagnostic Center',          
            'Insurer',
            'Customer First Name',
            'Customer Last Name',
            'Gender',
            'Customer Mobile',
            'Customer Email',
            'Customer Category',
            'Appointment Date* (YYYY-MM-DD)',
            'Appointment Time (HH:MM:SS)',
            'Visit Type',
            'Landmark',
            'State',
            'City',
            'Pin Code',
            'Country',
            'Customer Address',
            'Status',
            'Remarks'
        ];

        // Style the header row
        worksheet.getRow(headerRow).font = { bold: true, color: { argb: 'FFFFFF' } };
        worksheet.getRow(headerRow).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '4472C4' }
        };

        // Set column widths - CORRECTED: 14 columns instead of 15
        // const colWidths = [20, 25, 25, 20, 20, 15, 15, 25, 20, 15, 15, 15, 30];
        const colWidths = [20, 25, 25, 20, 20, 15, 15, 25, 20, 20, 15, 20, 20, 20, 20, 15, 10, 30, 20, 30];

        for (let c = 1; c <= colWidths.length; c++) {
            worksheet.getColumn(c).width = colWidths[c - 1];
        }

        // Predefined dropdown options for short lists
        const genderOptions = ['Male', 'Female', 'Other'];
        const visitTypeOptions = ['Home_Visit', 'Center_Visit', 'Both'];
        const statusOptions = ['Pending', 'Scheduled', 'Confirm', 'In_Progress', 'Completed', 'Partially_Completed', 'Cancelled'];

        // Calculate first data row
        const firstDataRow = headerRow + 1;

        // Add data validation (dropdowns) for 100 rows - CORRECTED COLUMN MAPPINGS
        for (let i = 0; i < 100; i++) {
            const row = firstDataRow + i;

            // Client dropdown (Column B - index 2)
            const clientFormula = `Lists!$A$${listStartRow}:$A$${listStartRow + clients.length - 1}`;
            worksheet.getCell(`B${row}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [clientFormula],
                showErrorMessage: true,
                errorTitle: 'Invalid Selection',
                error: 'Please select from the list of clients'
            };

            // Insurer dropdown (Column D - index 4)
            const insurerFormula = `Lists!$B$${listStartRow}:$B$${listStartRow + insurers.length - 1}`;
            worksheet.getCell(`C${row}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [insurerFormula],
                showErrorMessage: true,
                errorTitle: 'Invalid Selection',
                error: 'Please select from the list of insurers'
            };

            // Gender dropdown (Column G - index 7)
            worksheet.getCell(`F${row}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [`"${genderOptions.join(',')}"`],
                showErrorMessage: true,
                errorTitle: 'Invalid Selection',
                error: 'Please select from: ' + genderOptions.join(', ')
            };

            // Customer Category dropdown (Column I)
            worksheet.getCell(`I${row}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: ['"Non_HNI,SUPER_HNI,HNI"'],
                showErrorMessage: true,
                errorTitle: 'Invalid Category',
                error: 'Please select from: Non_HNI, SUPER_HNI, HNI'
            };


            // Visit Type dropdown (Column L - index 12)
            worksheet.getCell(`L${row}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [`"${visitTypeOptions.join(',')}"`],
                showErrorMessage: true,
                errorTitle: 'Invalid Selection',
                error: 'Please select from: ' + visitTypeOptions.join(', ')
            };

            // Status dropdown (Column M - index 13)
            worksheet.getCell(`S${row}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [`"${statusOptions.join(',')}"`],
                showErrorMessage: true,
                errorTitle: 'Invalid Selection',
                error: 'Please select from: ' + statusOptions.join(', ')
            };

            // Add date validation for appointment date (Column J - index 10)
            worksheet.getCell(`J${row}`).dataValidation = {
                type: 'custom',
                allowBlank: false, // Mandatory field
                formulae: ['ISDATE(J' + row + ')'],
                showErrorMessage: true,
                errorTitle: 'Invalid Date',
                error: 'Please enter date in YYYY-MM-DD format'
            };


            worksheet.getCell(`Q${row}`).value = 'IN';
        }

        // Add sample data row - CORRECTED COLUMN MAPPINGS
        const sampleData = [
            'APP-001', // A
            clients.length > 0 ? `${clients[0].id} - ${clients[0].client_name}` : '', // B
            insurers.length > 0 ? `${insurers[0].id} - ${insurers[0].insurer_name}` : '', // C
            'John', // D
            'Doe',  // E
            'Male', // F
            '9876543210', // G
            'john.doe@email.com', // H
            'Non_HNI', // I
            '2024-01-15', // J
            '09:00:00', // K
            'Home_Visit', // L
            'Near Mall Road', // M
            'Delhi', // N
            'New Delhi', // O
            '110001', // P
            'IN', // Q
            '123 Main Street, XYZ Building', // R
            'Pending', // S
            'Initial appointment' // T
        ];

        worksheet.getRow(firstDataRow).values = sampleData;

        // Style the sample data row
        worksheet.getRow(firstDataRow).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F0F0F0' }
        };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=appointments_template.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error generating template:', error);
        res.status(500).json({
            message: 'Error generating template: ' + error.message,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

const { verifyToken, checkRole } = require('../lib/auth');



const appointmentBaseSchema = Joi.object({
    case_number: Joi.string().allow(null, '').optional(),
    application_number: Joi.string().required(),
    client_id: Joi.number().allow(null).optional(),
    center_id: Joi.number().allow(null).optional(),
    other_center_id: Joi.number().allow(null).optional(),
    insurer_id: Joi.number().allow(null).optional(),
    customer_first_name: Joi.string().allow(null).optional(),
    customer_last_name: Joi.string().allow(null).optional(),
    gender: Joi.string().valid('Male', 'Female', 'Other').allow(null).optional(),
    customer_mobile: Joi.string().allow(null).optional(),
    customer_email: Joi.string().email().allow(null).optional(),
    customer_address: Joi.string().allow(null).optional(),
    state: Joi.string().allow(null).optional(),
    city: Joi.string().allow(null).optional(),
    pincode: Joi.string().max(6).allow(null).optional(),
    country: Joi.string().allow(null).optional(),
    customer_gps_latitude: Joi.string().allow(null).optional(),
    customer_gps_longitude: Joi.string().allow(null).optional(),
    customer_landmark: Joi.string().allow(null).optional(),
    visit_type: Joi.string().valid('Home_Visit', 'Center_Visit', 'Both').allow(null).optional(),
    customer_category: Joi.string().valid('HNI', 'Non_HNI', 'SUPER_HNI').allow(null).optional(),
    appointment_date: Joi.date().required(),
    appointment_time: Joi.string().allow(null).optional(),
    confirmed_time: Joi.string().allow(null).optional(),
    status: Joi.string().valid('Pending', 'Scheduled', 'Confirm', 'In_Progress', 'Cancelled', 'Completed', 'Partially_Completed').allow(null).optional(),
    assigned_technician_id: Joi.number().allow(null).optional(),
    remarks: Joi.string().allow(null).optional(),
    cost_type: Joi.string().valid('Credit', 'Advance NEFT', 'Additional Home Visit Cost', 'Credit + Advance').allow(null).optional(),
    amount: Joi.number().positive().allow(null).optional(),
    amount_upload: Joi.any().optional(),
    selected_items: Joi.string()
        .optional()
        .allow(null, '')
        .custom((value, helpers) => {
            if (!value) return value;
            try {
                const parsed = JSON.parse(value);
                if (!Array.isArray(parsed)) {
                    return helpers.error('any.invalid', { message: '"selected_items" must be a valid JSON array' });
                }
                for (const item of parsed) {
                    const { error } = Joi.object({
                        id: Joi.number().required(),
                        name: Joi.string().required(),
                        type: Joi.string().valid('test', 'category').required(),
                        rate: Joi.alternatives().try(
                            Joi.number().required(),
                            Joi.string().pattern(/^\d+(\.\d+)?$/).custom((val, h) => parseFloat(val)).required()
                        ),
                    }).validate(item);
                    if (error) {
                        return helpers.error('any.invalid', { message: `Invalid item in selected_items: ${error.message}` });
                    }
                }
                // Normalize rates to numbers
                return JSON.stringify(parsed.map(item => ({
                    ...item,
                    rate: typeof item.rate === 'string' ? parseFloat(item.rate) : item.rate,
                })));
            } catch (e) {
                return helpers.error('any.invalid', { message: '"selected_items" must be a valid JSON string' });
            }
        }),
    total_amount: Joi.number().positive().allow(null).optional(),
});

const appointmentUpdateSchema = Joi.object({
    case_number: Joi.string().allow(null, '').optional(),
    application_number: Joi.string().optional(),
    client_id: Joi.number().allow(null).optional(),
    center_id: Joi.number().allow(null).optional(),
    other_center_id: Joi.number().allow(null).optional(),
    insurer_id: Joi.number().allow(null).optional(),
    customer_first_name: Joi.string().allow(null).optional(),
    customer_last_name: Joi.string().allow(null).optional(),
    gender: Joi.string().valid('Male', 'Female', 'Other').allow(null).optional(),
    customer_mobile: Joi.string().allow(null).optional(),
    customer_email: Joi.string().email().allow(null).optional(),
    customer_address: Joi.string().allow(null).optional(),
    state: Joi.string().allow(null).optional(),
    city: Joi.string().allow(null).optional(),
    pincode: Joi.string().max(6).allow(null).optional(),
    country: Joi.string().allow(null).optional(),
    customer_gps_latitude: Joi.string().allow(null).optional(),
    customer_gps_longitude: Joi.string().allow(null).optional(),
    customer_landmark: Joi.string().allow(null).optional(),
    visit_type: Joi.string().valid('Home_Visit', 'Center_Visit', 'Both').allow(null).optional(),
    customer_category: Joi.string().valid('HNI', 'Non_HNI', 'SUPER_HNI').allow(null).optional(),
    appointment_date: Joi.date().optional(),
    appointment_time: Joi.string().allow(null).optional(),
    confirmed_time: Joi.string().allow(null).optional(),
    status: Joi.string().valid('Pending', 'Scheduled', 'Confirm', 'In_Progress', 'Cancelled', 'Completed', 'Partially_Completed').allow(null).optional(),
    assigned_technician_id: Joi.number().allow(null).optional(),
    remarks: Joi.string().allow(null).optional(),
    cost_type: Joi.string().valid('Credit', 'Advance NEFT', 'Additional Home Visit Cost', 'Credit + Advance').allow(null).optional(),
    amount: Joi.number().positive().allow(null).optional(),
    amount_upload: Joi.any().optional(),
    selected_items: Joi.string()
        .optional()
        .allow(null, '')
        .custom((value, helpers) => {
            if (!value) return value;
            try {
                const parsed = JSON.parse(value);
                if (!Array.isArray(parsed)) {
                    return helpers.error('any.invalid', { message: '"selected_items" must be a valid JSON array' });
                }
                for (const item of parsed) {
                    const { error } = Joi.object({
                        id: Joi.number().required(),
                        name: Joi.string().required(),
                        type: Joi.string().valid('test', 'category').required(),
                        rate: Joi.number().required(),
                    }).validate(item);
                    if (error) {
                        return helpers.error('any.invalid', { message: `Invalid item in selected_items: ${error.message}` });
                    }
                }
                return value;
            } catch (e) {
                return helpers.error('any.invalid', { message: '"selected_items" must be a valid JSON string' });
            }
        }),
    total_amount: Joi.number().positive().allow(null).optional(),
});

const deleteCentersSchema = Joi.object({
    ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
});

const bulkUpdateSchema = Joi.object({
    ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
    center_id: Joi.number().integer().positive().optional(),
    assigned_technician_id: Joi.number().integer().positive().optional(),
}).or('center_id', 'assigned_technician_id');

function cleanValue(value) {
    if (value === undefined || value === null || value === '') return null;
    if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value)) {
        return value.toISOString().split('T')[0];
    }
    if (typeof value === 'number' && value > 30000 && value < 60000) {
        const excelEpoch = new Date(1899, 11, 30);
        const date = new Date(excelEpoch.getTime() + value * 86400000);
        return date.toISOString().split('T')[0];
    }
    return value;
}

function cleanTimeValue(value) {
    if (value === undefined || value === null || value === '') return null;
    if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value)) {
        return value.toTimeString().split(' ')[0];
    }
    if (typeof value === 'number' && value > 0 && value < 1) {
        const totalSeconds = Math.round(value * 24 * 60 * 60);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
    if (typeof value === 'string') {
        const parts = value.split(':');
        if (parts.length >= 2) {
            const h = parts[0].padStart(2, '0');
            const m = parts[1].padStart(2, '0');
            const s = parts[2] ? parts[2].padStart(2, '0') : '00';
            return `${h}:${m}:${s}`;
        }
    }
    return null;
}

router.get('/appointments', verifyToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.q || '';
        const sortBy = req.query.sortBy || 'id';
        const sortOrder = req.query.sortOrder || 'DESC';

        const data = await service.listAppointments({
            page,
            limit,
            search,
            sortBy,
            sortOrder
        });

        res.json(data);
    } catch (e) {
        console.error('Error listing appointments:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/appointments/DiagnosticCenter', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 0;
        const search = req.query.q || '';
        const centerIdRaw = req.query.centerId;
        const centerId = centerIdRaw !== undefined ? parseInt(centerIdRaw) : undefined;
        const data = await service.listAppointmentsbyDiagnosticCenters({ page, limit, search, centerId });
        res.json(data);
    } catch (e) {
        console.error('Error listing appointments:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/appointments/Technician', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 0;
        const search = req.query.q || '';
        const technicianId = parseInt(req.query.technicianId);
        const data = await service.listAppointmentsbyTechnician({ page, limit, search, technicianId });
        res.json(data);
    } catch (e) {
        console.error('Error listing appointments:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/appointments/:id', verifyToken, async (req, res) => {
    try {
        const row = await service.getAppointment(req.params.id);
        if (!row) return res.status(404).json({ message: 'Not found' });
        res.json(row);
    } catch (e) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/appointments', verifyToken, checkRole([1]), mixedUpload.single('amount_upload'), async (req, res) => {
    try {
        console.log('Raw req.body:', req.body); // NEW: Log raw body
        console.log('req.file:', req.file); // NEW: Log file if present
        const { error, value } = appointmentBaseSchema.validate(req.body);
        if (error) {
            console.error('Validation error:', error.details); // NEW: Log validation details
            return res.status(400).json({ message: error.details[0].message });
        }

        if (req.file) {
            value.amount_upload = req.file.path;
        }
        if (value.selected_items) {
            console.log('Parsing selected_items:', value.selected_items); // NEW: Log before parsing
            try {
                value.selected_items = JSON.parse(value.selected_items);
                console.log('Parsed selected_items:', value.selected_items); // NEW: Log after parsing
            } catch (parseError) {
                console.error('JSON.parse error for selected_items:', parseError); // NEW: Log parse error
                return res.status(400).json({ message: '"selected_items" must be a valid JSON array' });
            }
        }

        const id = await service.createAppointment({ ...value, created_by: req.user.id });
        res.status(201).json({ id });
    } catch (e) {
        console.error('Create appointment error:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.put('/appointments/:id', verifyToken, checkRole([1, 3, 4]), mixedUpload.single('amount_upload'), async (req, res) => {
    try {
        console.log('Raw req.body:', req.body); // NEW: Log raw body
        console.log('req.file:', req.file); // NEW: Log file if present
        const { error, value } = appointmentUpdateSchema.validate(req.body);
        if (error) {
            console.error('Validation error:', error.details); // NEW: Log validation details
            return res.status(400).json({ message: error.details[0].message });
        }

        if (req.file) {
            value.amount_upload = req.file.path;
        } else if (req.body.amount_upload === '') {
            value.amount_upload = null;
        }
        if (value.selected_items) {
            console.log('Parsing selected_items:', value.selected_items); // NEW: Log before parsing
            try {
                value.selected_items = JSON.parse(value.selected_items);
                console.log('Parsed selected_items:', value.selected_items); // NEW: Log after parsing
            } catch (parseError) {
                console.error('JSON.parse error for selected_items:', parseError); // NEW: Log parse error
                return res.status(400).json({ message: '"selected_items" must be a valid JSON array' });
            }
        }

        if (value.cost_type === 'Credit') {
            value.amount = null;
        }

        const affected = await service.updateAppointment(req.params.id, value);
        if (!affected) return res.status(404).json({ message: 'Not found or no changes' });

        res.json({ updated: affected });
    } catch (e) {
        console.error('Update appointment error:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/appointments/delete', verifyToken, checkRole([1]), async (req, res) => {
    const { error, value } = deleteCentersSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const affected = await service.softDeleteAppointments(value.ids);
    if (!affected) {
        return res.status(404).json({ message: 'No Appointments were found or already deleted' });
    }

    res.json({ message: 'Appointments soft deleted successfully', updated: affected });
});

router.delete('/appointments/:id', verifyToken, checkRole([1]), async (req, res) => {
    try {
        const affected = await service.deleteAppointment(req.params.id);
        if (!affected) return res.status(404).json({ message: 'Not found' });
        res.json({ deleted: affected });
    } catch (e) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/appointments/UpdateIds', verifyToken, checkRole([1, 3, 4]), async (req, res) => {
    try {
        const { error, value } = bulkUpdateSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const affected = await service.UpdateAppointmentsTechnicianDiagnosticCenters(value.ids, {
            center_id: value.center_id,
            assigned_technician_id: value.assigned_technician_id,
        });

        if (!affected) return res.status(404).json({ message: 'No appointments updated' });

        res.json({ message: 'Appointments updated successfully', updated: affected });
    } catch (e) {
        console.error('Bulk update error:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// router.post('/appointments/upload', verifyToken, checkRole([1]), excelUpload.single('file'), async (req, res) => {
//     try {
//         const workbook = xlsx.readFile(req.file.path);
//         const sheet = workbook.Sheets[workbook.SheetNames[0]];
//         const rows = xlsx.utils.sheet_to_json(sheet);

//         const insertedIds = [];
//         const failedRows = [];

//         for (const [index, row] of rows.entries()) {
//             try {
//                 const cleanedRow = {
//                     case_number: cleanValue(row.case_number),
//                     application_number: cleanValue(row.application_number),
//                     client_id: cleanValue(row.client_id),
//                     center_id: cleanValue(row.center_id),
//                     insurer_id: cleanValue(row.insurer_id),
//                     customer_first_name: cleanValue(row.customer_first_name),
//                     customer_last_name: cleanValue(row.customer_last_name),
//                     gender: cleanValue(row.gender),
//                     customer_mobile: cleanValue(row.customer_mobile),
//                     customer_alt_mobile: cleanValue(row.customer_alt_mobile),
//                     customer_email: cleanValue(row.customer_email),
//                     customer_address: cleanValue(row.customer_address),
//                     state: cleanValue(row.state),
//                     city: cleanValue(row.city),
//                     pincode: cleanValue(row.pincode),
//                     country: cleanValue(row.country),
//                     customer_gps_latitude: cleanValue(row.customer_gps_latitude),
//                     customer_gps_longitude: cleanValue(row.customer_gps_longitude),
//                     customer_landmark: cleanValue(row.customer_landmark),
//                     visit_type: cleanValue(row.visit_type) || 'Home_Visit',
//                     test_name: cleanValue(row.test_name),
//                     customer_category: cleanValue(row.customer_category) || 'Non_HNI',
//                     appointment_date: cleanValue(row.appointment_date),
//                     appointment_time: cleanTimeValue(row.appointment_time),
//                     confirmed_time: cleanTimeValue(row.confirmed_time),
//                     status: cleanValue(row.status) || 'Pending',
//                     assigned_technician_id: cleanValue(row.assigned_technician_id),
//                     remarks: cleanValue(row.remarks),
//                     cost_type: cleanValue(row.cost_type),
//                     amount: cleanValue(row.amount),
//                     amount_upload: null, // Excel upload doesn't handle file uploads
//                     created_by: req.user.id,
//                 };

//                 const { error, value } = appointmentBaseSchema.validate(cleanedRow, { stripUnknown: true });
//                 if (error) {
//                     throw new Error(error.details[0].message);
//                 }

//                 // Business rule: if Credit, amount should be null
//                 if (value.cost_type === 'Credit') {
//                     value.amount = null;
//                 }

//                 const id = await service.createAppointment(value);
//                 insertedIds.push(id);
//             } catch (error) {
//                 console.error(`Error processing row ${index + 2}:`, error.message); // +2 = header + 0-based index
//                 failedRows.push({ rowNumber: index + 2, row, error: error.message });
//             }
//         }

//         res.status(201).json({
//             message: `${insertedIds.length} appointments inserted`,
//             insertedIds,
//             failedRows,
//         });

//     } catch (e) {
//         console.error('Excel upload error:', e);
//         res.status(500).json({ message: 'Failed to process Excel file' });
//     }
// });

router.post('/appointments/upload', verifyToken, checkRole([1]), excelUpload.single('file'), async (req, res) => {
    try {
        const workbook = xlsx.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // Convert sheet to JSON, starting from the header row (row 8)
        const rows = xlsx.utils.sheet_to_json(sheet, {
            header: [
                'application_number',
                'client_id',
                'insurer_id',
                'customer_first_name',
                'customer_last_name',
                'gender',
                'customer_mobile',
                'customer_email',
                'customer_category',
                'appointment_date',
                'appointment_time',
                'visit_type',
                'customer_landmark',
                'state',
                'city',
                'pincode',
                'country',
                'customer_address',
                'status',
                'remarks'
            ],
            range: 7, // Start from row 8 (0-based index: 7)
        });

        // Fetch valid IDs from database for validation
        const clientsResult = await db.query('SELECT id FROM clients WHERE is_deleted=0 ');
        const insurersResult = await db.query('SELECT id FROM insurers WHERE is_deleted=0');

        const validClientIds = new Set(
            (Array.isArray(clientsResult) ? clientsResult : clientsResult?.rows || clientsResult?.[0] || []).map(c => c.id)
        );
        const validInsurerIds = new Set(
            (Array.isArray(insurersResult) ? insurersResult : insurersResult?.rows || insurersResult?.[0] || []).map(i => i.id)
        );

        const insertedIds = [];
        const failedRows = [];

        // SKIP THE HEADER ROW - start from index 1 instead of 0
        for (const [index, row] of rows.entries()) {
            // Skip the first row (header row)
            if (index === 0) continue;

            // Also skip empty rows
            if (!row.application_number && !row.client_id && !row.insurer_id) {
                continue;
            }

            try {
                // Parse ID from 'id - name' format
                const parseId = (value, fieldName, validIds) => {
                    if (!value) return null; // Allow null for optional fields
                    const match = String(value).match(/^(\d+)\s*-\s*/);
                    if (!match) {
                        throw new Error(`Invalid ${fieldName} format: "${value}". Expected format: "id - name"`);
                    }
                    const id = parseInt(match[1], 10);
                    if (!validIds.has(id)) {
                        throw new Error(`Invalid ${fieldName} ID: ${id} does not exist`);
                    }
                    return id;
                };

                const cleanedRow = {
                    application_number: cleanValue(row.application_number),
                    client_id: parseId(row.client_id, 'client', validClientIds),
                    insurer_id: parseId(row.insurer_id, 'insurer', validInsurerIds),
                    customer_first_name: cleanValue(row.customer_first_name),
                    customer_last_name: cleanValue(row.customer_last_name),
                    gender: cleanValue(row.gender),
                    customer_mobile: cleanValue(row.customer_mobile),
                    customer_email: cleanValue(row.customer_email),
                    customer_category: cleanValue(row.customer_category) || 'Non_HNI',
                    appointment_date: cleanValue(row.appointment_date),
                    appointment_time: cleanTimeValue(row.appointment_time),
                    visit_type: cleanValue(row.visit_type) || 'Home_Visit',
                    customer_landmark: cleanValue(row.customer_landmark),
                    state: cleanValue(row.state),
                    city: cleanValue(row.city),
                    pincode: cleanValue(row.pincode),
                    country: cleanValue(row.country) || 'IN',
                    customer_address: cleanValue(row.customer_address),
                    status: cleanValue(row.status) || 'Pending',
                    remarks: cleanValue(row.remarks),

                    // Optional/unavailable fields in template
                    customer_alt_mobile: null,
                    customer_gps_latitude: null,
                    customer_gps_longitude: null,
                    test_name: null,
                    confirmed_time: null,
                    assigned_technician_id: null,
                    cost_type: null,
                    amount: null,
                    amount_upload: null,

                    created_by: req.user.id,
                };


                const { error, value } = appointmentBaseSchema.validate(cleanedRow, { stripUnknown: true });
                if (error) {
                    throw new Error(error.details[0].message);
                }

                // Business rule: if cost_type is Credit, amount should be null
                if (value.cost_type === 'Credit') {
                    value.amount = null;
                }

                const id = await service.createAppointment(value);
                insertedIds.push(id);
            } catch (error) {
                console.error(`Error processing row ${index + 8}:`, error.message);
                failedRows.push({
                    rowNumber: index + 8, // Adjusted row number calculation
                    row,
                    error: error.message
                });
            }
        }

        // Clean up uploaded file
        if (req.file?.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }

        res.status(201).json({
            message: `${insertedIds.length} appointments inserted`,
            insertedIds,
            failedRows,
        });

    } catch (e) {
        console.error('Excel upload error:', e);
        if (req.file?.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        res.status(500).json({ message: 'Failed to process Excel file: ' + e.message });
    }
});





// get test names related

router.get('/appointments/tests/:clientId/:insurerId', verifyToken, async (req, res) => {
    const clientId = parseInt(req.params.clientId);
    const insurerId = parseInt(req.params.insurerId);

    if (isNaN(clientId) || isNaN(insurerId)) {
        return res.status(400).json({ message: 'Invalid client ID or insurer ID' });
    }

    try {
        const testRates = await service.getTestsAndCategoriesByClientAndInsurer(clientId, insurerId);
        res.json({ data: testRates });
    } catch (err) {
        console.error('Error fetching test rates:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.get('/appointments/:id/with-tests', verifyToken, async (req, res) => {
    try {
        const row = await service.getAppointmentWithTests(req.params.id);
        if (!row) return res.status(404).json({ message: 'Not found' });
        res.json(row);
    } catch (e) {
        res.status(500).json({ message: 'Internal server error' });
    }
});






module.exports = router;
