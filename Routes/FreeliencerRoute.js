import express from 'express';
import { createClient, 
    createProject, 
    createProposal, 
    createTeamMember, 
    deleteClient, 
    deleteTeamMember, 
    getAllProposals, 
    getAllTeamMembers, 
    getClientsByFreelancer, 
    getFreelancer, 
    getProjectsByFreelancer, 
    getProposalById, 
    getSingleClient, 
    getSingleTeamMember, 
    loginFreelancer, 
    registerFreelancer, 
    updateClient, 
    getFreelancerClients,
    updateTeamMember, 
    getAllProjects,
    updateFreelancer,
    createInvoice,
    getInvoicesByFreelancer,
    updateProject,
    updateProposal,
    deleteProposal,
    deleteProject} from '../Controller/FreeliencerController.js';
    import uploadProfileImg from '../config/uploadConfig.js';

const router = express.Router();

// POST /api/freelancers/register
router.post('/register', registerFreelancer);
router.post('/login', loginFreelancer);
router.get('/singlefreelancer/:freelancerId', getFreelancer);
router.put('/updatefreelancers/:freelancerId',   uploadProfileImg, updateFreelancer);
// CREATE a client by a freelancer
router.post('/createclient/:freelancerId', createClient);
router.get('/getclients/:freelancerId', getClientsByFreelancer);
router.get('/singleclient/:freelancerId/:clientId', getSingleClient);
router.put('/updateclients/:freelancerId/:clientId', updateClient);
router.delete('/deleteclient/:freelancerId/:clientId', deleteClient);
// CREATE a team member under a freelancer
router.post('/createteam/:freelancerId', createTeamMember);
router.get('/getallteam/:freelancerId', getAllTeamMembers);
router.get('/singleteam/:freelancerId/:memberId', getSingleTeamMember);
router.put('/updateteam/:freelancerId/:memberId', updateTeamMember);
router.delete('/deleteteam/:freelancerId/:memberId', deleteTeamMember);
//projects
router.post('/createproject/:freelancerId', createProject);
router.put('/updateproject/:freelancerId/:projectId', updateProject);
router.delete('/deleteproject/:freelancerId/:projectId', deleteProject);
router.get('/getprojects/:freelancerId', getProjectsByFreelancer);


//proposal
router.post('/create-proposals/:freelancerId', createProposal);
router.put('/updateproposal/:freelancerId/:proposalId', updateProposal);
router.delete('/deleteproposal/:freelancerId/:proposalId', deleteProposal);
router.get('/allproposals/:freelancerId', getAllProposals);
router.get('/allprojects/:freelancerId', getAllProjects);
router.get('/singleproposals/:freelancerId/:proposalId', getProposalById);
router.get('/myclients/:freelancerId', getFreelancerClients);

//invoices
router.post('/createinvoice/:freelancerId/:clientId', createInvoice);
router.get('/freelancerinvoices/:freelancerId', getInvoicesByFreelancer);




export default router;
