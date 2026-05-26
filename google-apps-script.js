// ============================================================
// 🔧 GOOGLE APPS SCRIPT v3 — Catches ALL files
// ============================================================
//
// TO UPDATE (takes 2 minutes):
// 1. Go to https://script.google.com → open your project
// 2. Select ALL code (Ctrl+A) → Delete it
// 3. Paste THIS entire code
// 4. Click 💾 Save
// 5. Click "Deploy" → "Manage Deployments"
// 6. Click the ✏️ pencil icon on your deployment
// 7. Change "Version" dropdown to "New version"
// 8. Click "Deploy"
// ============================================================

function doGet(e) {
  try {
    var folderId = '1--UIBZ3gTOKXsGkhWuaazs8JQwGvUI92';
    var items = [];

    var mainFolder = DriveApp.getFolderById(folderId);
    
    // Process main folder
    processAllFiles(mainFolder, 'all', items);

    // Process ALL subfolders recursively
    findAllSubfolders(mainFolder, items);

    // Sort by date (newest first)
    items.sort(function(a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    // Log count for debugging
    Logger.log('Total files found: ' + items.length);

    return ContentService
      .createTextOutput(JSON.stringify(items))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function findAllSubfolders(parentFolder, items) {
  var subfolders = parentFolder.getFolders();
  while (subfolders.hasNext()) {
    var subfolder = subfolders.next();
    var catName = subfolder.getName().toLowerCase().replace(/\s+/g, '-');
    processAllFiles(subfolder, catName, items);
    findAllSubfolders(subfolder, items);
  }
}

function processAllFiles(folder, category, items) {
  var files = folder.getFiles();

  while (files.hasNext()) {
    var file = files.next();
    var mimeType = file.getMimeType();
    var fileName = file.getName();
    var fileId = file.getId();

    // INCLUDE EVERYTHING — images, PDFs, videos, Google Docs, etc.
    // Only skip obviously non-visual files
    var skipTypes = [
      'application/vnd.google-apps.folder',
      'text/plain',
      'text/csv',
      'application/json',
      'application/zip'
    ];
    
    if (skipTypes.indexOf(mimeType) !== -1) {
      continue;
    }

    // Clean up the title
    var title = fileName
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, function(l) {
        return l.toUpperCase();
      });

    var description = file.getDescription() || '';
    var descCategory = category;
    var catMatch = description.match(/\[([\w-]+)\]/);
    if (catMatch) {
      descCategory = catMatch[1].toLowerCase();
      description = description.replace(/\[[\w-]+\]\s*/, '');
    }

    // Try to set sharing
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch(e) {}

    // Build image URLs — different strategies for different file types
    var imageUrl, directUrl, lh3Url;
    
    if (mimeType.indexOf('image/') === 0) {
      // Standard images
      imageUrl = 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w800';
      directUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;
      lh3Url = 'https://lh3.googleusercontent.com/d/' + fileId + '=w800';
    } else if (mimeType === 'application/pdf') {
      // PDFs - Drive can generate thumbnails
      imageUrl = 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w800';
      directUrl = 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w1200';
      lh3Url = imageUrl;
    } else if (mimeType.indexOf('google-apps') !== -1) {
      // Google Docs/Slides/Drawings - use thumbnail
      try {
        var thumb = file.getThumbnail();
        if (thumb) {
          imageUrl = 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w800';
        } else {
          imageUrl = 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w800';
        }
      } catch(e) {
        imageUrl = 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w800';
      }
      directUrl = imageUrl;
      lh3Url = imageUrl;
    } else {
      // Other files (videos, etc.) - try thumbnail anyway
      imageUrl = 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w800';
      directUrl = imageUrl;
      lh3Url = imageUrl;
    }

    items.push({
      id: fileId,
      title: title,
      category: descCategory,
      image: imageUrl,
      directImage: directUrl,
      lh3Image: lh3Url,
      description: description,
      date: file.getDateCreated().toISOString(),
      mimeType: mimeType
    });
  }
}
