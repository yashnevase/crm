const db = require('../lib/dbconnection');

// Create a new test
async function createTest(row) {
    const sql = `
        INSERT INTO tests (test_name, description, is_active, created_at, updated_at)
        VALUES (?, ?, ?, NOW(), NOW())
    `;
    const params = [
        row.test_name,
        row.description || null,
        row.is_active ?? 1,
    ];
    const result = await db.query(sql, params);
    return result.insertId;
}

// List tests with pagination + search
async function listTests({ page = 1, limit = 0, search = '', sortBy = 'id', sortOrder = 'DESC' }) {
    const searchColumns = ['test_name', 'description'];
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
        'test_name',
        'description',
        'is_active',
        'created_at'
    ];
    const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'id';
    const validSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count total
    const countSql = `SELECT COUNT(*) as total FROM tests${whereClause}`;
    const countRows = await db.query(countSql, searchParams);
    const total = countRows[0].total;

    // Paginated data with sorting
    let dataSql = `SELECT * FROM tests${whereClause} ORDER BY ${validSortBy} ${validSortOrder}`;
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

// Get a single test by ID
async function getTest(id) {
    const rows = await db.query('SELECT * FROM tests WHERE id = ?', [id]);
    return rows[0];
}

// Update test
async function updateTest(id, updates) {
    const fields = [];
    const values = [];

    Object.entries(updates).forEach(([k, v]) => {
        if (v !== undefined) {
            fields.push(`${k} = ?`);
            values.push(v);
        }
    });

    if (!fields.length) return 0;

    const sql = `UPDATE tests SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    values.push(id);

    const result = await db.query(sql, values);
    return result.affectedRows;
}

// Soft delete tests
async function softDeleteTest(ids) {
    if (!ids.length) return 0;

    const placeholders = ids.map(() => '?').join(', ');
    const sql = `UPDATE tests SET is_deleted = 1, updated_at = NOW() WHERE id IN (${placeholders})`;

    const result = await db.query(sql, ids);
    return result.affectedRows;
}

// Hard delete test
async function deleteTest(id) {
    const result = await db.query('DELETE FROM tests WHERE id = ?', [id]);
    return result.affectedRows;
}

module.exports = {
    createTest,
    listTests,
    getTest,
    updateTest,
    deleteTest,
    softDeleteTest,
};
