const db = require('../lib/dbconnection');
const { generateCustomCode } = require('../lib/generateCode');


function safe(value) {
    return value === undefined || value === null || value === '' ? null : value;
}


async function createAppointment(row) {
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        // Generate case number if not provided
        if (!row.case_number) {
            row.case_number = await generateCustomCode({ 
                prefix: 'CASE', 
                table: 'appointments', 
                column: 'case_number' 
            });
        }

        const appointmentSql = `
            INSERT INTO appointments (
                case_number, application_number, client_id, center_id, insurer_id,
                customer_first_name, customer_last_name, gender, customer_mobile, customer_alt_mobile,
                customer_email, customer_address, state, city, pincode, country,
                customer_gps_latitude, customer_gps_longitude, customer_landmark,
                visit_type, customer_category, appointment_date, appointment_time, confirmed_time,
                status, assigned_technician_id, assigned_at, assigned_by,
                customer_arrived_at, medical_started_at, medical_completed_at,
                remarks, cancellation_reason, created_by,
                cost_type, amount, amount_upload, case_severity,
                created_at, updated_at, other_center_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)
        `;

        const appointmentParams = [
            safe(row.case_number),
            safe(row.application_number),
            safe(row.client_id),
            safe(row.center_id),
            safe(row.insurer_id),
            safe(row.customer_first_name),
            safe(row.customer_last_name),
            safe(row.gender),
            safe(row.customer_mobile),
            safe(row.customer_alt_mobile),
            safe(row.customer_email),
            safe(row.customer_address),
            safe(row.state),
            safe(row.city),
            safe(row.pincode),
            safe(row.country),
            safe(row.customer_gps_latitude),
            safe(row.customer_gps_longitude),
            safe(row.customer_landmark),
            safe(row.visit_type),
            safe(row.customer_category),
            safe(row.appointment_date),
            safe(row.appointment_time),
            safe(row.confirmed_time),
            safe(row.status),
            safe(row.assigned_technician_id),
            safe(row.assigned_at),
            safe(row.assigned_by),
            safe(row.customer_arrived_at),
            safe(row.medical_started_at),
            safe(row.medical_completed_at),
            safe(row.remarks),
            safe(row.cancellation_reason),
            safe(row.created_by),
            safe(row.cost_type),
            safe(row.amount),
            safe(row.amount_upload),
            safe(row.case_severity ?? 0),
            safe(row.other_center_id)
        ];

        const [appointmentResult] = await connection.query(appointmentSql, appointmentParams);
        const appointmentId = appointmentResult.insertId;
        console.log('Inserted appointment ID:', appointmentId); // NEW: Log the insertId
        if (!appointmentId || typeof appointmentId !== 'number') {
            throw new Error('Failed to retrieve valid appointment ID');
        }

        // Insert selected tests/categories into appointment_tests table
        if (row.selected_items && Array.isArray(row.selected_items) && row.selected_items.length > 0) {
            const testSql = `
                INSERT INTO appointment_tests (
                    appointment_id, test_id, category_id, rate_type, 
                    item_name, rate, is_completed, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, 0, NOW())
            `;

            for (const item of row.selected_items) {
                const testParams = [
                    appointmentId, // Ensure this is the valid ID
                    item.type === 'test' ? item.id : null,
                    item.type === 'category' ? item.id : null,
                    item.type,
                    item.name,
                    item.rate
                ];
                console.log('Inserting testParams:', testParams); // NEW: Log testParams
                await connection.query(testSql, testParams);
            }
        }

        await connection.commit();
        return appointmentId;
    } catch (error) {
        await connection.rollback();
        console.error('createAppointment transaction error:', error); // Enhanced logging
        throw error;
    } finally {
        connection.release();
    }
}



async function listAppointments({ page = 1, limit = 0, search = '', sortBy = 'id', sortOrder = 'DESC' }) {
    const searchColumns = ['case_number', 'application_number', 'customer_first_name', 'customer_last_name'];
    const searchParams = [];
    let whereClause = '';

    if (search && search.trim() !== '') {
        const conditions = searchColumns.map(col => `${col} LIKE ?`).join(' OR ');
        whereClause = ` WHERE (${conditions})`; // Added parentheses for proper grouping
        searchColumns.forEach(() => searchParams.push(`%${search}%`));
    }

    // Validate sortBy to prevent SQL injection
    const allowedSortColumns = [
        'id',
        'case_number',
        'application_number',
        'customer_first_name',
        'customer_last_name',
        'customer_mobile',
        'appointment_date',
        'visit_type',
        'status',
        'created_at'
    ];
    const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'id';
    const validSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count total records
    const countSql = `SELECT COUNT(*) as total FROM appointments${whereClause ? whereClause + ' AND' : ' WHERE'} is_deleted = 0`;
    const countRows = await db.query(countSql, searchParams);
    const total = countRows[0].total;

    // Paginated records with sorting
    let dataSql = `SELECT * FROM appointments${whereClause ? whereClause + ' AND' : ' WHERE'} is_deleted = 0 ORDER BY ${validSortBy} ${validSortOrder}`;
    const dataParams = [...searchParams];

    const numericLimit = Number(limit);
    const numericPage = Number(page);

    if (!isNaN(numericLimit) && numericLimit > 0) {
        const offset = (numericPage - 1) * numericLimit;
        dataSql += ` LIMIT ${numericLimit} OFFSET ${offset}`;
    }

    const rows = await db.query(dataSql, dataParams);

    return {
        data: rows,
        pagination: {
            total,
            page: numericPage,
            limit: numericLimit,
            pages: numericLimit > 0 ? Math.ceil(total / numericLimit) : 1,
        },
    };
}



