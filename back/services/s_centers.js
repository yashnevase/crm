const db = require('../lib/dbconnection');
const { generateCustomCode } = require('../lib/generateCode');

// async function createCenter(center) {

//      // Generate center_code  if not provided
//     if (!client.center_code) {
//         client.center_code = await generateCustomCode({
//             prefix: 'DC',
//             table: 'center',
//             column: 'center_code'
//         });
//     }


//     const sql = `INSERT INTO diagnostic_centers (user_id,center_code, center_name, center_type, address, city, state, pincode, contact_number, email, gps_latitude, gps_longitude, letterhead_path, is_active, created_by, created_at, updated_at)
//                  VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
//     const params = [center.user_id,center.center_code, center.center_name, center.center_type, center.address, center.city || null, center.state || null, center.pincode || null, center.contact_number || null, center.email || null, center.gps_latitude || null, center.gps_longitude || null, center.letterhead_path || null, center.is_active ?? 1, center.created_by || null];
//     const result = await db.query(sql, params);
//     return result.insertId;
// }



function safe(value, fallback = null) {
    return value === undefined || value === '' ? fallback : value;
}




async function createCenter(center) {
    if (!center.center_code) {
        center.center_code = await generateCustomCode({
            prefix: 'DC',
            table: 'diagnostic_centers',
            column: 'center_code'
        });
    }

    const sql = `
    INSERT INTO diagnostic_centers 
    (user_id, center_code, center_name, center_type, address, owner_name, contact_number, email, city, city_type, state, pincode, country, dc_photos, gps_latitude, gps_longitude, letterhead_path, is_active, created_by, created_at, updated_at, is_deleted,
    associate_doctor_1_details, associate_doctor_2_details, associate_doctor_3_details, associate_doctor_4_details,
    acc_name, acc_no, ifsc_code, receivers_name, accredation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), 0, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        safe(center.user_id),
        safe(center.center_code),
        safe(center.center_name),
        safe(center.center_type),
        safe(center.address),
        safe(center.owner_name),
        safe(center.contact_number),
        safe(center.email),
        safe(center.city),
        safe(center.city_type),
        safe(center.state),
        safe(center.pincode),
        safe(center.country),
        safe(center.dc_photos),
        safe(center.gps_latitude),
        safe(center.gps_longitude),
        safe(center.letterhead_path),
        safe(center.is_active, 1), // default to 1 if undefined
        safe(center.created_by),
        safe(center.associate_doctor_1_details),
        safe(center.associate_doctor_2_details),
        safe(center.associate_doctor_3_details),
        safe(center.associate_doctor_4_details),
        safe(center.acc_name),
        safe(center.acc_no),
        safe(center.ifsc_code),
        safe(center.receivers_name),
        safe(center.accredation)
    ];


    const result = await db.query(sql, params);
    return result.insertId;
}






async function listCenters({ page = 1, limit = 0, search = '', sortBy = 'id', sortOrder = 'DESC' }) {
    const searchColumns = ['center_code', 'center_name', 'center_type', 'city', 'state'];
    const searchParams = [];
    let whereClause = '';

    if (search && search.trim() !== '') {
        const conditions = searchColumns.map(col => `${col} LIKE ?`).join(' OR ');
        whereClause = ` WHERE (${conditions}) AND is_deleted = 0`;
        searchColumns.forEach(() => searchParams.push(`%${search}%`));
    } else {
        whereClause = ' WHERE is_deleted = 0';
    }

    // Validate sortBy to prevent SQL injection
    const allowedSortColumns = [
        'id',
        'center_code', 
        'center_name',
        'center_type',
        'city',
        'state',
        'contact_number',
        'email',
        'is_active',
        'created_at'
    ];
    const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'id';
    const validSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count total records
    const countSql = `SELECT COUNT(*) as total FROM diagnostic_centers${whereClause}`;
    const countRows = await db.query(countSql, searchParams);
    const total = countRows[0].total;

    // Paginated records with sorting
    let dataSql = `SELECT * FROM diagnostic_centers${whereClause} ORDER BY ${validSortBy} ${validSortOrder}`;
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



async function getCenter(id) {
    const rows = await db.query('SELECT * FROM diagnostic_centers WHERE id = ?', [id]);
    return rows[0];
}

async function updateCenter(id, updates) {
    const fields = [];
    const values = [];
    Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
    });
    if (!fields.length) return 0;
    const sql = `UPDATE diagnostic_centers SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    values.push(id);
    const result = await db.query(sql, values);
    return result.affectedRows;
}


//softdelete centers
async function softDeleteCenters(ids) {
    if (!ids.length) return 0;

    const placeholders = ids.map(() => '?').join(', ');
    const sql = `UPDATE diagnostic_centers SET is_deleted = 1, updated_at = NOW() WHERE id IN (${placeholders})`;

    const result = await db.query(sql, ids);

    return result.affectedRows;
}



async function deleteCenter(id) {
    const result = await db.query('DELETE FROM diagnostic_centers WHERE id = ?', [id]);
    return result.affectedRows;
}

module.exports = { createCenter, listCenters, getCenter, updateCenter, deleteCenter, softDeleteCenters };


