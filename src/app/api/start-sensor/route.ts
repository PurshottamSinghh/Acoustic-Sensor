import { exec } from 'child_process';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        // This points exactly to where your Python script and audio file live
        const pythonProjectDir = 'C:\\RocketHacks26\\AcousticSensorProject';

        // This command opens the terminal in the background and runs your AI
        // We added the PYTHONIOENCODING environment variable to prevent the Emoji crash!
        exec('python edgenode.py', {
            cwd: pythonProjectDir,
            env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
        }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Edge Node Execution Error: ${error}`);
                return;
            }
        });

        return NextResponse.json({ success: true, message: 'P.U.L.S.E. Edge Node Armed & Running' });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to ignite engine' }, { status: 500 });
    }
}