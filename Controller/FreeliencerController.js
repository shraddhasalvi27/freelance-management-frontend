import Freelancer from '../Models/Freelancer.js';
import jwt from 'jsonwebtoken';
import Client from '../Models/Client.js';
import Project from '../Models/Project.js';
import TeamMember from '../Models/TeamMember.js';
import Proposal from '../Models/Proposal.js';
import Invoice from '../Models/Invoice.js';

export const registerFreelancer = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      confirmPassword,
    } = req.body;

    // Validate required fields
    if (!name || !email || !mobile || !password || !confirmPassword) {
      return res.status(400).json({
        message: 'All fields are required: Name, Email, Mobile, Password, and Confirm Password!',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match!' });
    }

    const freelancerExists = await Freelancer.findOne({ $or: [{ email }, { mobile }] });
    if (freelancerExists) {
      return res.status(400).json({ message: 'Freelancer with this email or mobile already exists!' });
    }

    const newFreelancer = new Freelancer({
      name,
      email,
      mobile,
      password, // ⚠️ Still plain-text, you should hash it before production
    });

    await newFreelancer.save();

    const token = jwt.sign({ id: newFreelancer._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '1h',
    });

    return res.status(201).json({
      message: 'Freelancer registered successfully',
      token,
      freelancer: {
        id: newFreelancer._id,
        name: newFreelancer.name,
        email: newFreelancer.email,
        mobile: newFreelancer.mobile,
        createdAt: newFreelancer.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};



export const loginFreelancer = async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
  
    try {
      const freelancer = await Freelancer.findOne({ email });
  
      if (!freelancer) {
        return res.status(404).json({ error: "Freelancer not found. Please register first." });
      }

  
      const token = jwt.sign(
        { id: freelancer._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '1h' }
      );
  
      return res.status(200).json({
        message: "Login successful",
        token,
        freelancer: {
          _id: freelancer._id,
          name: freelancer.name || null,
          email: freelancer.email || null,
          mobile: freelancer.mobile || null,
          skills: freelancer.skills || [],
          location: freelancer.location || null,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "Something went wrong during login",
        details: err.message,
      });
    }
  };

  
  export const getFreelancer = async (req, res) => {
  try {
    const freelancerId = req.params.freelancerId;

    const freelancer = await Freelancer.findById(freelancerId);

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found!' });
    }

    return res.status(200).json({
      message: 'Freelancer details retrieved successfully!',
      id: freelancer._id,
      name: freelancer.name || "",
      position: freelancer.position || "",
      experience: freelancer.experience || "",
      email: freelancer.email || "",
      mobile: freelancer.mobile || "",
      location: freelancer.location || "",
      linkedin: freelancer.linkedin || "",
      github: freelancer.github || "",
      twitter: freelancer.twitter || "",
      profileImage: freelancer.profileImage || "default-profile-image.jpg",
      skills: freelancer.skills || [],
      services: freelancer.services || [],
      testimonials: freelancer.testimonials || [],
      about: freelancer.about || {},
      faq: freelancer.faq || [],
      latestWork: freelancer.latestWork || [],
      createdAt: freelancer.createdAt,
      updatedAt: freelancer.updatedAt
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};



 export const updateFreelancer = async (req, res) => {
  try {
    const freelancerId = req.params.freelancerId;

    const freelancer = await Freelancer.findById(freelancerId);

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found!' });
    }

    // Text fields
    const {
      name,
      position,
      experience,
      location,
      linkedin,
      github,
      twitter,
      skills,
      services,
      testimonials,
      about,
      faq,
      latestWork,
    } = req.body;

    // Update fields
    if (name) freelancer.name = name;
    if (position) freelancer.position = position;
    if (experience) freelancer.experience = experience;
    if (location) freelancer.location = location;
    if (linkedin) freelancer.linkedin = linkedin;
    if (github) freelancer.github = github;
    if (twitter) freelancer.twitter = twitter;

    // Update profileImage if file is uploaded
    if (req.file) {
      freelancer.profileImage = `/uploads/profileImg/${req.file.filename}`;
    }

    if (skills) freelancer.skills = skills;
    if (services) freelancer.services = services;
    if (testimonials) freelancer.testimonials = testimonials;
    if (about) freelancer.about = about;
    if (faq) freelancer.faq = faq;
    if (latestWork) freelancer.latestWork = latestWork;

    await freelancer.save();

    return res.status(200).json({
      message: 'Freelancer profile updated successfully!',
      freelancer,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};


  



  export const createProject = async (req, res) => {
  const { freelancerId } = req.params;
  const {
    title,
    description,
    category,
    budget,
    deadline,
    attachments,
    clientId,
    assignedTo,
    status
  } = req.body;

  if (!title || !description || !budget || !clientId) {
    return res.status(400).json({
      message: 'Title, description, budget, and clientId are required',
    });
  }

  try {
    // 1. Create the project with assignedTo
    const newProject = new Project({
      title,
      description,
      category,
      budget,
      deadline,
      attachments,
      clientId,
      assignedFreelancer: freelancerId,
      assignedTo: assignedTo || [], // ✅ add assignedTo properly
      progress: 0,
      association: [],
      activity: [
        {
          action: 'Project created',
          by: `Freelancer ${freelancerId}`,
          timestamp: new Date(),
        }
      ],
      status: status || 'Pending',
    });

    const savedProject = await newProject.save();

    // 2. Push project ID into client's myProjects[]
    await Client.findByIdAndUpdate(clientId, {
      $push: { myProjects: savedProject._id },
    });

    // 3. Push project ID into each assigned team member's assignedProjects[]
    if (assignedTo && assignedTo.length > 0) {
      await TeamMember.updateMany(
        { _id: { $in: assignedTo } },
        { $push: { assignedProjects: savedProject._id } }
      );
    }

    return res.status(201).json({
      message: 'Project created successfully',
      project: savedProject,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error while creating project' });
  }
};


  export const getProjectsByFreelancer = async (req, res) => {
    const { freelancerId } = req.params;
  
    try {
      const projects = await Project.find({ assignedFreelancer: freelancerId }).sort({ createdAt: -1 });
  
      return res.status(200).json({
        message: 'Projects fetched successfully',
        projects,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error while fetching projects' });
    }
  };

  

  export const updateProject = async (req, res) => {
    const { freelancerId, projectId } = req.params;
  const {
    title,
    description,
    category,
    budget,
    deadline,
    attachments,
    assignedTo,
    status,
    progress
  } = req.body;

  try {
    const existingProject = await Project.findById(projectId);
    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // 1. Update team member references
    const oldAssignedTo = existingProject.assignedTo.map(id => id.toString());
    const newAssignedTo = assignedTo || [];

    // Remove project from old team members that are no longer assigned
    const removedMembers = oldAssignedTo.filter(id => !newAssignedTo.includes(id));
    if (removedMembers.length > 0) {
      await TeamMember.updateMany(
        { _id: { $in: removedMembers } },
        { $pull: { assignedProjects: projectId } }
      );
    }

    // Add project to newly assigned team members
    const addedMembers = newAssignedTo.filter(id => !oldAssignedTo.includes(id));
    if (addedMembers.length > 0) {
      await TeamMember.updateMany(
        { _id: { $in: addedMembers } },
        { $addToSet: { assignedProjects: projectId } }
      );
    }

    // 2. Update the project
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      {
        title,
        description,
        category,
        budget,
        deadline,
        attachments,
        assignedTo: newAssignedTo,
        status,
        progress,
        $push: {
          activity: {
            action: 'Project updated',
            by: `Freelancer ${freelancerId}`,
            timestamp: new Date(),
          }
        }
      },
      { new: true }
    );

    return res.status(200).json({
      message: 'Project updated successfully',
      project: updatedProject,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error updating project' });
  }
  };



export const deleteProject = async (req, res) => {
  const { freelancerId, projectId } = req.params;

  try {
    const project = await Project.findOne({
      _id: projectId,
      assignedFreelancer: freelancerId
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or not assigned to this freelancer' });
    }

    // Remove the project from all assigned team members
    if (project.assignedTo && project.assignedTo.length > 0) {
      await TeamMember.updateMany(
        { _id: { $in: project.assignedTo } },
        { $pull: { assignedProjects: projectId } }
      );
    }

    // Optionally, remove from client's `myProjects` too (if required)
    if (project.clientId) {
      await Client.findByIdAndUpdate(project.clientId, {
        $pull: { myProjects: project._id }
      });
    }

    // Delete the project
    await Project.findByIdAndDelete(projectId);

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error while deleting project' });
  }
};



// ✅ Create Client
export const createClient = async (req, res) => {
    const { freelancerId } = req.params;
    const {
      name, email, mobile, password,
      companyName, profileImage, address, bio, website, termsAndConditionsAgreed
    } = req.body;
  
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ message: 'Name, email, mobile, and password are required' });
    }
  
    try {
      const clientExist = await Client.findOne({ email });
  
      if (clientExist) {
        return res.status(400).json({ message: 'Client with this email already exists' });
      }
  
      const newClient = new Client({
        name,
        email,
        mobile,
        password,
        companyName,
        profileImage,
        address,
        bio,
        website,
        termsAndConditionsAgreed,
      });
  
      const savedClient = await newClient.save();
  
      res.status(201).json({
        message: 'Client created successfully',
        client: savedClient,
        byFreelancer: freelancerId,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error while creating client' });
    }
  };
  
  // ✅ Get All Clients (by a Freelancer)
  export const getClientsByFreelancer = async (req, res) => {
  const { freelancerId } = req.params;

  try {
    const freelancer = await Freelancer.findById(freelancerId);

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    const clientIds = freelancer.myClients.map((entry) => entry.clientId);

    const clients = await Client.find({ _id: { $in: clientIds } });

    res.status(200).json({
      message: 'Clients fetched successfully',
      clients,
      viewedBy: freelancerId,
    });
  } catch (error) {
    console.error('Error fetching freelancer clients:', error);
    res.status(500).json({ message: 'Error fetching clients' });
  }
};
  
  // ✅ Get Single Client
  export const getSingleClient = async (req, res) => {
    const { freelancerId, clientId } = req.params;
  
    try {
      const client = await Client.findById(clientId);
  
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }
  
      res.status(200).json({
        message: 'Client fetched successfully',
        client,
        viewedBy: freelancerId,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching client' });
    }
  };
  
  // ✅ Update Client
  export const updateClient = async (req, res) => {
    const { freelancerId, clientId } = req.params;
  
    try {
      const updatedClient = await Client.findByIdAndUpdate(clientId, req.body, {
        new: true,
      });
  
      if (!updatedClient) {
        return res.status(404).json({ message: 'Client not found' });
      }
  
      res.status(200).json({
        message: 'Client updated successfully',
        updatedClient,
        updatedBy: freelancerId,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating client' });
    }
  };
  
  // ✅ Delete Client
  export const deleteClient = async (req, res) => {
    const { freelancerId, clientId } = req.params;
  
    try {
      const deletedClient = await Client.findByIdAndDelete(clientId);
  
      if (!deletedClient) {
        return res.status(404).json({ message: 'Client not found' });
      }
  
      res.status(200).json({
        message: 'Client deleted successfully',
        deletedClient,
        deletedBy: freelancerId,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error deleting client' });
    }
  };



// ✅ Create Team Member
export const createTeamMember = async (req, res) => {
  const { freelancerId } = req.params;
  const {
    name, email, role, projects, status,
    bio, profileImage, mobile
  } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ message: 'Name, email, and role are required' });
  }

  try {
    const memberExist = await TeamMember.findOne({ email });

    if (memberExist) {
      return res.status(400).json({ message: 'Team member with this email already exists' });
    }

    const newMember = new TeamMember({
      name,
      email,
      role,
      projects,
      status,
      bio,
      profileImage,
      mobile,
    });

    const savedMember = await newMember.save();

    res.status(201).json({
      message: 'Team member created successfully',
      teamMember: savedMember,
      addedBy: freelancerId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error while creating team member' });
  }
};

// ✅ Get All Team Members
export const getAllTeamMembers = async (req, res) => {
  const { freelancerId } = req.params;

  try {
    const members = await TeamMember.find();

    res.status(200).json({
      message: 'Team members fetched successfully',
      members,
      viewedBy: freelancerId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching team members' });
  }
};

// ✅ Get Single Team Member
export const getSingleTeamMember = async (req, res) => {
  const { freelancerId, memberId } = req.params;

  try {
    const member = await TeamMember.findById(memberId);

    if (!member) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    res.status(200).json({
      message: 'Team member fetched successfully',
      member,
      viewedBy: freelancerId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching team member' });
  }
};

// ✅ Update Team Member
export const updateTeamMember = async (req, res) => {
  const { freelancerId, memberId } = req.params;

  try {
    const updatedMember = await TeamMember.findByIdAndUpdate(memberId, req.body, {
      new: true,
    });

    if (!updatedMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    res.status(200).json({
      message: 'Team member updated successfully',
      updatedMember,
      updatedBy: freelancerId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating team member' });
  }
};

// ✅ Delete Team Member
export const deleteTeamMember = async (req, res) => {
  const { freelancerId, memberId } = req.params;

  try {
    const deletedMember = await TeamMember.findByIdAndDelete(memberId);

    if (!deletedMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    res.status(200).json({
      message: 'Team member deleted successfully',
      deletedMember,
      deletedBy: freelancerId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting team member' });
  }
};
  



export const getAllProposals = async (req, res) => {
   try {
    const { freelancerId } = req.params;

    const proposals = await Proposal.find({ freelancerId }).sort({ createdAt: -1 });

    if (!proposals.length) {
      return res.status(404).json({ message: 'No proposals found for this freelancer' });
    }

    res.status(200).json(proposals);
  } catch (error) {
    console.error('Error fetching freelancer proposals:', error);
    res.status(500).json({ message: 'Server error while fetching proposals' });
  }
};


export const getProposalById = async (req, res) => {
  const { proposalId, freelancerId } = req.params;

  try {
    const proposal = await Proposal.findById(proposalId)
      .populate('clientId', 'name email')
      .populate('projectId', 'title description');

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    return res.status(200).json({
      message: 'Proposal fetched successfully',
      proposal,
      viewedBy: freelancerId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching proposal' });
  }
};



export const createProposal = async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const {
      clientId,
      title,
      client,
      overview,
      scopeOfWork,
      timeline,
      total,
      termsAndConditions,
      actions,
      footerButtons
    } = req.body;

    const newProposal = new Proposal({
      freelancerId,
      clientId,
      title,
      status: 'Pending', // default
      client,
      overview,
      scopeOfWork,
      timeline,
      total,
      termsAndConditions,
      actions,
      footerButtons
    });

    const savedProposal = await newProposal.save();
    res.status(201).json(savedProposal);
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ message: 'Failed to create proposal' });
  }
};


export const updateProposal = async (req, res) => {
  const { freelancerId, proposalId } = req.params;
  const updateFields = req.body;

  try {
    const updatedProposal = await Proposal.findOneAndUpdate(
      { _id: proposalId, freelancerId },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedProposal) {
      return res.status(404).json({ message: 'Proposal not found or not owned by this freelancer' });
    }

    return res.status(200).json({
      message: 'Proposal updated successfully',
      proposal: updatedProposal,
    });
  } catch (error) {
    console.error('Error updating proposal:', error);
    res.status(500).json({ message: 'Failed to update proposal' });
  }
};



export const deleteProposal = async (req, res) => {
  const { freelancerId, proposalId } = req.params;

  try {
    const deletedProposal = await Proposal.findOneAndDelete({
      _id: proposalId,
      freelancerId
    });

    if (!deletedProposal) {
      return res.status(404).json({ message: 'Proposal not found or not owned by this freelancer' });
    }

    return res.status(200).json({
      message: 'Proposal deleted successfully',
      proposal: deletedProposal,
    });
  } catch (error) {
    console.error('Error deleting proposal:', error);
    res.status(500).json({ message: 'Failed to delete proposal' });
  }
};



// Get Freelancer's clients with details
export const getFreelancerClients = async (req, res) => {
  try {
    const { freelancerId } = req.params; // Extract freelancerId from params

    // Find the freelancer by ID and populate the myClients array
    const freelancer = await Freelancer.findById(freelancerId)
      .populate({
        path: 'myClients.clientId', // Populate the clientId field
        select: 'name email mobile' // Select the required fields from the Client model
      });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    // Format the myClients data to return the necessary client information
    const clientDetails = freelancer.myClients.map(client => ({
      clientId: client.clientId._id,
      name: client.clientId.name,
      email: client.clientId.email,
      phone: client.clientId.mobile
    }));

    res.status(200).json({
      message: 'Freelancer clients fetched successfully',
      data: clientDetails
    });
  } catch (error) {
    console.error('Error fetching freelancer clients:', error);
    res.status(500).json({ message: 'Server error while fetching freelancer clients' });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const { freelancerId } = req.params;

    // Fetch proposals with 'Accepted' status and sort by creation date
    const proposals = await Proposal.find({ freelancerId, status: 'Accepted' }).sort({ createdAt: -1 });

    if (!proposals.length) {
      return res.status(404).json({ message: 'No accepted proposals found for this freelancer' });
    }

    res.status(200).json(proposals);
  } catch (error) {
    console.error('Error fetching freelancer proposals:', error);
    res.status(500).json({ message: 'Server error while fetching proposals' });
  }
};



export const createInvoice = async (req, res) => {
  try {
    const { freelancerId, clientId } = req.params;
    const {
      invoiceNumber,
      invoiceDate,
      items,
      taxRate,
      paymentMethod,
      terms
    } = req.body;

    // Calculate totals
    const subTotal = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const taxAmount = (taxRate / 100) * subTotal;
    const grandTotal = subTotal + taxAmount;

    // Create the invoice
    const invoice = new Invoice({
      freelancerId,
      clientId,
      invoiceNumber,
      invoiceDate,
      items: items.map(item => ({
        ...item,
        total: item.quantity * item.price
      })),
      subTotal,
      taxRate,
      taxAmount,
      grandTotal,
      paymentMethod,
      terms
    });

    await invoice.save();

    // Push invoice ID to freelancer and client models
    await Promise.all([
      Freelancer.findByIdAndUpdate(freelancerId, {
        $push: { myInvoices: invoice._id }
      }),
      Client.findByIdAndUpdate(clientId, {
        $push: { myInvoices: invoice._id }
      })
    ]);

    res.status(201).json({
      success: true,
      message: 'Invoice created and linked to Freelancer & Client successfully',
      invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating invoice',
      error: error.message
    });
  }
};



export const getInvoicesByFreelancer = async (req, res) => {
  try {
    const { freelancerId } = req.params;

    const invoices = await Invoice.find({ freelancerId })
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
      message: 'Error fetching invoices for freelancer',
      error: error.message
    });
  }
};