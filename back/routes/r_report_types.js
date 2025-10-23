const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../lib/auth');
const service = require('../services/s_report_types');

router.get('/report-types', verifyToken, async (req, res) => { try { res.json(await service.listReportTypes()); } catch (e) { res.status(500).json({ message: 'Internal server error' }); } });
router.get('/report-types/:id', verifyToken, async (req, res) => { try { const row = await service.getReportType(req.params.id); if (!row) return res.status(404).json({ message: 'Not found' }); res.json(row); } catch (e) { res.status(500).json({ message: 'Internal server error' }); } });
router.post('/report-types', verifyToken, checkRole([1]), async (req, res) => { try { const id = await service.createReportType(req.body); res.status(201).json({ id }); } catch (e) { res.status(500).json({ message: 'Internal server error' }); } });
router.put('/report-types/:id', verifyToken, checkRole([1]), async (req, res) => { try { const affected = await service.updateReportType(req.params.id, req.body); if (!affected) return res.status(404).json({ message: 'Not found' }); res.json({ updated: affected }); } catch (e) { res.status(500).json({ message: 'Internal server error' }); } });
router.delete('/report-types/:id', verifyToken, checkRole([1]), async (req, res) => { try { const affected = await service.deleteReportType(req.params.id); if (!affected) return res.status(404).json({ message: 'Not found' }); res.json({ deleted: affected }); } catch (e) { res.status(500).json({ message: 'Internal server error' }); } });

module.exports = router;


