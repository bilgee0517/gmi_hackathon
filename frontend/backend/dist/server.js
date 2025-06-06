"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const python_shell_1 = require("python-shell");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const uuid_1 = require("uuid");
const app = (0, express_1.default)();
const port = 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const executeHandler = async (req, res) => {
    const { code, language } = req.body;
    if (!code || !language) {
        res.status(400).json({ error: 'Code and language are required' });
        return;
    }
    try {
        switch (language) {
            case 'python':
                // Create a temporary file for the Python code
                const filename = `${(0, uuid_1.v4)()}.py`;
                const filepath = (0, path_1.join)(__dirname, 'temp', filename);
                // Write the code to the file
                await (0, promises_1.writeFile)(filepath, code);
                // Execute the Python code
                const options = {
                    mode: 'text',
                    pythonPath: 'python3',
                    pythonOptions: ['-u'], // unbuffered output
                };
                python_shell_1.PythonShell.run(filepath, options)
                    .then(messages => {
                    // Clean up the temporary file
                    (0, promises_1.unlink)(filepath).catch(console.error);
                    res.json({ output: messages.join('\n') });
                })
                    .catch(error => {
                    // Clean up the temporary file
                    (0, promises_1.unlink)(filepath).catch(console.error);
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
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
app.post('/execute', executeHandler);
// Create temp directory if it doesn't exist
const promises_2 = require("fs/promises");
(0, promises_2.mkdir)((0, path_1.join)(__dirname, 'temp'), { recursive: true }).catch(console.error);
app.listen(port, () => {
    console.log(`Code execution server running at http://localhost:${port}`);
});
