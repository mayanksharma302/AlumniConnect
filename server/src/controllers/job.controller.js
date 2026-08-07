import Job from '../models/jobs.model.js';

// 1. Post a new Job (Alumni only)
const createJob = async (req, res) => {
    try {
        if (req.user.role !== 'alumni') {
            return res.status(403).json({ 
                success: false, 
                message: "Access Denied: Only alumni can post jobs." 
            });
        }
        const { company, jobTitle, jobDescription, requirements, applyLink, validityDays } = req.body;
        const postedBy = req.user._id;

        if (!company || !jobTitle || !jobDescription || !requirements || !applyLink) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const days = validityDays || 30;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);

        const newJob = await Job.create({
            postedBy,
            company,
            jobTitle,
            jobDescription,
            requirements,
            applyLink,
            expiresAt
        });

        return res.status(201).json({
            success: true,
            message: 'Job posted successfully',
            job: newJob
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

// 2. Get all active jobs (For the main Job Board feed)
const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ isActive: true })
            .populate('postedBy', 'firstName lastName profilePicture')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

// 3. Get jobs posted by the logged-in user (So Alumni can manage their posts)
const getMyJobs = async (req, res) => {
    try {
        if (req.user.role !== 'alumni') {
            return res.status(403).json({ 
                success: false, 
                message: "Access Denied: Only alumni can get jobs." 
            });
        }
        const userId = req.user._id;
        const jobs = await Job.find({ postedBy: userId })
        .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

// 4. Delete a Job
const deleteJob = async (req, res) => {
    try {
        if (req.user.role !== 'alumni') {
            return res.status(403).json({ 
                success: false, 
                message: "Access Denied: Only alumni can delete jobs." 
            });
        }
        const jobId = req.params.jobId;
        const userId = req.user._id;

        console.log("Looking for ID:", jobId)
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        if (job.postedBy.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this job'
            });
        }

        await Job.findByIdAndDelete(jobId);
        return res.status(200).json({
            success: true,
            message: 'Job deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

export { createJob, getAllJobs, getMyJobs, deleteJob };