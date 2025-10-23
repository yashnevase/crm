const db = require('../lib/dbconnection');



function safe(value, fallback = null) {
    return value === undefined || value === '' ? fallback : value;
}



// Create a new test rate (supports both test and category)
async function createTestRate(row) {
    const sql = `
        INSERT INTO test_rates (
            client_id, center_id, insurer_id, test_id, category_id,
            rate_type, rate,
            is_active, created_by, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const params = [
        safe(row.client_id),
        safe(row.center_id),
        safe(row.insurer_id || null),
        safe(row.test_id),
        safe(row.category_id),
        safe(row.rate_type || 'test'),
        safe(row.rate),
        safe(row.is_active ?? 1),
        safe(row.created_by || null),
    ];
    const result = await db.query(sql, params);
    return result.insertId;
}

// List test rates with pagination and search (supports both test and category)
async function listTestRates({ page = 1, limit = 0, search = '' }) {
    const searchColumns = ['rate', 'clients.client_name', 'tests.test_name', 'test_categories.category_name'];
    const searchParams = [];
    let whereClause = '';

    if (search && search.trim() !== '') {
        const conditions = searchColumns.map(col => `${col} LIKE ?`).join(' OR ');
        whereClause = ` WHERE (${conditions})`;
        searchColumns.forEach(() => searchParams.push(`%${search}%`));
    }

    // Count total
    const countSql = `
        SELECT COUNT(*) as total
        FROM test_rates
        LEFT JOIN tests ON test_rates.test_id = tests.id
        LEFT JOIN test_categories ON test_rates.category_id = test_categories.id
        JOIN clients ON test_rates.client_id = clients.id
        ${whereClause ? whereClause + ' AND' : ' WHERE'} test_rates.is_deleted = 0
    `;
    const countRows = await db.query(countSql, searchParams);
    const total = countRows[0].total;

    // Paginated data with proper joins for both test and category
    let dataSql = `
        SELECT 
            test_rates.*, 
            clients.client_name,
            tests.test_name,
            test_categories.category_name,
            CASE 
                WHEN test_rates.rate_type = 'test' THEN tests.test_name
                WHEN test_rates.rate_type = 'category' THEN test_categories.category_name
                ELSE 'Unknown'
            END as item_name,
            test_rates.rate_type
        FROM test_rates
        JOIN clients ON test_rates.client_id = clients.id
        LEFT JOIN tests ON test_rates.test_id = tests.id AND test_rates.rate_type = 'test'
        LEFT JOIN test_categories ON test_rates.category_id = test_categories.id AND test_rates.rate_type = 'category'
        ${whereClause ? whereClause + ' AND' : ' WHERE'} test_rates.is_deleted = 0
        ORDER BY test_rates.id DESC
    `;

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

// Get test rate by ID
async function getTestRate(id) {
    const sql = `
        SELECT 
            test_rates.*, 
            clients.client_name,
            tests.test_name,
            test_categories.category_name,
            CASE 
                WHEN test_rates.rate_type = 'test' THEN tests.test_name
                WHEN test_rates.rate_type = 'category' THEN test_categories.category_name
                ELSE 'Unknown'
            END as item_name
        FROM test_rates
        JOIN clients ON test_rates.client_id = clients.id
        LEFT JOIN tests ON test_rates.test_id = tests.id AND test_rates.rate_type = 'test'
        LEFT JOIN test_categories ON test_rates.category_id = test_categories.id AND test_rates.rate_type = 'category'
        WHERE test_rates.id = ?
    `;
    const rows = await db.query(sql, [id]);
    return rows[0];
}

// Update test rate
async function updateTestRate(id, updates) {
    const fields = [];
    const values = [];

    Object.entries(updates).forEach(([k, v]) => {
        if (v !== undefined) {
            fields.push(`${k} = ?`);
            values.push(v);
        }
    });

    if (!fields.length) return 0;

    const sql = `UPDATE test_rates SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    values.push(id);

    const result = await db.query(sql, values);
    return result.affectedRows;
}

