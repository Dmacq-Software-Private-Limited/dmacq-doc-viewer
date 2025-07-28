# core/utils/command_utils.py
import asyncio

async def run_command(cmd: list[str], timeout: int = 180) -> tuple[int, str, str]:
    """Robust helper to run shell commands asynchronously with timeout"""
    try:
        process = await asyncio.wait_for(
            asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            ),
            timeout=timeout
        )
        stdout, stderr = await process.communicate()
        return (
            process.returncode,
            stdout.decode(errors='ignore'),
            stderr.decode(errors='ignore')
        )
    except asyncio.TimeoutError:
        return -1, "", f"Command '{' '.join(cmd)}' timed out after {timeout} seconds."
    except FileNotFoundError:
        return -1, "", f"Command not found: '{cmd[0]}'. Ensure it's installed and in PATH."
    except Exception as e:
        return -1, "", f"Failed to execute command '{' '.join(cmd)}'. Error: {str(e)}"