async function getAppointment(id) { const r = await db.query('SELECT * FROM appointments WHERE id = ?', [id]); return r[0]; }

// async function updateAppointment(id, updates) {
//     const fields = []; const values = [];
//     Object.entries(updates).forEach(([k, v]) => { if (v !== undefined) { fields.push(`${k} = ?`); values.push(v); } });
//     if (!fields.length) return 0;
//     const sql = `UPDATE appointments SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
//     values.push(id);
//     const result = await db.query(sql, values); return result.affectedRows;
// }

async function updateAppointment(id, row) {
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        const appointmentSql = `
            UPDATE appointments
            SET
                case_number = ?,
                application_number = ?,
                client_id = ?,
                center_id = ?,
                insurer_id = ?,
                customer_first_name = ?,
                customer_last_name = ?,
                gender = ?,
                customer_mobile = ?,
                customer_alt_mobile = ?,
                customer_email = ?,
                customer_address = ?,
                state = ?,
                city = ?,
                pincode = ?,
                country = ?,
                customer_gps_latitude = ?,
                customer_gps_longitude = ?,
                customer_landmark = ?,
                visit_type = ?,
                customer_category = ?,
                appointment_date = ?,
                appointment_time = ?,
                confirmed_time = ?,
                status = ?,
                assigned_technician_id = ?,
                assigned_at = ?,
                assigned_by = ?,
                customer_arrived_at = ?,
                medical_started_at = ?,
                medical_completed_at = ?,
                remarks = ?,
                cancellation_reason = ?,
                created_by = ?,
                cost_type = ?,
                amount = ?,
                amount_upload = ?,
                case_severity = ?,
                other_center_id = ?,
                updated_at = NOW()
            WHERE id = ?
        `;

        const appointmentParams = [
            safe(row.case_number),
            safe(row.application_number),
            safe(row.client_id),
            safe(row.center_id),
            safe(row.insurer_id),
            safe(row.customer_first_name),
            safe(row.customer_last_name),
            safe(row.gender),
            safe(row.customer_mobile),
            safe(row.customer_alt_mobile),
            safe(row.customer_email),
            safe(row.customer_address),
            safe(row.state),
            safe(row.city),
            safe(row.pincode),
            safe(row.country),
            safe(row.customer_gps_latitude),
            safe(row.customer_gps_longitude),
            safe(row.customer_landmark),
            safe(row.visit_type),
            safe(row.customer_category),
            safe(row.appointment_date),
            safe(row.appointment_time),
            safe(row.confirmed_time),
            safe(row.status),
            safe(row.assigned_technician_id),
            safe(row.assigned_at),
            safe(row.assigned_by),
            safe(row.customer_arrived_at),
            safe(row.medical_started_at),
            safe(row.medical_completed_at),
            safe(row.remarks),
            safe(row.cancellation_reason),
            safe(row.created_by),
            safe(row.cost_type),
            safe(row.amount),
            safe(row.amount_upload),
            safe(row.case_severity ?? 0),
            safe(row.other_center_id),
            id,
        ];

        const [appointmentResult] = await connection.query(appointmentSql, appointmentParams);
        if (appointmentResult.affectedRows === 0) {
            throw new Error('Appointment not found or no changes made');
        }

        // Delete existing appointment_tests records
        await connection.query('DELETE FROM appointment_tests WHERE appointment_id = ?', [id]);

        // Insert updated selected_items
        if (row.selected_items && Array.isArray(row.selected_items) && row.selected_items.length > 0) {
            const testSql = `
                INSERT INTO appointment_tests (
                    appointment_id, test_id, category_id, rate_type, 
                    item_name, rate, is_completed, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, 0, NOW())
            `;

            for (const item of row.selected_items) {
                if (!item.id || !item.type || !['test', 'category'].includes(item.type)) {
                    throw new Error(`Invalid item in selected_items: ${JSON.stringify(item)}`);
                }
                const testParams = [
                    id,
                    item.type === 'test' ? item.id : null,
                    item.type === 'category' ? item.id : null,
                    item.type,
                    item.name,
                    typeof item.rate === 'string' ? parseFloat(item.rate) : item.rate, // Ensure number
                ];
                console.log('Updating testParams:', testParams);
                await connection.query(testSql, testParams);
            }
        }

        await connection.commit();
        return id;
    } catch (error) {
        await connection.rollback();
        console.error('updateAppointment transaction error:', error);
        throw error;
    } finally {
        connection.release();
    }
}


