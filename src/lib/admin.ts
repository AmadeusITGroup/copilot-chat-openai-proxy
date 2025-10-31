import * as fs from "fs";
import * as Handlebars from "handlebars";
import * as path from "path";

// Function to read YAML config file
function readConfig(filePath: string): any {
  const fileContents = fs.readFileSync(filePath, "utf8");
  const userConfig = JSON.parse(fileContents);

  const defaultValues = {
    "app-name": "1a-chat-participant",
    "display-name": "Amadeus chat participant",
    "app-description":
      "Chat participant is a Visual Studio Code extension that helps you bootstrap a chat participant for GitHub Copilot Chat.",
    author: "Amadeus",
    "vscode-version": "^1.95.1",
    "chat-participants": [
      {
        "chat-participant-id": "default-chat-participant",
        "chat-participant-description": "This is the default chat participant",
        commands: [
          {
            "command-name": "hello",
            "command-description": "Greets you",
          },
        ],
      },
    ],
  };

  if (defaultValues["app-name"] === userConfig["app-name"])
    {throw new Error("Please customize your config file: etc/init-config.json");}
  if (
    defaultValues["chat-participants"][0]["chat-participant-id"] ===
    userConfig["chat-participants"][0]["chat-participant-id"]
  )
    {throw new Error(
      "Please change the name of the chat participant in your config",
    );}
  return userConfig;
}

// Function to process files with Handlebars templates
function processFiles(config: any, files: string[]): void {
  files.forEach((file) => {
    if (file.includes("ChatCommandHandler")) {
      for (let chatParticipantConfig of config["chat-participants"]) {
        for (let commandConfig of chatParticipantConfig["commands"]) {
          // Read the file content
          const content = fs.readFileSync(file, "utf-8");

          commandConfig["chat-participant-id"] =
            chatParticipantConfig["chat-participant-id"];
          // Replace placeholders in the file content
          const templateContent = Handlebars.compile(content);
          const replacedContent = templateContent(commandConfig);

          // Get the directory and base name separately
          const dirName = path.dirname(file);
          const fileName = path.basename(file);

          // Apply template to filename only
          const templateFileName = Handlebars.compile(fileName);
          const replacedFileName = templateFileName(commandConfig);

          // Construct the new path properly using path.join
          const outputFilePath = path.join(
            dirName,
            replacedFileName.replace(".template", ""),
          );

          // Ensure the target directory exists
          fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });

          // Write the updated content to the output directory with the new name
          if (!fs.existsSync(outputFilePath)) {
            fs.writeFileSync(outputFilePath, replacedContent, "utf-8");
          }
        }
      }
    } else {
      // Read the file content
      const content = fs.readFileSync(file, "utf-8");

      // Replace placeholders in the file content
      let templateContent = Handlebars.compile(content);
      let replacedContent = templateContent(config);

      // Write the updated content to the output directory
      const outputFilePath = file.replace(".template", "");
      fs.writeFileSync(outputFilePath, replacedContent, "utf-8");
    }
  });
}

/**
 * Recursively retrieves all files with a `.template` extension from a specified directory,
 * excluding directories listed in the `skipFolders` set.
 *
 * @param dir - The directory to search for template files.
 * @param skipFolders - A set of folder names to skip during the search.
 * @returns An array of file paths to the template files found.
 */
function getTemplateFiles(dir: string, skipFolders: Set<string>): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const dirName = path.basename(dir);
    if (skipFolders.has(dirName)) {return;}

    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getTemplateFiles(filePath, skipFolders));
    } else if (path.extname(file) === ".template") {
      results.push(filePath);
    }
  });
  return results;
}

// Main function to run the script
function main() {
  Handlebars.registerHelper("capitalizeFirst", function (context: string) {
    if (context === undefined || context === "") {return context;}
    return context.charAt(0).toUpperCase() + context.slice(1);
  });
  Handlebars.registerHelper("normalize", function (context: string) {
    if (context === undefined || context === "") {return context;}
    return context
      .toLowerCase()
      .replace(/[-_]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""));
  });
  Handlebars.registerHelper("normalizeCapitalize", function (context: string) {
    if (context === undefined || context === "") {return context;}
    let result = context
      .toLowerCase()
      .replace(/[-_]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""));
    result = result.charAt(0).toUpperCase() + result.slice(1);
    return result;
  });
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: ts-node admin.ts <config.yml>");
    process.exit(1);
  }
  const skipFolders = new Set([
    "node_modules",
    "dist",
    "build",
    "out",
    ".vscode",
  ]);
  // const inputDir = process.cwd() + "/test-templates";
  const inputDir = process.cwd();
  console.log("Scanning for .template files in " + inputDir);
  const files = getTemplateFiles(inputDir, skipFolders);
  for (let f of files) {
    console.log(f);
  }
  const configFilePath = args[0];
  try {
    const config = readConfig(configFilePath);
    processFiles(config, files);
  } catch (error: any) {
    console.error("Error processing files:", error.message);
    process.exit(255);
  }
}

main();
