// services/s_roles.js
const db = require('../lib/dbconnection');

async function createRole(role) {
    const sql = `INSERT INTO roles (role_name, description, created_at, updated_at)
                 VALUES (?, ?, NOW(), NOW())`;
    const params = [role.role_name, role.description || null];
    const result = await db.query(sql, params);
    return result.insertId;
}

async function listRoles({ page = 1, limit = 0, search = '' }) {
    let sql = 'SELECT * FROM roles';
    const params = [];

    if (search) {
        const columns = ['role_name', 'description']; 
        const conditions = columns.map(col => `${col} LIKE ?`).join(' OR ');
        sql += ` WHERE ${conditions}`;
        columns.forEach(() => params.push(`%${search}%`));
    }

    // Count total for pagination
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countRows = await db.query(countSql, params);
    const total = countRows[0].total;

    if (limit > 0) {
        const offset = (page - 1) * limit;
        sql += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);
    }

    const rows = await db.query(sql, params);
    return {
        data: rows,
        pagination: {
            total,
            page,
            limit,
            pages: limit > 0 ? Math.ceil(total / limit) : 1,
        },
    };
}

async function listRoles({ page = 1, limit = 0, search = '' }) {
    const searchColumns = ['role_name', 'description'];
    const searchParams = [];
    let whereClause = '';

    if (search) {
        const conditions = searchColumns.map(col => `${col} LIKE ?`).join(' OR ');
        whereClause = ` WHERE ${conditions}`;
        searchColumns.forEach(() => searchParams.push(`%${search}%`));
    }

    // Count total without pagination
    const countSql = `SELECT COUNT(*) as total FROM roles${whereClause}`;
    const countRows = await db.query(countSql, searchParams);
    const total = countRows[0].total;

    // Get data with pagination
    let dataSql = `SELECT * FROM roles${whereClause}`;
    const dataParams = [...searchParams];

    if (limit > 0) {
        const offset = (page - 1) * limit;
        dataSql += ' LIMIT ? OFFSET ?';
        dataParams.push(limit, offset);
    }

    const rows = await db.query(dataSql, dataParams);

    return {
        data: rows,
        pagination: {
            total,
            page,
            limit,
            pages: limit > 0 ? Math.ceil(total / limit) : 1,
        },
    };
}


async function getRole(id) {
    const rows = await db.query('SELECT * FROM roles WHERE id = ?', [id]);
    return rows[0];
}

async function updateRole(id, updates) {
    const fields = [];
    const values = [];
    Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
    });
    if (fields.length === 0) return 0;
    const sql = `UPDATE roles SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    values.push(id);
    const result = await db.query(sql, values);
    return result.affectedRows;
}

async function deleteRole(id) {
    const result = await db.query('DELETE FROM roles WHERE id = ?', [id]);
    return result.affectedRows;
}

module.exports = { createRole, listRoles, getRole, updateRole, deleteRole };