// soft delete appointments
async function softDeleteAppointments(ids) {
  if (!ids.length) return 0;

  const placeholders = ids.map(() => '?').join(', ');
  const sql = `UPDATE appointments SET is_deleted = 1, updated_at = NOW() WHERE id IN (${placeholders})`;

  const result = await db.query(sql, ids);

  return result.affectedRows;
}

async function deleteAppointment(id) { const result = await db.query('DELETE FROM appointments WHERE id = ?', [id]); return result.affectedRows; }




// get specific appointment by diagnostic center

async function listAppointmentsbyDiagnosticCenters({ page = 1, limit = 0, search = '', centerId }) {
    const searchColumns = ['case_number', 'application_number', 'customer_first_name','customer_last_name'];
    const searchParams = [];
    const conditions = [];
    let whereClause = '';


    // Add search condition
    if (search && search.trim() !== '') {
        const searchCondition = searchColumns.map(col => `${col} LIKE ?`).join(' OR ');
        conditions.push(`(${searchCondition})`);
        searchColumns.forEach(() => searchParams.push(`%${search}%`));

    }

    // Add center ID filter
    if (centerId !== undefined && centerId !== null && !isNaN(centerId)) {
        conditions.push(`center_id = ?`);
        searchParams.push(centerId);

    } else {
        console.log('  centerId is invalid or missing — no center_id filter will be applied!');
    }

    // Always exclude deleted records
    conditions.push(`is_deleted = 0`);

    // Combine all into a WHERE clause
    if (conditions.length > 0) {
        whereClause = `WHERE ${conditions.join(' AND ')}`;
    }

    // Count total records
    const countSql = `SELECT COUNT(*) as total FROM appointments ${whereClause}`;

    const countRows = await db.query(countSql, searchParams);
    const total = countRows[0]?.total || 0;

    // Paginated records
    let dataSql = `SELECT * FROM appointments ${whereClause} ORDER BY id DESC`;
    const dataParams = [...searchParams];

    const numericLimit = Number(limit);
    const numericPage = Number(page);

    if (!isNaN(numericLimit) && numericLimit > 0) {
        const offset = (numericPage - 1) * numericLimit;
        dataSql += ` LIMIT ${numericLimit} OFFSET ${offset}`;
    }

    const rows = await db.query(dataSql, dataParams);

    return {
        data: rows,
        pagination: {
            total,
            page: numericPage,
            limit: numericLimit,
            pages: numericLimit > 0 ? Math.ceil(total / numericLimit) : 1,
        },
    };
}



//technician 

async function listAppointmentsbyTechnician({ page = 1, limit = 0, search = '', technicianId }) {
    const searchColumns = ['case_number', 'application_number', 'customer_name'];
    const searchParams = [];
    const conditions = [];
    let whereClause = '';

    // Add search condition
    if (search && search.trim() !== '') {
        const searchCondition = searchColumns.map(col => `${col} LIKE ?`).join(' OR ');
        conditions.push(`(${searchCondition})`);
        searchColumns.forEach(() => searchParams.push(`%${search}%`));
    }

    // Add assigned_technician_id ID filter
    if (technicianId) {
        conditions.push(`assigned_technician_id = ?`);
        searchParams.push(technicianId);
    }

    // Always exclude deleted records
    conditions.push(`is_deleted = 0`);

    // Combine all into a WHERE clause
    if (conditions.length > 0) {
        whereClause = `WHERE ${conditions.join(' AND ')}`;
    }

    // Count total records
    const countSql = `SELECT COUNT(*) as total FROM appointments ${whereClause}`;
    const countRows = await db.query(countSql, searchParams);
    const total = countRows[0]?.total || 0;

    // Paginated records
    let dataSql = `SELECT * FROM appointments ${whereClause} ORDER BY id DESC`;
    const dataParams = [...searchParams];

    const numericLimit = Number(limit);
    const numericPage = Number(page);

    if (!isNaN(numericLimit) && numericLimit > 0) {
        const offset = (numericPage - 1) * numericLimit;
        dataSql += ` LIMIT ${numericLimit} OFFSET ${offset}`;
    }

    const rows = await db.query(dataSql, dataParams);

    return {
        data: rows,
        pagination: {
            total,
            page: numericPage,
            limit: numericLimit,
            pages: numericLimit > 0 ? Math.ceil(total / numericLimit) : 1,
        },
    };
}


