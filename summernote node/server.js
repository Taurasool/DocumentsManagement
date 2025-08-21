// const express = require('express');
// const pool = require('./db');                   
// const multer = require('multer');
// const cors = require('cors');
// const path = require('path');
// const fs = require('fs');

// const app = express();

// app.use(cors());
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// const uploadDir = path.join(__dirname, 'uploads');

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),
//   filename: (req, file, cb) => {
//     const name = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
//     console.log('✅ Saved Filename:', name);
//     cb(null, name);
//   }
// });

// const upload = multer({ storage });

// app.get('/', (req, res) => {
//   res.send('✅ Server is running and ready to receive files!');
// });

// app.post('/upload', upload.single('pdf'), (req, res) => {
//   if (!req.file) return res.status(400).send('❌ No file uploaded.');

//   const fileUrl = `/uploads/${req.file.filename}`;
//   res.send({ message: '✅ PDF uploaded successfully', filePath: fileUrl });
// });

// app.use('/uploads', express.static(uploadDir));

// // ====================== Updated save-editor route ======================
// app.post('/save-editor', async (req, res) => {
//   const { benefits_name, benefits_content } = req.body;

//   if (!benefits_name || !benefits_content) {
//     return res.status(400).json({ error: '❌ benefits_name and benefits_content required' });
//   }

//   try {
//     const client = await pool.connect();

//     // Step 1: Check if benefits_name already exists
//     const checkQuery = 'SELECT id FROM benefits_name WHERE benefits_name = $1';
//     const checkResult = await client.query(checkQuery, [benefits_name]);

//     let benefitsId;

//     if (checkResult.rows.length > 0) {
//       // Agar pehle se exists hai to uska id use karo
//       benefitsId = checkResult.rows[0].id;
//     } else {
//       // Naya insert karo aur id lo
//       const insertName = 'INSERT INTO benefits_name (benefits_name) VALUES ($1) RETURNING id';
//       const insertResult = await client.query(insertName, [benefits_name]);
//       benefitsId = insertResult.rows[0].id;
//     }

//     // Step 2: Insert content into benefits_data
//     const insertContent = 'INSERT INTO benefits_data (benefits_id, benefits_content) VALUES ($1, $2)';
//     await client.query(insertContent, [benefitsId, benefits_content]);

//     client.release();
//     res.status(200).json({ message: '✅ Content saved successfully' });
//   } catch (error) {
//     console.error('❌ Error saving content:', error);
//     res.status(500).json({ error: 'Failed to save content' });
//   }
// });
// // ======================================================================

// // ===== NEW ROUTE FOR Angular /saveBenefitsData POST request =====
// app.post('/saveBenefitsData', async (req, res) => {
//   const { benefits_id, benefits_content } = req.body;

//   if (!benefits_id || !benefits_content) {
//     return res.status(400).json({ error: '❌ benefits_id and benefits_content required' });
//   }

//   try {
//     const client = await pool.connect();

//     // Insert new content related to benefits_id
//     const insertContent = 'INSERT INTO benefits_data (benefits_id, benefits_content) VALUES ($1, $2)';
//     await client.query(insertContent, [benefits_id, benefits_content]);

//     client.release();

//     res.status(200).json({ message: '✅ Benefits content saved successfully' });
//   } catch (err) {
//     console.error('❌ Error saving benefits content:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });
// // ================================================================

// app.post('/delete-pdf', async (req, res) => {
//   const { fileName } = req.body;
//   if (!fileName) return res.status(400).json({ error: '❌ File name required' });

//   const filePath = path.join(uploadDir, fileName);

//   try {
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//       console.log(`🗑️ File deleted: ${fileName}`);
//     } else {
//       console.warn('⚠️ File not found on disk:', filePath);
//     }

//     await pool.query(
//       'INSERT INTO deleted_pdf (file_name, deleted_at) VALUES ($1, NOW())',
//       [fileName]
//     );

//     res.json({ message: '✅ File deleted and logged in DB!' });
//   } catch (err) {
//     console.error('❌ Error deleting file:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // ✅ Save or Update User Documents (Medical + Plan)
// app.post('/save-user-documents', async (req, res) => {
//   const { name, medical_content, plan_content } = req.body;

//   try {
//     const existing = await pool.query('SELECT * FROM user_documents WHERE name = $1', [name]);
//     let result;

