import express, { Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import { PythonShell, Options } from 'python-shell';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const executeHandler: RequestHandler = async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    res.status(400).json({ error: 'Code and language are required' });
    return;
  }

  try {
    switch (language) {
      case 'python':
        // Create a temporary file for the Python code
        const filename = `${uuidv4()}.py`;
        const filepath = join(__dirname, 'temp', filename);
        
        // Write the code to the file
        await writeFile(filepath, code);

        // Execute the Python code
        const options: Options = {
          mode: 'text' as const,
          pythonPath: 'python3',
          pythonOptions: ['-u'], // unbuffered output
        };

        PythonShell.run(filepath, options)
          .then(messages => {
            // Clean up the temporary file
            unlink(filepath).catch(console.error);
            res.json({ output: messages.join('\n') });
          })
          .catch(error => {
            // Clean up the temporary file
            unlink(filepath).catch(console.error);
            res.status(500).json({ error: error.message });
          });
        break;

      case 'javascript':
        // For JavaScript, we'll use the existing frontend execution
        res.json({ error: 'JavaScript execution is handled on the frontend' });
        break;

      default:
        res.status(400).json({ error: 'Unsupported language' });
    }
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

app.post('/execute', executeHandler);

// Create temp directory if it doesn't exist
import { mkdir } from 'fs/promises';
mkdir(join(__dirname, 'temp'), { recursive: true }).catch(console.error);

app.listen(port, () => {
  console.log(`Code execution server running at http://localhost:${port}`);
}); 