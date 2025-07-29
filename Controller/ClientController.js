import jwt from 'jsonwebtoken';
import Client from '../Models/Client.js';
import Proposal from '../Models/Proposal.js';
import Freelancer from '../Models/Freelancer.js';
import Invoice from '../Models/Invoice.js';


// Client Registration
export const registerClient = async (req, res) => {
  try {
    const { name, email, mobile, password, confirmPassword } = req.body;

    if (!name || !email || !mobile || !password || !confirmPassword) {
      return res.status(400).json({
        message: 'All fields are required: Name, Email, Mobile, Password, and Confirm Password!',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match!' });
    }

    const clientExists = await Client.findOne({ $or: [{ email }, { mobile }] });
    if (clientExists) {
      return res.status(400).json({ message: 'Client with this email or mobile already exists!' });
    }

    const newClient = new Client({
      name,
      email,
      mobile,
      password, // ⚠️ You should hash this before saving in production
    });

    await newClient.save();

    const token = jwt.sign({ id: newClient._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '1h',
    });

    return res.status(201).json({
      message: 'Client registered successfully',
      token,
      client: {
        id: newClient._id,
        name: newClient.name,
        email: newClient.email,
        mobile: newClient.mobile,
        createdAt: newClient.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Client Login
export const loginClient = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const client = await Client.findOne({ email });

    if (!client) {
      return res.status(404).json({ error: 'Client not found. Please register first.' });
    }

    // ⚠️ You should compare hashed passwords in production using bcrypt.compare()

    const token = jwt.sign(
      { id: client._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      client: {
        _id: client._id,
        name: client.name || null,
        email: client.email || null,
        mobile: client.mobile || null,
        company: client.company || null, // assuming you might have this
        location: client.location || null,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Something went wrong during login',
      details: err.message,
    });
  }
};



export const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find().select('-password'); // hide password for security

    res.status(200).json({
      message: 'Clients fetched successfully',
      total: clients.length,
      clients,
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      message: 'Server error while fetching clients',
    });
  }
};


export const getProposalsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    const proposals = await Proposal.find({ clientId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'freelancerId',
        select: 'name email mobile location'
      });

    if (!proposals.length) {
      return res.status(404).json({ message: 'No proposals found for this client' });
    }

    res.status(200).json({
      message: 'Proposals fetched successfully',
      data: proposals
    });
  } catch (error) {
    console.error('Error fetching client proposals:', error);
    res.status(500).json({ message: 'Server error while fetching proposals' });
  }
};


export const getSingleProposalByClient = async (req, res) => {
  try {
    const { clientId, proposalId } = req.params;

    const proposal = await Proposal.findOne({ _id: proposalId, clientId })
      .populate({
        path: 'freelancerId',
        select: 'name email mobile location'
      });

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found for this client' });
    }

    res.status(200).json({
      message: 'Proposal fetched successfully',
      data: proposal
    });
  } catch (error) {
    console.error('Error fetching single client proposal:', error);
    res.status(500).json({ message: 'Server error while fetching proposal' });
  }
};

// Update Proposal Status by Proposal ID and Client ID
export const updateProposalStatus = async (req, res) => {
  try {
    const { clientId, proposalId } = req.params; // Extract clientId and proposalId from params
    const { status } = req.body; // Get the status from the request body

    // Validate the status against the enum options
    const validStatuses = ['Pending', 'Accepted', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided. Valid statuses are: Pending, Accepted, Rejected' });
    }

    // Find the proposal by clientId and proposalId
    const proposal = await Proposal.findOne({ _id: proposalId, clientId });

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found or client not authorized' });
    }

    // If the status is "Accepted", update the freelancer's myClients array
    if (status === 'Accepted') {
      // Fetch the freelancer's data
      const freelancer = await Freelancer.findById(proposal.freelancerId);

      if (!freelancer) {
        return res.status(404).json({ message: 'Freelancer not found' });
      }

      // Prepare the client data to push into freelancer's `myClients` array
      const clientData = {
        clientId,
        name: proposal.clientName, // Assuming `clientName` is part of the proposal document, modify if necessary
        company: proposal.clientCompany, // Assuming `clientCompany` is part of the proposal document, modify if necessary
        email: proposal.clientEmail, // Assuming `clientEmail` is part of the proposal document, modify if necessary
        phone: proposal.clientPhone // Assuming `clientPhone` is part of the proposal document, modify if necessary
      };

      // Push the client data into the freelancer's `myClients` array if it's not already there
      if (!freelancer.myClients.some(client => client.clientId.toString() === clientData.clientId.toString())) {
        freelancer.myClients.push(clientData);
        await freelancer.save();
      }
    }

    // If the status is "Rejected", remove the client data from freelancer's `myClients` array
    if (status === 'Rejected') {
      const freelancer = await Freelancer.findById(proposal.freelancerId);

      if (!freelancer) {
        return res.status(404).json({ message: 'Freelancer not found' });
      }

      // Remove the client data from the freelancer's `myClients` array
      freelancer.myClients = freelancer.myClients.filter(client => client.clientId.toString() !== clientId.toString());
      await freelancer.save();
    }

    // Update the proposal status
    proposal.status = status;
    await proposal.save();

    res.status(200).json({
      message: `Proposal status updated to ${status} successfully`,
      data: proposal
    });
  } catch (error) {
    console.error('Error updating proposal status:', error);
    res.status(500).json({ message: 'Server error while updating proposal status' });
  }
};