//     if (existing.rows.length > 0) {
//       result = await pool.query(
//         'UPDATE user_documents SET medical_content = $1, plan_content = $2 WHERE name = $3 RETURNING *',
//         [medical_content, plan_content, name]
//       );
//     } else {
//       result = await pool.query(
//         'INSERT INTO user_documents (name, medical_content, plan_content) VALUES ($1, $2, $3) RETURNING *',
//         [name, medical_content, plan_content]
//       );
//     }

//     res.json({ message: '✅ Data saved successfully!', data: result.rows[0] });
//   } catch (err) {
//     console.error('❌ Error saving user documents:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // ✅ Get User Documents By Name
// app.get('/get-user-documents/:name', async (req, res) => {
//   const { name } = req.params;

//   try {
//     const result = await pool.query('SELECT * FROM user_documents WHERE name = $1', [name]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: '❌ No data found for this user.' });
//     }

//     res.json({ data: result.rows[0] });
//   } catch (err) {
//     console.error('❌ Error fetching user documents:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// app.post('/save-benefits', async (req, res) => {
//   const { benefits_name, status, benefits_content } = req.body;

//   if (!benefits_name || !benefits_content) {
//     return res.status(400).json({ error: '❌ benefits_name and benefits_content required' });
//   }

//   try {
//     const client = await pool.connect();

//     // Step 1: Insert into benefits_name
//     const nameResult = await client.query(
//       `INSERT INTO benefits_name (benefits_name, status) 
//        VALUES ($1, $2) RETURNING id`,
//       [benefits_name, status || 1]
//     );
//     const benefits_id = nameResult.rows[0].id;

//     // Step 2: Insert into benefits_data
//     await client.query(
//       `INSERT INTO benefits_data (benefits_id, benefits_content) 
//        VALUES ($1, $2)`,
//       [benefits_id, benefits_content]
//     );

//     client.release();
//     res.json({ message: '✅ Benefit inserted successfully' });
//   } catch (err) {
//     console.error('❌ Error saving benefit:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// app.get('/get-benefits', async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT 
//         bn.id AS benefit_id,
//         bn.benefits_name,
//         bn.status,
//         bn.created_date,
//         bd.benefits_content
//       FROM benefits_name bn
//       JOIN benefits_data bd ON bd.benefits_id = bn.id
//       ORDER BY bn.id DESC
//     `);

//     res.json({ data: result.rows });
//   } catch (err) {
//     console.error('❌ Error fetching benefits:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`✅ Server running on port ${PORT}`);
// });


















// // Required modules ko import kar rahe hain
// const express = require('express');
// const pool = require('./db');                   // PostgreSQL database connection
// const multer = require('multer');              // PDF file upload ke liye
// const cors = require('cors');                  // Cross-origin access allow karne ke liye
// const path = require('path');                  // Path utilities (jaise __dirname)
// const fs = require('fs');                      // File system access for reading/writing/deleting

// // Express app banate hain
// const app = express();

// // Middleware: CORS allow kar rahe hain taaki Angular frontend isse connect kar sake
// app.use(cors());

// // Middleware: JSON aur URL-encoded data ko 10MB tak accept kar rahe hain
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Upload directory ka path define kiya
// const uploadDir = path.join(__dirname, 'uploads');

// // Agar 'uploads' folder exist nahi karta, to usko bana dete hain
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// // Multer ka storage setup: destination aur filename define
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),  // Upload folder me file save hogi
//   filename: (req, file, cb) => {
//     const name = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
//     console.log('✅ Saved Filename:', name);
//     cb(null, name); // Unique filename assign karte hain
//   }
// });

// const upload = multer({ storage });

// // Basic route to test if server is working
// app.get('/', (req, res) => {
//   res.send('✅ Server is running and ready to receive files!');
// });

// // PDF Upload route
// app.post('/upload', upload.single('pdf'), (req, res) => {
//   if (!req.file) return res.status(400).send('❌ No file uploaded.');

//   const fileUrl = `/uploads/${req.file.filename}`;
//   res.send({ message: '✅ PDF uploaded successfully', filePath: fileUrl });
// });

// // Uploaded files ko publicly accessible banate hain
// app.use('/uploads', express.static(uploadDir));


// // ========================== SAVE EDITOR CONTENT ==========================
// app.post('/save-editor', async (req, res) => {
//   const { benefits_name, benefits_content } = req.body;

//   // Validate kar rahe hain ki dono fields aaye hain
//   if (!benefits_name || !benefits_content) {
//     return res.status(400).json({ error: '❌ benefits_name and benefits_content required' });
//   }

//   try {
//     const client = await pool.connect();

