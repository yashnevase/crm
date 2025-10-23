const db = require('../lib/dbconnection');

async function createReportType(row) {
    const sql = `INSERT INTO report_types (type_code, type_name, description, is_mandatory, display_order, is_active)
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [row.type_code, row.type_name, row.description || null, row.is_mandatory ? 1 : 0, row.display_order || 0, row.is_active ?? 1];
    const result = await db.query(sql, params); return result.insertId;
}
async function listReportTypes() { return db.query('SELECT * FROM report_types'); }
async function getReportType(id) { const r = await db.query('SELECT * FROM report_types WHERE id = ?', [id]); return r[0]; }
async function updateReportType(id, updates) {
    const fields = []; const values = [];
    Object.entries(updates).forEach(([k, v]) => { if (v !== undefined) { fields.push(`${k} = ?`); values.push(v); } });
    if (!fields.length) return 0; const sql = `UPDATE report_types SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id); const result = await db.query(sql, values); return result.affectedRows;
}
async function deleteReportType(id) { const result = await db.query('DELETE FROM report_types WHERE id = ?', [id]); return result.affectedRows; }

module.exports = { createReportType, listReportTypes, getReportType, updateReportType, deleteReportType };


