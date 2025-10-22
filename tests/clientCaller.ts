import readline from 'readline';
import axios from 'axios';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
});

function printHelp(){
    console.log("=== Simple Client Caller ===");
    console.log("Available commands:");
    console.log(`help - show this message`);
    console.log(`get - GET /api/tasks`);
    console.log(`get completed - GET /api/tasks/completed`);
    console.log(`delete - DELETE /api/tasks/completed`);
    console.log(`post <name> <priority> - POST /api/tasks with name and priority`);
    console.log(`end - exit program`);
    console.log("============================");
}

const BASE_URL = "http://localhost:3000/api/tasks";

printHelp();

async function handleCommand(cmd: string) {
    const parts = cmd.trim().split(' ');
    const command = parts[0];
    const arg1 = parts[1];
    const arg2 = parts[2];

    try {
        switch (command) {
            case 'help':
                printHelp();
                break;

            case 'get':
                if (arg1 === 'completed') {
                    const res = await axios.get(`${BASE_URL}/completed`);
                    console.log("Answer code:", res.status);
                    console.log("Answer body:", res.data);
                } else {
                    const res = await axios.get(BASE_URL);
                    console.log("Answer code:", res.status);
                    console.log("Answer body:", res.data);
                }
                break;
            
            case 'delete':
                const delRes = await axios.delete(`${BASE_URL}/completed`);
                console.log("Answer code:", delRes.status);
                break;

            case 'post':
                if (!arg1 || !arg2 || isNaN(Number(arg2))) {
                    console.log("Invalid arguments. Usage: post <name> <priority>");
                    break;
                }
                const body = {name: arg1, priority: Number(arg2)};
                const postRes = await axios.post(BASE_URL, body);
                console.log("Answer code:", postRes.status);
                break;

            case 'end':
                console.log("Exiting...");
                rl.close();
                process.exit(0);
                break;

            default:
                console.log("Unknown command. Type 'help' for a list of commands.");
        }
    }catch (err: any){
        if (err.response){
            console.log("Error code:", err.response.status);
            console.log("Error body:", err.response.data);
        } else {
            console.log("Error:", err.message);
        }
    }
}

rl.prompt();
rl.on('line', async (line) => {
    await handleCommand(line);
    rl.prompt();
});