//     // Pehle check karo ki benefits_name pehle se database me hai ya nahi
//     const checkQuery = 'SELECT id FROM benefits_name WHERE benefits_name = $1';
//     const checkResult = await client.query(checkQuery, [benefits_name]);

//     let benefitsId;

//     if (checkResult.rows.length > 0) {
//       // Agar pehle se hai to usi ka ID use karenge
//       benefitsId = checkResult.rows[0].id;
//     } else {
//       // Naya insert karenge aur ID lenge
//       const insertName = 'INSERT INTO benefits_name (benefits_name) VALUES ($1) RETURNING id';
//       const insertResult = await client.query(insertName, [benefits_name]);
//       benefitsId = insertResult.rows[0].id;
//     }

//     // benefits_data table me content insert kar rahe hain
//     const insertContent = 'INSERT INTO benefits_data (benefits_id, benefits_content) VALUES ($1, $2)';
//     await client.query(insertContent, [benefitsId, benefits_content]);

//     client.release();
//     res.status(200).json({ message: '✅ Content saved successfully' });
//   } catch (error) {
//     console.error('❌ Error saving content:', error);
//     res.status(500).json({ error: 'Failed to save content' });
//   }
// });


// // ========== ALTERNATIVE ROUTE: Save Benefits by ID (Already known) ==========
// app.post('/saveBenefitsData', async (req, res) => {
//   const { benefits_id, benefits_content } = req.body;

//   if (!benefits_id || !benefits_content) {
//     return res.status(400).json({ error: '❌ benefits_id and benefits_content required' });
//   }

//   try {
//     const client = await pool.connect();

//     const insertContent = 'INSERT INTO benefits_data (benefits_id, benefits_content) VALUES ($1, $2)';
//     await client.query(insertContent, [benefits_id, benefits_content]);

//     client.release();
//     res.status(200).json({ message: '✅ Benefits content saved successfully' });
//   } catch (err) {
//     console.error('❌ Error saving benefits content:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


// // ========== DELETE PDF FILE AND LOG DELETION ==========
// app.post('/delete-pdf', async (req, res) => {
//   const { fileName } = req.body;
//   if (!fileName) return res.status(400).json({ error: '❌ File name required' });

//   const filePath = path.join(uploadDir, fileName);

//   try {
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath); // File ko disk se hata dete hain
//       console.log(`🗑️ File deleted: ${fileName}`);
//     } else {
//       console.warn('⚠️ File not found on disk:', filePath);
//     }

//     // Deletion log ko DB me insert kar rahe hain
//     await pool.query(
//       'INSERT INTO deleted_pdf (file_name, deleted_at) VALUES ($1, NOW())',
//       [fileName]
//     );

//     res.json({ message: '✅ File deleted and logged in DB!' });
//   } catch (err) {
//     console.error('❌ Error deleting file:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


// // ========== SAVE OR UPDATE USER DOCUMENTS (Medical + Plan) ==========
// app.post('/save-user-documents', async (req, res) => {
//   const { name, medical_content, plan_content } = req.body;

//   try {
//     const existing = await pool.query('SELECT * FROM user_documents WHERE name = $1', [name]);
//     let result;

//     if (existing.rows.length > 0) {
//       // Update existing row
//       result = await pool.query(
//         'UPDATE user_documents SET medical_content = $1, plan_content = $2 WHERE name = $3 RETURNING *',
//         [medical_content, plan_content, name]
//       );
//     } else {
//       // Insert new row
//       result = await pool.query(
//         'INSERT INTO user_documents (name, medical_content, plan_content) VALUES ($1, $2, $3) RETURNING *',
//         [name, medical_content, plan_content]
//       );
//     }

//     res.json({ message: '✅ Data saved successfully!', data: result.rows[0] });
//   } catch (err) {
//     console.error('❌ Error saving user documents:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


// // ========== GET USER DOCUMENTS BY NAME ==========
// app.get('/get-user-documents/:name', async (req, res) => {
//   const { name } = req.params;

//   try {
//     const result = await pool.query('SELECT * FROM user_documents WHERE name = $1', [name]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: '❌ No data found for this user.' });
//     }

//     res.json({ data: result.rows[0] });
//   } catch (err) {
//     console.error('❌ Error fetching user documents:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


// // ========== SAVE BENEFITS (with status) ==========
// app.post('/save-benefits', async (req, res) => {
//   const { benefits_name, status, benefits_content } = req.body;

