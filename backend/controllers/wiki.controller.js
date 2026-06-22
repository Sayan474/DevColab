import WikiPage from '../models/WikiPage.js';

/**
 * @desc    Get all wiki pages for a specific project
 * @route   GET /api/wiki/project/:projectId
 * @access  Private
 */
export const getWiki = async (req, res) => {
  try {
    const { projectId } = req.params;

    const wikiPages = await WikiPage.find({ projectId })
      .populate('createdBy', 'name avatar')
      .populate('updatedBy', 'name avatar') 
      .sort({ order: 1 });

    if (!wikiPages) {
      return res.status(200).json([]);
    }

    return res.status(200).json(wikiPages);
  } catch (error) {
    console.error('Error in getWiki controller:', error.message);
    return res.status(500).json({ 
      message: 'Server error while fetching project wiki assets', 
      error: error.message 
    });
  }
};

/**
 * @desc    Create a new wiki page or update an existing one
 * @route   POST /api/wiki or PUT /api/wiki/:id
 * @access  Private
 */
export const updateWiki = async (req, res) => {
  try {
    const { id, title, content, projectId, parentId, order, changeSummary } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!projectId) {
      return res.status(400).json({ message: 'Project ID specification is required.' });
    }

    let wikiPage;

    if (id) {
      wikiPage = await WikiPage.findById(id);
      
      if (!wikiPage) {
        return res.status(404).json({ message: 'Target Wiki Page not found.' });
      }

      // Snapshot to history
      wikiPage.versionHistory.push({
        title: wikiPage.title,
        content: wikiPage.content,
        changeSummary: changeSummary || 'Updated page content',
        editedBy: userId,
        editedAt: new Date()
      });

      // Update main records
      if (title !== undefined) wikiPage.title = title;
      if (content !== undefined) wikiPage.content = content;
      if (parentId !== undefined) wikiPage.parentId = parentId;
      if (order !== undefined) wikiPage.order = order;
      
      wikiPage.updatedBy = userId; // Tracking who made the last change

    } else {
      if (!title) {
        return res.status(400).json({ message: 'A title is required to instantiate a wiki document.' });
      }

      wikiPage = new WikiPage({
        title,
        content: content || '',
        projectId,
        parentId: parentId || null,
        order: order || 0,
        createdBy: userId,
        updatedBy: userId
      });
    }

    const savedPage = await wikiPage.save();
    
    const populatedPage = await WikiPage.findById(savedPage._id)
      .populate('createdBy', 'name avatar')
      .populate('updatedBy', 'name avatar');

    return res.status(200).json(populatedPage);
  } catch (error) {
    console.error('Error in updateWiki controller:', error.message);
    return res.status(500).json({ 
      message: 'Server error while modifying wiki payload documents', 
      error: error.message 
    });
  }
};

/**
 * @desc    Get a single wiki page by ID
 * @route   GET /api/wiki/:id
 * @access  Private
 */
export const getPage = async (req, res) => {
  try {
    const page = await WikiPage.findById(req.params.id)
      .populate('createdBy', 'name avatar')
      .populate('updatedBy', 'name avatar');

    if (!page) {
      return res.status(404).json({ message: 'Wiki page not found' });
    }
    
    return res.status(200).json(page);
  } catch (error) {
    console.error('Error in getPage controller:', error.message);
    return res.status(500).json({ 
      message: 'Server error while fetching the wiki page', 
      error: error.message 
    });
  }
};