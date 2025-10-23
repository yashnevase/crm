const db = require('../lib/dbconnection');
const { generateCustomCode } = require('../lib/generateCode');

async function createInsurer(row) {

    if (!row.insurer_code) {
        row.insurer_code = await generateCustomCode({ prefix: 'INS', table: 'insurers', column: 'insurer_code' });
    }


    const sql = `INSERT INTO insurers (insurer_code, insurer_name, insurer_type, contact_number, email, is_active, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const params = [row.insurer_code, row.insurer_name, row.insurer_type || 'Life', row.contact_number || null, row.email || null, row.is_active ?? 1];
    const result = await db.query(sql, params);
    return result.insertId;
}

// async function listInsurers() {
//     return db.query('SELECT * FROM insurers');
// }

async function listInsurers({ page = 1, limit = 0, search = '', sortBy = 'id', sortOrder = 'DESC' }) {
    const searchColumns = ['insurer_code', 'insurer_name', 'contact_number', 'email'];
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
        'insurer_code',
        'insurer_name',
        'insurer_type',
        'contact_number',
        'email',
        'is_active',
        'created_at'
    ];
    const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'id';
    const validSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count total records
    const countSql = `SELECT COUNT(*) as total FROM insurers${whereClause}`;
    const countRows = await db.query(countSql, searchParams);
    const total = countRows[0].total;

    // Paginated records
    let dataSql = `SELECT * FROM insurers${whereClause} ORDER BY ${validSortBy} ${validSortOrder}`;
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




async function getInsurer(id) {
    const rows = await db.query('SELECT * FROM insurers WHERE id = ?', [id]);
    return rows[0];
}

async function updateInsurer(id, updates) {
    const fields = [];
    const values = [];
    Object.entries(updates).forEach(([k, v]) => {
        if (v !== undefined) { fields.push(`${k} = ?`); values.push(v); }
    });
    if (!fields.length) return 0;
    const sql = `UPDATE insurers SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    values.push(id);
    const result = await db.query(sql, values);
    return result.affectedRows;
}


// soft delete insurers
async function softDeleteInsurer(ids) {
    if (!ids.length) return 0;

    const placeholders = ids.map(() => '?').join(', ');
    const sql = `UPDATE insurers SET is_deleted = 1, updated_at = NOW() WHERE id IN (${placeholders})`;

    const result = await db.query(sql, ids);

    return result.affectedRows;
}


async function deleteInsurer(id) {
    const result = await db.query('DELETE FROM insurers WHERE id = ?', [id]);
    return result.affectedRows;
}

module.exports = { createInsurer, listInsurers, getInsurer, updateInsurer, deleteInsurer, softDeleteInsurer };


