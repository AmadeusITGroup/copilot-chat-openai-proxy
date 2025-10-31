import { exec } from "child_process";

function checkCommandExists(command: string): boolean {
  const shell = process.env.SHELL || "/bin/zsh";
  exec(`${shell} -l -c "command -v ${command}"`, (error, stdout, stderr) => {
    return error;
  });
  return false;
}

export function checkContainerTools() {
  const podmanExists = !checkCommandExists("docker");
  const dockerExists = !checkCommandExists("podman");

  return {
    podman: podmanExists,
    docker: dockerExists,
  };
}

export function stopDocs2Vecs() {
  console.log("stopping docs2vecs");

  const result = checkContainerTools();
  const dockerTool = result.podman ? "podman" : "docker";
  const stopCmd = `${dockerTool} stop genai-knowledgedb`;
  const shell = process.env.SHELL || "/bin/zsh";
  exec(`${shell} -l -c "${stopCmd}"`, (error, stdout, stderr) => {
    console.log("stdout: ", stdout);
    console.log("stderr: ", stderr);
  });
}