// UPDATE BY TECHNICNA OR DIAGNOSTIC IDS
async function UpdateAppointmentsTechnicianDiagnosticCenters(ids, updates) {
  const fields = [];
  const values = [];

  if (updates.center_id !== undefined) {
    fields.push('center_id = ?');
    values.push(updates.center_id);
  }

  if (updates.assigned_technician_id !== undefined) {
    fields.push('assigned_technician_id = ?');
    values.push(updates.assigned_technician_id);
  }

  if (!fields.length) return 0;

  const placeholders = ids.map(() => '?').join(', ');
  const sql = `
    UPDATE appointments
    SET ${fields.join(', ')}, updated_at = NOW()
    WHERE id IN (${placeholders}) AND is_deleted = 0
  `;

  values.push(...ids);

  const result = await db.query(sql, values);
  return result.affectedRows;
}



// related test names
async function getTestsByClientAndInsurer(clientId, insurerId) {
    const query = `
        SELECT 
            t.id AS test_id,
            t.test_name,
            tr.rate
        FROM test_rates tr
        JOIN tests t ON tr.test_id = t.id
        WHERE 
            tr.client_id = ?
            AND tr.insurer_id = ?
            AND tr.is_deleted = 0
            AND tr.is_active = 1
            AND t.is_deleted = 0
            AND t.is_active = 1
        ORDER BY t.test_name ASC
    `;

    const results = await db.query(query, [clientId, insurerId]);
    return results; // [{ test_id, test_name, rate }]
}




// Get tests and categories by client and insurer
async function getTestsAndCategoriesByClientAndInsurer(clientId, insurerId) {
    const query = `
        SELECT 
            tr.rate_type,
            COALESCE(tr.test_id, tr.category_id) as item_id,
            CASE 
                WHEN tr.rate_type = 'test' THEN t.test_name
                WHEN tr.rate_type = 'category' THEN tc.category_name
            END as item_name,
            tr.rate,
            tr.rate_type,
            CASE 
                WHEN tr.rate_type = 'test' THEN 'test'
                WHEN tr.rate_type = 'category' THEN 'category'
            END as type
        FROM test_rates tr
        LEFT JOIN tests t ON tr.test_id = t.id AND tr.rate_type = 'test'
        LEFT JOIN test_categories tc ON tr.category_id = tc.id AND tr.rate_type = 'category'
        WHERE 
            tr.client_id = ?
            AND tr.insurer_id = ?
            AND tr.is_deleted = 0
            AND tr.is_active = 1
            AND (t.is_deleted = 0 OR tc.is_deleted = 0)
            AND (t.is_active = 1 OR tc.is_active = 1)
        ORDER BY item_name ASC
    `;

    const results = await db.query(query, [clientId, insurerId]);
    return results;
}

// Get appointment with tests
async function getAppointmentWithTests(id) {
    // Get appointment basic info
    const appointmentSql = 'SELECT * FROM appointments WHERE id = ?';
    const appointmentRows = await db.query(appointmentSql, [id]);
    
    if (!appointmentRows[0]) return null;

    const appointment = appointmentRows[0];

    // Get associated tests/categories
    const testsSql = `
        SELECT 
            at.*,
            CASE 
                WHEN at.rate_type = 'test' THEN t.test_name
                WHEN at.rate_type = 'category' THEN tc.category_name
            END as item_name
        FROM appointment_tests at
        LEFT JOIN tests t ON at.test_id = t.id AND at.rate_type = 'test'
        LEFT JOIN test_categories tc ON at.category_id = tc.id AND at.rate_type = 'category'
        WHERE at.appointment_id = ?
    `;
    
    const testRows = await db.query(testsSql, [id]);
    
    // Transform the data to match frontend expectations
    appointment.selected_items = testRows.map(row => ({
        id: row.rate_type === 'test' ? row.test_id : row.category_id,
        name: row.item_name,
        type: row.rate_type,
        rate: row.rate
    }));

    return appointment;
}


module.exports = { 
    createAppointment, listAppointments, getAppointment,
    updateAppointment, deleteAppointment ,softDeleteAppointments , 
    listAppointmentsbyDiagnosticCenters ,listAppointmentsbyTechnician , 
    UpdateAppointmentsTechnicianDiagnosticCenters ,getTestsByClientAndInsurer,
getTestsAndCategoriesByClientAndInsurer,getAppointmentWithTests 
 };