export const getMyProjects = async (req, res) => {
  try {
    const { clientId } = req.params;

    // Fetch only accepted proposals (projects) for the client and populate freelancer details
    const proposals = await Proposal.find({ clientId, status: 'Accepted' })
      .sort({ createdAt: -1 })
      .populate({
        path: 'freelancerId',
        select: 'name email mobile location'
      });

    if (!proposals.length) {
      return res.status(404).json({ message: 'No accepted projects found for this client' });
    }

    res.status(200).json({
      message: 'Accepted projects fetched successfully',
      data: proposals
    });
  } catch (error) {
    console.error('Error fetching client projects:', error);
    res.status(500).json({ message: 'Server error while fetching projects' });
  }
};



export const getSingleProject = async (req, res) => {
  try {
    const { clientId, proposalId } = req.params;

    const proposal = await Proposal.findOne({
      _id: proposalId,
      clientId,
      status: 'Accepted'
    }).populate({
      path: 'freelancerId',
      select: 'name email mobile location'
    });

    if (!proposal) {
      return res.status(404).json({ message: 'Accepted project not found for this client' });
    }

    res.status(200).json({
      message: 'Accepted project fetched successfully',
      data: proposal
    });
  } catch (error) {
    console.error('Error fetching single client project:', error);
    res.status(500).json({ message: 'Server error while fetching the project' });
  }
};



export const deleteSingleProject = async (req, res) => {
  try {
    const { clientId, proposalId } = req.params;

    const deletedProposal = await Proposal.findOneAndDelete({
      _id: proposalId,
      clientId,
      status: 'Accepted' // only delete if it's accepted
    });

    if (!deletedProposal) {
      return res.status(404).json({ message: 'Accepted project not found or already deleted' });
    }

    res.status(200).json({
      message: 'Accepted project deleted successfully',
      deletedProposal
    });
  } catch (error) {
    console.error('Error deleting client project:', error);
    res.status(500).json({ message: 'Server error while deleting the project' });
  }
};




export const getInvoicesByClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    const invoices = await Invoice.find({ clientId })
      .populate({
        path: 'clientId',
        select: 'name email mobile address'
      })
      .populate({
        path: 'freelancerId',
        select: 'name email mobile'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invoices.length,
      invoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices for client',
      error: error.message
    });
  }
};