//   if (!benefits_name || !benefits_content) {
//     return res.status(400).json({ error: '❌ benefits_name and benefits_content required' });
//   }

//   try {
//     const client = await pool.connect();

//     // benefits_name table me name + status insert kar rahe hain
//     const nameResult = await client.query(
//       `INSERT INTO benefits_name (benefits_name, status) 
//        VALUES ($1, $2) RETURNING id`,
//       [benefits_name, status || 1]
//     );
//     const benefits_id = nameResult.rows[0].id;

//     // benefits_data me content insert kar rahe hain
//     await client.query(
//       `INSERT INTO benefits_data (benefits_id, benefits_content) 
//        VALUES ($1, $2)`,
//       [benefits_id, benefits_content]
//     );

//     client.release();
//     res.json({ message: '✅ Benefit inserted successfully' });
//   } catch (err) {
//     console.error('❌ Error saving benefit:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


// // ========== GET ALL BENEFITS WITH JOIN ==========
// app.get('/get-benefits', async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT 
//         bn.id AS benefit_id,
//         bn.benefits_name,
//         bn.status,
//         bn.created_date,
//         bd.benefits_content
//       FROM benefits_name bn
//       JOIN benefits_data bd ON bd.benefits_id = bn.id
//       ORDER BY bn.id DESC
//     `);

//     res.json({ data: result.rows });
//   } catch (err) {
//     console.error('❌ Error fetching benefits:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });






// // ========== GET BENEFIT ID BY NAME (Used by Angular component) ==========
// app.get('/benefit-id', async (req, res) => {
//   const { name } = req.query;

//   if (!name) {
//     return res.status(400).json({ error: '❌ Benefit name is required' });
//   }

//   try {
//     const result = await pool.query(
//       'SELECT id FROM benefits_name WHERE benefits_name = $1 LIMIT 1',
//       [name]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: '❌ Benefit name not found' });
//     }

//     res.json({ benefits_id: result.rows[0].id });
//   } catch (err) {
//     console.error('❌ Error fetching benefit ID:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

















// // ========== START THE SERVER ==========
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`✅ Server running on port ${PORT}`);
// });












































// Required modules ko import kar rahe hain
const express = require('express');
const pool = require('./db');                   // PostgreSQL database connection
const multer = require('multer');              // PDF file upload ke liye
const cors = require('cors');                  // Cross-origin access allow karne ke liye
const path = require('path');                  // Path utilities (jaise __dirname)
const fs = require('fs');                      // File system access for reading/writing/deleting

// Express app banate hain
const app = express();

// Middleware: CORS allow kar rahe hain taaki Angular frontend isse connect kar sake
app.use(cors());

// Middleware: JSON aur URL-encoded data ko 10MB tak accept kar rahe hain
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Upload directory ka path define kiya
const uploadDir = path.join(__dirname, 'uploads');

// Agar 'uploads' folder exist nahi karta, to usko bana dete hain
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer ka storage setup: destination aur filename define
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),  // Upload folder me file save hogi
  filename: (req, file, cb) => {
    const name = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
    console.log('✅ Saved Filename:', name);
    cb(null, name); // Unique filename assign karte hain
  }
});

const upload = multer({ storage });

// Basic route to test if server is working
app.get('/', (req, res) => {
  res.send('✅ Server is running and ready to receive files!');
});

// PDF Upload route
app.post('/upload', upload.single('pdf'), (req, res) => {
  if (!req.file) return res.status(400).send('❌ No file uploaded.');

  const fileUrl = `/uploads/${req.file.filename}`;
  res.send({ message: '✅ PDF uploaded successfully', filePath: fileUrl });
});

// Uploaded files ko publicly accessible banate hain
app.use('/uploads', express.static(uploadDir));

// ✅✅✅ FIXED: SAVE EDITOR CONTENT BY BENEFITS_ID ✅✅✅
app.post('/save-editor', async (req, res) => {
  const { benefits_id, benefits_content } = req.body;

  if (!benefits_id || !benefits_content) {
    return res.status(400).json({ error: '❌ benefits_id and benefits_content required' });
  }

  try {
    await pool.query(
      'INSERT INTO benefits_data (benefits_id, benefits_content) VALUES ($1, $2)',
      [benefits_id, benefits_content]
    );

    res.status(200).json({ message: '✅ Content saved successfully' });
  } catch (error) {
    console.error('❌ Error saving content:', error);
    res.status(500).json({ error: 'Failed to save content' });
  }
});