// Get client test rates (supports both test and category)
async function getClientTestRates(clientId) {
    // Step 1: Get all insurer_ids linked to the client
    const insurerRows = await db.query(`
        SELECT ci.insurer_id, i.insurer_name, i.insurer_code, i.insurer_type
        FROM client_insurers ci
        JOIN insurers i ON ci.insurer_id = i.id AND i.is_deleted = 0
        WHERE ci.client_id = ?`, [clientId]);

    if (insurerRows.length === 0) {
        return { message: 'No insurers found for this client', data: [] };
    }

    // Step 2: Get test rates for these insurers (both test and category rates)
    const insurerIds = insurerRows.map(row => row.insurer_id);
    const placeholders = insurerIds.map(() => '?').join(', ');
    const params = [clientId, ...insurerIds];

    const rateRows = await db.query(`
        SELECT 
            tr.id AS rate_id,
            tr.rate,
            tr.rate_type,
            tr.is_active AS rate_active,
            tr.insurer_id,
            tr.test_id,
            tr.category_id,
            t.test_name,
            tc.category_name,
            c.client_name,
            CASE 
                WHEN tr.rate_type = 'test' THEN t.test_name
                WHEN tr.rate_type = 'category' THEN tc.category_name
                ELSE 'Unknown'
            END as item_name
        FROM test_rates tr
        LEFT JOIN tests t ON tr.test_id = t.id AND tr.rate_type = 'test'
        LEFT JOIN test_categories tc ON tr.category_id = tc.id AND tr.rate_type = 'category'
        JOIN clients c ON tr.client_id = c.id AND c.is_deleted = 0
        WHERE tr.client_id = ?
        AND tr.insurer_id IN (${placeholders})
        AND tr.is_deleted = 0
        ORDER BY item_name ASC
    `, params);

    // Step 3: Organize results: group rates under each insurer
    const insurerMap = insurerRows.reduce((acc, row) => {
        acc[row.insurer_id] = {
            insurer_id: row.insurer_id,
            insurer_name: row.insurer_name,
            insurer_code: row.insurer_code,
            insurer_type: row.insurer_type,
            test_rates: []
        };
        return acc;
    }, {});

    rateRows.forEach(rate => {
        if (insurerMap[rate.insurer_id]) {
            insurerMap[rate.insurer_id].test_rates.push({
                rate_id: rate.rate_id,
                rate: rate.rate,
                rate_type: rate.rate_type,
                rate_active: rate.rate_active,
                test_id: rate.test_id,
                category_id: rate.category_id,
                test_name: rate.test_name,
                category_name: rate.category_name,
                item_name: rate.item_name,
                client_name: rate.client_name
            });
        }
    });

    // Convert map to array
    const finalResult = Object.values(insurerMap);

    return { data: finalResult };
}

// Get available tests and categories for a client (for bulk assignment)
async function getAvailableItems(clientId) {
    // Get all tests
    const tests = await db.query(`
        SELECT id, test_name as name, 'test' as type
        FROM tests 
        WHERE is_active = 1 AND is_deleted = 0
        ORDER BY test_name
    `);

    // Get all categories
    const categories = await db.query(`
        SELECT id, category_name as name, 'category' as type
        FROM test_categories 
        WHERE is_active = 1
        ORDER BY category_name
    `);

    // Get existing rates to filter out already assigned items
    const existingRates = await db.query(`
        SELECT 
            CASE 
                WHEN rate_type = 'test' THEN test_id 
                WHEN rate_type = 'category' THEN category_id 
            END as item_id,
            rate_type
        FROM test_rates 
        WHERE client_id = ? AND is_deleted = 0
    `, [clientId]);

    const existingItems = new Set();
    existingRates.forEach(rate => {
        existingItems.add(`${rate.rate_type}_${rate.item_id}`);
    });

    // Filter out existing items
    const availableTests = tests.filter(test => !existingItems.has(`test_${test.id}`));
    const availableCategories = categories.filter(cat => !existingItems.has(`category_${cat.id}`));

    return {
        tests: availableTests,
        categories: availableCategories
    };
}

// Soft delete test rates
async function softDeleteTestRate(ids) {
    if (!ids.length) return 0;

    const placeholders = ids.map(() => '?').join(', ');
    const sql = `UPDATE test_rates SET is_deleted = 1, updated_at = NOW() WHERE id IN (${placeholders})`;

    const result = await db.query(sql, ids);
    return result.affectedRows;
}

// Hard delete test rate
async function deleteTestRate(id) {
    const result = await db.query('DELETE FROM test_rates WHERE id = ?', [id]);
    return result.affectedRows;
}


// Get combined tests and categories for selection
async function getAvailableItemsCombined() {
    // Get all active tests
    const tests = await db.query(`
        SELECT id, test_name as name, 'test' as type, test_code as code
        FROM tests 
        WHERE is_active = 1 AND is_deleted = 0
        ORDER BY test_name
    `);

    // Get all active categories
    const categories = await db.query(`
        SELECT id, category_name as name, 'category' as type, '' as code
        FROM test_categories 
        WHERE is_active = 1 AND is_deleted = 0
        ORDER BY category_name
    `);

    // Combine both arrays
    const combinedItems = [...tests, ...categories];
    
    return combinedItems;
}




module.exports = {
    createTestRate,
    listTestRates,
    getTestRate,
    updateTestRate,
    deleteTestRate,
    softDeleteTestRate,
    getClientTestRates,
    getAvailableItems,
    getAvailableItemsCombined
};