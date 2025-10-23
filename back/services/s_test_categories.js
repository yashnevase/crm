const db = require('../lib/dbconnection')

async function createCategory(category) {
    const sql = `
        INSERT INTO test_categories (category_name, description, is_active, created_at)
        VALUES (?, ?, ?, NOW())
    `

    const params = [
        category.category_name,
        category.description || null,
        category.is_active ?? 1,
    ]

    const result = await db.query(sql, params)
    const categoryId = result.insertId

    // Handle test relationships
    if (category.test_ids && Array.isArray(category.test_ids) && category.test_ids.length > 0) {
        const testValues = category.test_ids.map(testId => [categoryId, testId, 1, 0]) // [category_id, test_id, is_mandatory, display_order]

        const placeholders = testValues.map(() => '(?, ?, ?, ?)').join(', ')
        const flatValues = testValues.flat()

        await db.query(
            `INSERT INTO category_test_mapping (category_test_id, single_test_id, is_mandatory, display_order) VALUES ${placeholders}`,
            flatValues
        )
    }

    return categoryId
}

async function listCategories({ page = 1, limit = 0, search = '', sortBy = 'id', sortOrder = 'DESC' }) {
    const searchColumns = ['category_name', 'description']
    const searchParams = []
    let whereClause = ' WHERE is_deleted = 0' 

    if (search && search.trim() !== '') {
        const conditions = searchColumns.map(col => `${col} LIKE ?`).join(' OR ')
        whereClause += ` AND (${conditions})`
        searchColumns.forEach(() => searchParams.push(`%${search}%`))
    }

    const allowedSortColumns = ['id', 'category_name', 'is_active', 'created_at']
    const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'id'
    const validSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'

    const countSql = `SELECT COUNT(*) as total FROM test_categories${whereClause}`
    const countRows = await db.query(countSql, searchParams)
    const total = countRows[0].total

    const numericLimit = Number(limit)
    const numericPage = Number(page)

    let dataSql = `SELECT * FROM test_categories${whereClause} ORDER BY ${validSortBy} ${validSortOrder}`
    const dataParams = [...searchParams]

    if (!isNaN(numericLimit) && numericLimit > 0) {
        const offset = (numericPage - 1) * numericLimit
        dataSql += ` LIMIT ${numericLimit} OFFSET ${offset}`
    }

    const rows = await db.query(dataSql, dataParams)

    for (const row of rows) {
        const testRows = await db.query(
            'SELECT single_test_id FROM category_test_mapping WHERE category_test_id = ?',
            [row.id]
        )
        row.test_ids = testRows.map(r => r.single_test_id)
    }

    return {
        data: rows,
        pagination: {
            total,
            page: numericPage,
            limit: numericLimit,
            pages: numericLimit > 0 ? Math.ceil(total / numericLimit) : 1,
        },
    }
}


async function getCategory(id) {
    // Get category basic info
    const categoryRows = await db.query('SELECT * FROM test_categories WHERE id = ?', [id])
    if (!categoryRows[0]) return null

    const category = categoryRows[0]

    // Get associated test IDs
    const testRows = await db.query(
        'SELECT single_test_id FROM category_test_mapping WHERE category_test_id = ?',
        [id]
    )

    category.test_ids = testRows.map(row => row.single_test_id)

    return category
}

async function updateCategory(id, updates) {
    const { test_ids, ...categoryUpdates } = updates

    let affectedRows = 0

    // Update main category record if there are fields to update
    if (Object.keys(categoryUpdates).length > 0) {
        const fields = []
        const values = []

        Object.entries(categoryUpdates).forEach(([key, value]) => {
            if (value !== undefined) {
                fields.push(`${key} = ?`)
                values.push(value)
            }
        })

        const sql = `UPDATE test_categories SET ${fields.join(', ')} WHERE id = ?`
        values.push(id)
        const result = await db.query(sql, values)
        affectedRows = result.affectedRows
    } else {
        affectedRows = 1 // No category fields to update, but operation is successful
    }

    // Handle test relationships
    if (test_ids !== undefined) {
        await db.query('DELETE FROM category_test_mapping WHERE category_test_id = ?', [id])

        if (Array.isArray(test_ids) && test_ids.length > 0) {
            // Filter out any empty strings or invalid values
            const validTestIds = test_ids.filter(testId => 
                testId !== '' && testId !== null && testId !== undefined && !isNaN(Number(testId))
            )
            
            if (validTestIds.length > 0) {
                const testValues = validTestIds.map(testId => [id, Number(testId), 1, 0])
                const placeholders = testValues.map(() => '(?, ?, ?, ?)').join(', ')
                const flatValues = testValues.flat()

                await db.query(
                    `INSERT INTO category_test_mapping (category_test_id, single_test_id, is_mandatory, display_order) VALUES ${placeholders}`,
                    flatValues
                )
            }
        }
    }

    return affectedRows
}






// softdelete category

const softDeleteCategory = async (ids) => {
  if (!ids.length) return 0;

  const placeholders = ids.map(() => '?').join(', ');
  const sql = `UPDATE test_categories SET is_deleted = 1, updated_at = NOW() WHERE id IN (${placeholders})`;

  const result = await db.query(sql, ids);

  return result.affectedRows;
}




async function deleteCategory(id) {
    // First delete the test mappings
    await db.query('DELETE FROM category_test_mapping WHERE category_test_id = ?', [id])
    
    // Then delete the category
    const result = await db.query('DELETE FROM test_categories WHERE id = ?', [id])
    return result.affectedRows
}

module.exports = { createCategory, listCategories, getCategory, updateCategory, deleteCategory,softDeleteCategory }