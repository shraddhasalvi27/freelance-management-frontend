import express from 'express';
import { registerClient, loginClient, getAllClients, getProposalsByClient, updateProposalStatus, getMyProjects, getSingleProposalByClient, getInvoicesByClient, getSingleProject, deleteSingleProject } from '../Controller/ClientController.js';

const router = express.Router();

// @route   POST /api/clients/register
// @desc    Register a new client
router.post('/register', registerClient);

// @route   POST /api/clients/login
// @desc    Login client
router.post('/login', loginClient);
router.get('/getallclients', getAllClients);
router.get('/getallproposal/:clientId', getProposalsByClient);
router.get('/singleproposal/:clientId/:proposalId', getSingleProposalByClient);
router.get('/getallprojects/:clientId', getMyProjects);
router.get('/my-project/:clientId/:proposalId', getSingleProject);
router.delete('/delete-project/:clientId/:proposalId', deleteSingleProject);
router.put('/update-proposal/:clientId/:proposalId', updateProposalStatus);

//invoices
router.get('/clientinvoices/:clientId', getInvoicesByClient);

export default router;
