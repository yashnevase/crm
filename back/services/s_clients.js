const db = require('../lib/dbconnection');
const { generateCustomCode } = require('../lib/generateCode');



async function createClient(client) {
    // Generate client code if not provided
    if (!client.client_code) {
        client.client_code = await generateCustomCode({
            prefix: 'TPA',
            table: 'clients',
            column: 'client_code'
        });
    }

    const sql = `
        INSERT INTO clients (
            client_code, client_name, client_type, registered_address,
            gst_number, pan_number, mode_of_payment, payment_frequency,
            is_active, created_by, created_at, updated_at,
            validity_period_start, validity_period_end,
            email_id, email_id_2, email_id_3,
            contact_person_name, contact_person_no, contact_person_address,
            onboarding_date, agreement_id, invoice_format_upload,
            mou, IRDAI_no, state, city, pincode, country
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        client.client_code,
        client.client_name,
        client.client_type,
        client.registered_address,
        client.gst_number || null,
        client.pan_number || null,
        client.mode_of_payment || 'Billed_Later',
        client.payment_frequency || null,
        client.is_active ?? 1,
        client.created_by || null,
        client.validity_period_start || null,
        client.validity_period_end || null,
        client.email_id || null,
        client.email_id_2 || null,
        client.email_id_3 || null,
        client.contact_person_name || null,
        client.contact_person_no || null,
        client.contact_person_address || null,
        client.onboarding_date || null,
        client.agreement_id || null,
        client.invoice_format_upload || null,
        client.mou || null,
        client.IRDAI_no || null,
        client.state || null,
        client.city || null,
        client.pincode || null,
        client.country || null,
    ];

    const result = await db.query(sql, params);
    const clientId = result.insertId;

    // Handle insurer relationships
    if (client.insurer_ids && Array.isArray(client.insurer_ids) && client.insurer_ids.length > 0) {
        const insurerValues = client.insurer_ids.map(insurerId => [clientId, insurerId]);

        const placeholders = insurerValues.map(() => '(?, ?)').join(', ');
        const flatValues = insurerValues.flat();

        await db.query(
            `INSERT INTO client_insurers (client_id, insurer_id) VALUES ${placeholders}`,
            flatValues
        );
    }


    return clientId;
}


async function listClients({ page = 1, limit = 0, search = '', sortBy = 'id', sortOrder = 'DESC' }) {
    const searchColumns = ['client_code', 'client_name', 'gst_number', 'pan_number', 'mode_of_payment'];
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
        'client_code',
        'client_name', 
        'client_type',
        'gst_number',
        'pan_number',
        'mode_of_payment',
        'payment_frequency',
        'is_active',
        'created_at'
    ];
    const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'id';
    const validSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM clients${whereClause}`;
    const countRows = await db.query(countSql, searchParams);
    const total = countRows[0].total;

    // Validate and sanitize pagination params
    const numericLimit = Number(limit);
    const numericPage = Number(page);
    let dataSql = `SELECT * FROM clients${whereClause} ORDER BY ${validSortBy} ${validSortOrder}`;
    const dataParams = [...searchParams];

    if (!isNaN(numericLimit) && numericLimit > 0) {
        const offset = (numericPage - 1) * numericLimit;
        dataSql += ` LIMIT ${numericLimit} OFFSET ${offset}`;
    }

    const rows = await db.query(dataSql, dataParams);

    // Loop through rows and attach insurer_ids
    for (const row of rows) {
        const insurerRows = await db.query(
            'SELECT insurer_id FROM client_insurers WHERE client_id = ?',
            [row.id]
        );
        row.insurer_ids = insurerRows.map(r => r.insurer_id);
    }

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





async function getClient(id) {
    // Get client basic info
    const clientRows = await db.query('SELECT * FROM clients WHERE id = ?', [id]);
    if (!clientRows[0]) return null;

    const client = clientRows[0];

    // Get associated insurer IDs
    const insurerRows = await db.query(
        'SELECT insurer_id FROM client_insurers WHERE client_id = ?',
        [id]
    );

    client.insurer_ids = insurerRows.map(row => row.insurer_id);

    return client;
}

async function updateClient(id, updates) {
    const { insurer_ids, ...clientUpdates } = updates;

    let affectedRows = 0;

    // Update main client record if there are fields to update
    if (Object.keys(clientUpdates).length > 0) {
        const fields = [];
        const values = [];

        Object.entries(clientUpdates).forEach(([key, value]) => {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        });

        const sql = `UPDATE clients SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
        values.push(id);
        const result = await db.query(sql, values);
        affectedRows = result.affectedRows;
    } else {
        affectedRows = 1; // No client fields to update, but operation is successful
    }

    // Handle insurer relationships
    if (insurer_ids !== undefined) {
        await db.query('DELETE FROM client_insurers WHERE client_id = ?', [id]);

        if (Array.isArray(insurer_ids) && insurer_ids.length > 0) {
             // Filter out any empty strings or invalid values
            const validInsurerIds = insurer_ids.filter(id => 
                id !== '' && id !== null && id !== undefined && !isNaN(Number(id))
            );
            if (validInsurerIds.length > 0) {
                const insurerValues = validInsurerIds.map(insurerId => [id, Number(insurerId)]);
                const placeholders = insurerValues.map(() => '(?, ?)').join(', ');
                const flatValues = insurerValues.flat();

                await db.query(
                    `INSERT INTO client_insurers (client_id, insurer_id) VALUES ${placeholders}`,
                    flatValues
                );
            }
            // const insurerValues = insurer_ids.map(insurerId => [id, insurerId]);
            // const placeholders = insurerValues.map(() => '(?, ?)').join(', ');
            // const flatValues = insurerValues.flat();

            // await db.query(
            //     `INSERT INTO client_insurers (client_id, insurer_id) VALUES ${placeholders}`,
            //     flatValues
            // );
        }
    }


    return affectedRows;
}


// soft delete clients
async function softDeleteClients(ids) {
    if (!ids.length) return 0;

    const placeholders = ids.map(() => '?').join(', ');
    const sql = `UPDATE clients SET is_deleted = 1, updated_at = NOW() WHERE id IN (${placeholders})`;

    const result = await db.query(sql, ids);

    return result.affectedRows;
}


async function deleteClient(id) {
    const result = await db.query('DELETE FROM clients WHERE id = ?', [id]);
    return result.affectedRows;
}

module.exports = { createClient, listClients, getClient, updateClient, deleteClient, softDeleteClients };