// ========== ALTERNATIVE ROUTE: Save Benefits by ID (Already known) ==========
app.post('/saveBenefitsData', async (req, res) => {
  const { benefits_id, benefits_content } = req.body;

  if (!benefits_id || !benefits_content) {
    return res.status(400).json({ error: '❌ benefits_id and benefits_content required' });
  }

  try {
    const client = await pool.connect();

    const insertContent = 'INSERT INTO benefits_data (benefits_id, benefits_content) VALUES ($1, $2)';
    await client.query(insertContent, [benefits_id, benefits_content]);

    client.release();
    res.status(200).json({ message: '✅ Benefits content saved successfully' });
  } catch (err) {
    console.error('❌ Error saving benefits content:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ========== DELETE PDF FILE AND LOG DELETION ==========
app.post('/delete-pdf', async (req, res) => {
  const { fileName } = req.body;
  if (!fileName) return res.status(400).json({ error: '❌ File name required' });

  const filePath = path.join(uploadDir, fileName);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // File ko disk se hata dete hain
      console.log(`🗑️ File deleted: ${fileName}`);
    } else {
      console.warn('⚠️ File not found on disk:', filePath);
    }

    // Deletion log ko DB me insert kar rahe hain
    await pool.query(
      'INSERT INTO deleted_pdf (file_name, deleted_at) VALUES ($1, NOW())',
      [fileName]
    );

    res.json({ message: '✅ File deleted and logged in DB!' });
  } catch (err) {
    console.error('❌ Error deleting file:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ========== SAVE OR UPDATE USER DOCUMENTS (Medical + Plan) ==========
app.post('/save-user-documents', async (req, res) => {
  const { name, medical_content, plan_content } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM user_documents WHERE name = $1', [name]);
    let result;

    if (existing.rows.length > 0) {
      // Update existing row
      result = await pool.query(
        'UPDATE user_documents SET medical_content = $1, plan_content = $2 WHERE name = $3 RETURNING *',
        [medical_content, plan_content, name]
      );
    } else {
      // Insert new row
      result = await pool.query(
        'INSERT INTO user_documents (name, medical_content, plan_content) VALUES ($1, $2, $3) RETURNING *',
        [name, medical_content, plan_content]
      );
    }

    res.json({ message: '✅ Data saved successfully!', data: result.rows[0] });
  } catch (err) {
    console.error('❌ Error saving user documents:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ========== GET USER DOCUMENTS BY NAME ==========
app.get('/get-user-documents/:name', async (req, res) => {
  const { name } = req.params;

  try {
    const result = await pool.query('SELECT * FROM user_documents WHERE name = $1', [name]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '❌ No data found for this user.' });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('❌ Error fetching user documents:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ========== SAVE BENEFITS (with status) ==========
app.post('/save-benefits', async (req, res) => {
  const { benefits_name, status, benefits_content } = req.body;

  if (!benefits_name || !benefits_content) {
    return res.status(400).json({ error: '❌ benefits_name and benefits_content required' });
  }

  try {
    const client = await pool.connect();

    const nameResult = await client.query(
      `INSERT INTO benefits_name (benefits_name, status) 
       VALUES ($1, $2) RETURNING id`,
      [benefits_name, status || 1]
    );
    const benefits_id = nameResult.rows[0].id;

    await client.query(
      `INSERT INTO benefits_data (benefits_id, benefits_content) 
       VALUES ($1, $2)`,
      [benefits_id, benefits_content]
    );

    client.release();
    res.json({ message: '✅ Benefit inserted successfully' });
  } catch (err) {
    console.error('❌ Error saving benefit:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ========== GET ALL BENEFITS WITH JOIN ==========
app.get('/get-benefits', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        bn.id AS benefit_id,
        bn.benefits_name,
        bn.status,
        bn.created_date,
        bd.benefits_content
      FROM benefits_name bn
      JOIN benefits_data bd ON bd.benefits_id = bn.id
      ORDER BY bn.id DESC
    `);

    res.json({ data: result.rows });
  } catch (err) {
    console.error('❌ Error fetching benefits:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ========== GET BENEFIT ID BY NAME ==========
app.get('/benefit-id', async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: '❌ Benefit name is required' });
  }

  try {
    const result = await pool.query(
      'SELECT id FROM benefits_name WHERE benefits_name = $1 LIMIT 1',
      [name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '❌ Benefit name not found' });
    }

    res.json({ benefits_id: result.rows[0].id });
  } catch (err) {
    console.error('❌ Error fetching benefit ID:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ========== START THE SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

