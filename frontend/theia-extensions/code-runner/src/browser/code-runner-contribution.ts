import { injectable } from 'inversify';
import { CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry } from '@theia/core/lib/common';
import { CommonMenus } from '@theia/core/lib/browser';
import { TerminalService } from '@theia/terminal/lib/browser/base/terminal-service';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { MessageService } from '@theia/core';

export const RunCodeCommand = {
    id: 'code-runner.run',
    label: 'Run Code'
};

@injectable()
export class CodeRunnerContribution implements CommandContribution, MenuContribution {

    constructor(
        protected readonly terminalService: TerminalService,
        protected readonly workspaceService: WorkspaceService,
        protected readonly fileService: FileService,
        protected readonly messageService: MessageService
    ) {}

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(RunCodeCommand, {
            execute: async () => {
                try {
                    // Get current workspace
                    const workspaceRoot = this.workspaceService.tryGetRoots()[0];
                    if (!workspaceRoot) {
                        this.messageService.error('No workspace found');
                        return;
                    }

                    // For demo, let's create a simple Python script and run it
                    const scriptContent = `
print("Hello from Theia code runner!")
print("Python version:")
import sys
print(sys.version)
`;
                    
                    const scriptPath = workspaceRoot.resource.resolve('temp_script.py');
                    await this.fileService.write(scriptPath, scriptContent);

                    // Create terminal and run the script
                    const terminal = await this.terminalService.newTerminal({
                        title: 'Code Runner',
                        cwd: workspaceRoot.resource
                    });
                    
                    terminal.sendText('python temp_script.py\n');
                    
                    this.messageService.info('Code executed in terminal!');
                } catch (error) {
                    this.messageService.error(`Error running code: ${error}`);
                }
            }
        });
    }

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(CommonMenus.EDIT_FIND, {
            commandId: RunCodeCommand.id,
            label: RunCodeCommand.label
        });
    }
}